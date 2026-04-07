using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Application.Common.Models;

namespace TechShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
    {
        try
        {
            var order = await _orderService.CreateOrderFromCartAsync(GetUserId(), dto);
            return Ok(ApiResponse<OrderDto>.SuccessResult(order, "Đặt hàng thành công"));
        }
        catch (System.InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.FailureResult(ex.Message));
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetOrderHistory(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var orders = await _orderService.GetUserOrdersAsync(GetUserId(), page, pageSize);
        return Ok(ApiResponse<PagedResult<OrderDto>>.SuccessResult(orders));
    }

    // Hành động của Admin
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var orders = await _orderService.GetAllOrdersAsync(status, page, pageSize);
        return Ok(ApiResponse<PagedResult<OrderDto>>.SuccessResult(orders));
    }

    [HttpGet("admin/stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAdminStats()
    {
        var stats = await _orderService.GetDashboardStatsAsync();
        return Ok(ApiResponse<AdminStatsDto>.SuccessResult(stats));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var result = await _orderService.UpdateOrderStatusAsync(id, status);
        if (!result) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy đơn hàng."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Cập nhật trạng thái thành công"));
    }
}
