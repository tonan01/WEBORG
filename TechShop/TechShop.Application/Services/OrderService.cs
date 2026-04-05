using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;

namespace TechShop.Application.Services;

public interface IOrderService
{
    Task<OrderDto?> CreateOrderFromCartAsync(int userId, CheckoutDto checkoutDto);
    Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId);
    // ✅ Quyền Admin
    Task<IEnumerable<OrderDto>> GetAllOrdersAsync();
    Task<bool> UpdateOrderStatusAsync(int orderId, string status);
    Task<AdminStatsDto> GetDashboardStatsAsync();
}

public class OrderService : IOrderService
{
    private readonly IRepository<Order> _orderRepo;
    private readonly IRepository<OrderDetail> _orderDetailRepo;
    private readonly ICartService _cartService;
    private readonly IRepository<CartItem> _cartItemRepo;
    private readonly IRepository<Product> _productRepo;
    private readonly IRepository<Category> _categoryRepo;

    public OrderService(IRepository<Order> orderRepo,
                        IRepository<OrderDetail> orderDetailRepo,
                        ICartService cartService,
                        IRepository<CartItem> cartItemRepo,
                        IRepository<Product> productRepo,
                        IRepository<Category> categoryRepo)
    {
        _orderRepo = orderRepo;
        _orderDetailRepo = orderDetailRepo;
        _cartService = cartService;
        _cartItemRepo = cartItemRepo;
        _productRepo = productRepo;
        _categoryRepo = categoryRepo;
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

            // ✅ Lưu Order trước để có Id (saveChanges: true để lấy Identity Id)
            await _orderRepo.AddAsync(order);

            foreach (var item in cartDto.Items)
            {
                // ✅ Re-fetch product bên trong transaction để đảm bảo stock chính xác nhất (Tránh Race Condition)
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

                // ✅ AddWithoutSave (saveChanges: false)
                await _orderDetailRepo.AddAsync(detail, saveChanges: false);

                // ✅ Update Stock (saveChanges: false)
                product.Stock -= item.Quantity;
                await _productRepo.UpdateAsync(product, saveChanges: false);

                // ✅ Delete CartItem (saveChanges: false)
                await _cartItemRepo.DeleteAsync(item.Id, saveChanges: false);
            }

            // ✅ Commit tất cả thay đổi trong 1 lần SaveChanges duy nhất
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

    public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(int userId)
    {
        // ✅ Cây: Orders → OrderDetails (Include — không cần query thêm)
        var allOrders = await _orderRepo.GetAllWithIncludesAsync(o => o.OrderDetails);
        var userOrders = allOrders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.OrderDate)
            .ToList();

        return userOrders.Select(MapOrderToDto).ToList();
    }

    public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
    {
        // ✅ Admin sees everything
        var orders = await _orderRepo.GetAllWithIncludesAsync(o => o.OrderDetails);
        return orders
            .OrderByDescending(o => o.OrderDate)
            .Select(MapOrderToDto)
            .ToList();
    }

    public async Task<bool> UpdateOrderStatusAsync(int orderId, string status)
    {
        var order = await _orderRepo.GetByIdAsync(orderId);
        if (order == null) return false;

        order.Status = status;

        // ✅ Tự động cập nhật mốc thời gian
        if (status.Equals("Shipped", StringComparison.OrdinalIgnoreCase))
            order.ShippedDate = DateTime.UtcNow;
        else if (status.Equals("Delivered", StringComparison.OrdinalIgnoreCase))
            order.DeliveredDate = DateTime.UtcNow;

        await _orderRepo.UpdateAsync(order);
        return true;
    }

    public async Task<AdminStatsDto> GetDashboardStatsAsync()
    {
        var orders = await _orderRepo.GetAllAsync();
        var products = await _productRepo.GetAllAsync();
        var categories = await _categoryRepo.GetAllAsync();

        var stats = new AdminStatsDto
        {
            TotalRevenue = orders.Sum(o => o.TotalAmount),
            TotalOrders = orders.Count(),
            TotalProducts = products.Count(),
            TotalCategories = categories.Count()
        };

        // Thống kê doanh thu theo tháng (12 tháng gần nhất)
        var months = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
        var now = DateTime.UtcNow;
        
        for (int i = 0; i < 12; i++)
        {
            var date = now.AddMonths(-(11 - i));
            var monthOrders = orders.Where(o => o.OrderDate.Month == date.Month && o.OrderDate.Year == date.Year);
            
            stats.MonthlyRevenue.Add(new MonthlyRevenueDto
            {
                Month = months[date.Month - 1] + " " + (date.Year % 100),
                Revenue = monthOrders.Sum(o => o.TotalAmount)
            });
        }

        return stats;
    }

    private async Task<OrderDto> GetOrderByIdAsync(int orderId)
    {
        // ✅ Cây: Order → OrderDetails
        var order = await _orderRepo.GetByIdWithIncludesAsync(orderId, o => o.OrderDetails);
        if (order == null) return null!;
        return MapOrderToDto(order);
    }

    private static OrderDto MapOrderToDto(Order order) => new()
    {
        Id = order.Id,
        UserId = order.UserId,
        OrderDate = order.OrderDate,
        TotalAmount = order.TotalAmount,
        Status = order.Status,
        ShippingAddress = order.ShippingAddress,
        PaymentMethod = order.PaymentMethod,
        Note = order.Note,
        ShippedDate = order.ShippedDate,
        DeliveredDate = order.DeliveredDate,
        // ✅ OrderDetails available via navigation property — no extra query needed
        Details = order.OrderDetails.Select(d => new OrderDetailDto
        {
            ProductId = d.ProductId,
            ProductName = d.ProductName,
            Quantity = d.Quantity,
            UnitPrice = d.UnitPrice,
            DiscountAmount = d.DiscountAmount
        }).ToList()
    };
}
