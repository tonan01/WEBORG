using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;

namespace TechShop.Application.Services;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync(string? keyword = null);
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(ProductCreateDto dto);
    Task<bool> UpdateProductAsync(int id, ProductUpdateDto dto);
    Task<bool> DeleteProductAsync(int id);
    /// <summary>Chỉ dành cho Admin - bao gồm cả sản phẩm đã xóa mềm</summary>
    Task<IEnumerable<ProductDto>> GetAllIncludingDeletedAsync();
}

public class ProductService : IProductService
{
    private readonly IRepository<Product> _productRepo;

    public ProductService(IRepository<Product> productRepo)
    {
        _productRepo = productRepo;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync(string? keyword = null)
    {
        // ✅ Cây: Products → Category (dùng Include — 1 query duy nhất, không phải 2)
        var products = await _productRepo.GetAllWithIncludesAsync(p => p.Category);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            products = products.Where(p =>
                p.Name.Contains(keyword, System.StringComparison.OrdinalIgnoreCase) ||
                (p.Description?.Contains(keyword, System.StringComparison.OrdinalIgnoreCase) ?? false) ||
                (p.SKU?.Contains(keyword, System.StringComparison.OrdinalIgnoreCase) ?? false));
        }

        return products.Select(MapToDto);
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        // ✅ Cây: Product → Category
        var product = await _productRepo.GetByIdWithIncludesAsync(id, p => p.Category);
        return product == null ? null : MapToDto(product);
    }

    public async Task<ProductDto> CreateProductAsync(ProductCreateDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            SKU = dto.SKU,
            ImageUrl = dto.ImageUrl,
            CategoryId = dto.CategoryId
        };
        await _productRepo.AddAsync(product);

        // Load lại để có Category name
        var created = await _productRepo.GetByIdWithIncludesAsync(product.Id, p => p.Category);
        return MapToDto(created ?? product);
    }

    public async Task<bool> UpdateProductAsync(int id, ProductUpdateDto dto)
    {
        var product = await _productRepo.GetByIdAsync(id);
        if (product == null) return false;

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.SKU = dto.SKU;
        product.ImageUrl = dto.ImageUrl;
        product.CategoryId = dto.CategoryId;

        await _productRepo.UpdateAsync(product);
        return true;
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _productRepo.GetByIdAsync(id);
        if (product == null) return false;
        await _productRepo.DeleteAsync(id);
        return true;
    }

    public async Task<IEnumerable<ProductDto>> GetAllIncludingDeletedAsync()
    {
        // ✅ Truy cập repository bypass query filter
        var products = await _productRepo.GetAllIgnoreFiltersAsync();
        return products.Select(MapToDto);
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        Description = p.Description,
        Price = p.Price,
        Stock = p.Stock,
        SKU = p.SKU,
        ImageUrl = p.ImageUrl,
        CategoryId = p.CategoryId,
        // ✅ Truy cập Category trực tiếp qua navigation property — không cần join thủ công
        CategoryName = p.Category?.Name ?? "Unknown"
    };
}
