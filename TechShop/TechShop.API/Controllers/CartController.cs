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
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<IActionResult> GetMyCart()
    {
        var cart = await _cartService.GetCartByUserIdAsync(GetUserId());
        return Ok(ApiResponse<CartDto>.SuccessResult(cart));
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var success = await _cartService.AddToCartAsync(GetUserId(), dto);
        if (!success) return BadRequest(ApiResponse<object>.FailureResult("Không thể thêm vào giỏ hàng. Sản phẩm không tồn tại."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Đã thêm vào giỏ hàng"));
    }

    [HttpPut("update/{cartItemId}")]
    public async Task<IActionResult> UpdateQuantity(int cartItemId, [FromBody] int quantity)
    {
        var success = await _cartService.UpdateQuantityAsync(GetUserId(), cartItemId, quantity);
        if (!success) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy mục trong giỏ hàng."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Đã cập nhật số lượng"));
    }

    [HttpDelete("remove/{cartItemId}")]
    public async Task<IActionResult> RemoveFromCart(int cartItemId)
    {
        var success = await _cartService.RemoveFromCartAsync(GetUserId(), cartItemId);
        if (!success) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy mục cần xóa."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Đã xóa khỏi giỏ hàng"));
    }
}
