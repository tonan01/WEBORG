using System.Linq;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;

namespace TechShop.Application.Services;

public interface ICartService
{
    Task<CartDto> GetCartByUserIdAsync(int userId);
    Task<bool> AddToCartAsync(int userId, AddToCartDto dto);
    Task<bool> UpdateQuantityAsync(int userId, int cartItemId, int quantity);
    Task<bool> RemoveFromCartAsync(int userId, int cartItemId);
}

public class CartService : ICartService
{
    private readonly IRepository<Cart> _cartRepo;
    private readonly IRepository<CartItem> _cartItemRepo;
    private readonly IRepository<Product> _productRepo;

    public CartService(IRepository<Cart> cartRepo,
                       IRepository<CartItem> cartItemRepo,
                       IRepository<Product> productRepo)
    {
        _cartRepo = cartRepo;
        _cartItemRepo = cartItemRepo;
        _productRepo = productRepo;
    }

    private async Task<Cart> GetOrCreateCartAsync(int userId)
    {
        // ✅ FindAsync — query thẳng DB, không load cả bảng Carts vào memory
        var cart = await _cartRepo.FindAsync(c => c.UserId == userId);
        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _cartRepo.AddAsync(cart);
        }
        return cart;
    }

    public async Task<CartDto> GetCartByUserIdAsync(int userId)
    {
        var cart = await GetOrCreateCartAsync(userId);

        // ✅ Cây: CartItems → Product (Include — 1 query JOIN thay vì 2 query riêng)
        var cartItems = (await _cartItemRepo.GetAllWithIncludesAsync(ci => ci.Product))
                            .Where(ci => ci.CartId == cart.Id)
                            .ToList();

        var cartDto = new CartDto { UserId = userId };

        foreach (var item in cartItems)
        {
            if (item.Product != null)
            {
                cartDto.Items.Add(new CartItemDto
                {
                    Id = item.Id,
                    ProductId = item.Product.Id,
                    ProductName = item.Product.Name,
                    UnitPrice = item.Product.Price,
                    Quantity = item.Quantity
                });
                cartDto.TotalPrice += item.Product.Price * item.Quantity;
            }
        }
        return cartDto;
    }

    public async Task<bool> AddToCartAsync(int userId, AddToCartDto dto)
    {
        var cart = await GetOrCreateCartAsync(userId);
        var product = await _productRepo.GetByIdAsync(dto.ProductId);
        if (product == null || product.Stock < dto.Quantity) return false;

        // ✅ FindAsync — query thẳng DB, không load cả bảng CartItems
        var item = await _cartItemRepo.FindAsync(ci => ci.CartId == cart.Id && ci.ProductId == dto.ProductId);

        if (item != null)
        {
            // Kiểm tra tổng số lượng sau khi cộng thêm không vượt tồn kho
            if (item.Quantity + dto.Quantity > product.Stock) return false;
            item.Quantity += dto.Quantity;
            await _cartItemRepo.UpdateAsync(item);
        }
        else
        {
            item = new CartItem
            {
                CartId = cart.Id,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            };
            await _cartItemRepo.AddAsync(item);
        }
        return true;
    }

    public async Task<bool> UpdateQuantityAsync(int userId, int cartItemId, int quantity)
    {
        var item = await _cartItemRepo.GetByIdAsync(cartItemId);
        if (item == null) return false;

        // ✅ Verify ownership — chỉ cho phép sửa CartItem thuộc về cart của chính user
        var cart = await _cartRepo.GetByIdAsync(item.CartId);
        if (cart == null || cart.UserId != userId) return false;

        if (quantity <= 0)
            await _cartItemRepo.DeleteAsync(cartItemId);
        else
        {
            item.Quantity = quantity;
            await _cartItemRepo.UpdateAsync(item);
        }
        return true;
    }

    public async Task<bool> RemoveFromCartAsync(int userId, int cartItemId)
    {
        var item = await _cartItemRepo.GetByIdAsync(cartItemId);
        if (item == null) return false;

        // ✅ Verify ownership — chỉ cho phép xóa CartItem thuộc về cart của chính user
        var cart = await _cartRepo.GetByIdAsync(item.CartId);
        if (cart == null || cart.UserId != userId) return false;

        await _cartItemRepo.DeleteAsync(cartItemId);
        return true;
    }
}
