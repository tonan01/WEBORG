using System.Collections.Generic;
using System.Threading.Tasks;
using TechShop.Application.DTOs;

namespace TechShop.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetAllProductsAsync(string? keyword = null, int? categoryId = null, int pageNumber = 1, int pageSize = 12);
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto> CreateProductAsync(ProductCreateDto dto);
    Task<bool> UpdateProductAsync(int id, ProductUpdateDto dto);
    Task<bool> DeleteProductAsync(int id);
    Task<bool> RestoreProductAsync(int id);
    /// <summary>Chỉ dành cho Admin - bao gồm cả sản phẩm đã xóa mềm</summary>
    Task<PagedResult<ProductDto>> GetAllIncludingDeletedAsync(int pageNumber = 1, int pageSize = 10);
}
