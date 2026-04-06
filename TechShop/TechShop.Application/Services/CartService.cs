using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;

namespace TechShop.Application.Services;

public class CartService : ICartService
{
    private readonly IRepository<Cart> _cartRepo;
    private readonly IRepository<CartItem> _cartItemRepo;
    private readonly IRepository<Product> _productRepo;
    private readonly IMapper _mapper;

    public CartService(IRepository<Cart> cartRepo,
                       IRepository<CartItem> cartItemRepo,
                       IRepository<Product> productRepo,
                       IMapper mapper)
    {
        _cartRepo = cartRepo;
        _cartItemRepo = cartItemRepo;
        _productRepo = productRepo;
        _mapper = mapper;
    }

    private async Task<Cart> GetOrCreateCartAsync(int userId)
    {
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

        var cartItems = (await _cartItemRepo.GetAllWithIncludesAsync(ci => ci.Product))
                            .Where(ci => ci.CartId == cart.Id)
                            .ToList();

        var cartDto = new CartDto
        {
            UserId = userId,
            Items = _mapper.Map<List<CartItemDto>>(cartItems),
            TotalPrice = cartItems.Where(ci => ci.Product != null).Sum(ci => ci.Product.Price * ci.Quantity)
        };

        return cartDto;
    }

    public async Task<bool> AddToCartAsync(int userId, AddToCartDto dto)
    {
        var cart = await GetOrCreateCartAsync(userId);
        var product = await _productRepo.GetByIdAsync(dto.ProductId);
        if (product == null || product.Stock < dto.Quantity) return false;

        var item = await _cartItemRepo.FindAsync(ci => ci.CartId == cart.Id && ci.ProductId == dto.ProductId);

        if (item != null)
        {
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

        var cart = await _cartRepo.GetByIdAsync(item.CartId);
        if (cart == null || cart.UserId != userId) return false;

        await _cartItemRepo.DeleteAsync(cartItemId);
        return true;
    }
}
