using System.Collections.Generic;
using System.Threading.Tasks;
using TechShop.Application.DTOs;

namespace TechShop.Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto?> CreateOrderFromCartAsync(int userId, CheckoutDto checkoutDto);
    Task<PagedResult<OrderDto>> GetUserOrdersAsync(int userId, int pageNumber = 1, int pageSize = 10);
    // Quyền Admin
    Task<PagedResult<OrderDto>> GetAllOrdersAsync(int pageNumber = 1, int pageSize = 10);
    Task<bool> UpdateOrderStatusAsync(int orderId, string status);
    Task<AdminStatsDto> GetDashboardStatsAsync();
}
