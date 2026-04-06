using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;

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
        return Ok(cart);
    }

    [HttpPost("add")]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var success = await _cartService.AddToCartAsync(GetUserId(), dto);
        if (!success) return BadRequest("Failed to add to cart. Product may not exist.");
        return Ok(new { Message = "Added to cart" });
    }

    [HttpPut("update/{cartItemId}")]
    public async Task<IActionResult> UpdateQuantity(int cartItemId, [FromBody] int quantity)
    {
        var success = await _cartService.UpdateQuantityAsync(GetUserId(), cartItemId, quantity);
        if (!success) return NotFound();
        return Ok(new { Message = "Quantity updated" });
    }

    [HttpDelete("remove/{cartItemId}")]
    public async Task<IActionResult> RemoveFromCart(int cartItemId)
    {
        var success = await _cartService.RemoveFromCartAsync(GetUserId(), cartItemId);
        if (!success) return NotFound();
        return Ok(new { Message = "Removed from cart" });
    }
}
