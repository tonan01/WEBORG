using System.Threading.Tasks;
using TechShop.Application.DTOs;

namespace TechShop.Application.Interfaces;

public interface ICartService
{
    Task<CartDto> GetCartByUserIdAsync(int userId);
    Task<bool> AddToCartAsync(int userId, AddToCartDto dto);
    Task<bool> UpdateQuantityAsync(int userId, int cartItemId, int quantity);
    Task<bool> RemoveFromCartAsync(int userId, int cartItemId);
}
