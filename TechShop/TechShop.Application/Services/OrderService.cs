using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;

namespace TechShop.Application.Services;

public class OrderService : IOrderService
{
    private readonly IRepository<Order> _orderRepo;
    private readonly IRepository<OrderDetail> _orderDetailRepo;
    private readonly ICartService _cartService;
    private readonly IRepository<CartItem> _cartItemRepo;
    private readonly IRepository<Product> _productRepo;
    private readonly IRepository<Category> _categoryRepo;
    private readonly IMapper _mapper;

    public OrderService(IRepository<Order> orderRepo,
                        IRepository<OrderDetail> orderDetailRepo,
                        ICartService cartService,
                        IRepository<CartItem> cartItemRepo,
                        IRepository<Product> productRepo,
                        IRepository<Category> categoryRepo,
                        IMapper mapper)
    {
        _orderRepo = orderRepo;
        _orderDetailRepo = orderDetailRepo;
        _cartService = cartService;
        _cartItemRepo = cartItemRepo;
        _productRepo = productRepo;
        _categoryRepo = categoryRepo;
        _mapper = mapper;
    }

    public async Task<OrderDto?> CreateOrderFromCartAsync(int userId, CheckoutDto checkoutDto)
    {
        var cartDto = await _cartService.GetCartByUserIdAsync(userId);
        if (!cartDto.Items.Any()) throw new InvalidOperationException("Giỏ hàng của bạn đang trống.");

        await _orderRepo.BeginTransactionAsync();

        try
        {
            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = cartDto.TotalPrice,
                Status = "Pending",
                ShippingAddress = checkoutDto.ShippingAddress,
                PaymentMethod = checkoutDto.PaymentMethod,
                Note = checkoutDto.Note,
            };

            // Lưu Order trước để có Id (saveChanges: true để lấy Identity Id)
            await _orderRepo.AddAsync(order);

            foreach (var item in cartDto.Items)
            {
                // Re-fetch product bên trong transaction để đảm bảo stock chính xác nhất (Tránh Race Condition)
                var product = await _productRepo.GetByIdAsync(item.ProductId);
                if (product == null || product.Stock < item.Quantity)
                {
                    await _orderRepo.RollbackTransactionAsync();
                    throw new InvalidOperationException($"Sản phẩm '{item.ProductName}' không đủ tồn kho (Chỉ còn {product?.Stock ?? 0}).");
                }

                var detail = new OrderDetail
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    ProductName = product.Name,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    DiscountAmount = 0
                };

                // AddWithoutSave (saveChanges: false)
                await _orderDetailRepo.AddAsync(detail, saveChanges: false);

                // Update Stock (saveChanges: false)
                product.Stock -= item.Quantity;
                await _productRepo.UpdateAsync(product, saveChanges: false);

                // Delete CartItem (saveChanges: false)
                await _cartItemRepo.DeleteAsync(item.Id, saveChanges: false);
            }

            // Commit tất cả thay đổi trong 1 lần SaveChanges duy nhất
            await _orderRepo.SaveChangesAsync();
            await _orderRepo.CommitTransactionAsync();

            return await GetOrderByIdAsync(order.Id);
        }
        catch (Exception)
        {
            await _orderRepo.RollbackTransactionAsync();
            throw;
        }
    }

    public async Task<PagedResult<OrderDto>> GetUserOrdersAsync(int userId, int pageNumber = 1, int pageSize = 10)
    {
        var query = _orderRepo.GetQueryable(o => o.OrderDetails)
            .Where(o => o.UserId == userId);
        
        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.OrderDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = _mapper.Map<IEnumerable<OrderDto>>(items);
        return new PagedResult<OrderDto>(dtos, totalCount, pageNumber, pageSize);
    }

    public async Task<PagedResult<OrderDto>> GetAllOrdersAsync(int pageNumber = 1, int pageSize = 10)
    {
        var query = _orderRepo.GetQueryable(o => o.OrderDetails);
        
        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.OrderDate)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = _mapper.Map<IEnumerable<OrderDto>>(items);
        return new PagedResult<OrderDto>(dtos, totalCount, pageNumber, pageSize);
    }

    public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
    {
        var order = await _orderRepo.GetByIdAsync(orderId);
        if (order == null) return false;

        order.Status = status;

        // Tự động cập nhật mốc thời gian
        if (status.Equals("Shipped", StringComparison.OrdinalIgnoreCase))
            order.ShippedDate = DateTime.UtcNow;
        else if (status.Equals("Delivered", StringComparison.OrdinalIgnoreCase))
            order.DeliveredDate = DateTime.UtcNow;

        await _orderRepo.UpdateAsync(order);
        return true;
    }

    public async Task<AdminStatsDto> GetDashboardStatsAsync()
    {
        var orderQuery = _orderRepo.GetQueryable();
        var productCount = await _productRepo.GetQueryable().CountAsync();
        var categoryCount = await _categoryRepo.GetQueryable().CountAsync();

        var deliveredOrders = orderQuery.Where(o => o.Status == "Delivered");

        var stats = new AdminStatsDto
        {
            TotalRevenue = await deliveredOrders.SumAsync(o => o.TotalAmount),
            TotalOrders = await orderQuery.CountAsync(),
            TotalProducts = productCount,
            TotalCategories = categoryCount
        };

        // Thống kê doanh thu theo tháng (12 tháng gần nhất)
        var months = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        var now = DateTime.UtcNow;
        
        // Load các đơn hàng đã giao trong 12 tháng qua một lần duy nhất để tối ưu
        var startDate = new DateTime(now.Year, now.Month, 1).AddMonths(-11);
        var recentOrders = await deliveredOrders
            .Where(o => o.OrderDate >= startDate)
            .Select(o => new { o.OrderDate, o.TotalAmount })
            .ToListAsync();

        for (int i = 0; i < 12; i++)
        {
            var date = startDate.AddMonths(i);
            var revenue = recentOrders
                .Where(o => o.OrderDate.Month == date.Month && o.OrderDate.Year == date.Year)
                .Sum(o => o.TotalAmount);
            
            stats.MonthlyRevenue.Add(new MonthlyRevenueDto
            {
                Month = months[date.Month - 1] + " " + (date.Year % 100),
                Revenue = revenue
            });
        }

        return stats;
    }

    private async Task<OrderDto> GetOrderByIdAsync(int orderId)
    {
        // Cây: Order → OrderDetails
        var order = await _orderRepo.GetByIdWithIncludesAsync(orderId, o => o.OrderDetails);
        return _mapper.Map<OrderDto>(order!);
    }
}
