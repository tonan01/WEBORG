using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;

namespace TechShop.Application.Services;

public class ProductService : IProductService
{
    private readonly IRepository<Product> _productRepo;
    private readonly ICategoryService _categoryService;
    private readonly IMapper _mapper;

    public ProductService(IRepository<Product> productRepo, ICategoryService categoryService, IMapper mapper)
    {
        _productRepo = productRepo;
        _categoryService = categoryService;
        _mapper = mapper;
    }

    public async Task<PagedResult<ProductDto>> GetAllProductsAsync(string? keyword = null, int? categoryId = null, int pageNumber = 1, int pageSize = 12)
    {
        var query = _productRepo.GetQueryable(p => p.Category);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            // Keyword search (EF Core translates this to LIKE %keyword%)
            query = query.Where(p =>
                p.Name.Contains(keyword) ||
                (p.Description != null && p.Description.Contains(keyword)) ||
                (p.SKU != null && p.SKU.Contains(keyword)));
        }

        if (categoryId.HasValue)
        {
            var categoryIds = await _categoryService.GetCategoryIdsRecursiveAsync(categoryId.Value);
            query = query.Where(p => categoryIds.Contains(p.CategoryId));
        }

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = _mapper.Map<IEnumerable<ProductDto>>(items);
        return new PagedResult<ProductDto>(dtos, totalCount, pageNumber, pageSize);
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        // Cây: Product → Category
        var product = await _productRepo.GetByIdWithIncludesAsync(id, p => p.Category);
        return _mapper.Map<ProductDto?>(product);
    }

    public async Task<ProductDto> CreateProductAsync(ProductCreateDto dto)
    {
        var product = _mapper.Map<Product>(dto);
        await _productRepo.AddAsync(product);

        // Load lại để có Category name
        var created = await _productRepo.GetByIdWithIncludesAsync(product.Id, p => p.Category);
        return _mapper.Map<ProductDto>(created ?? product);
    }

    public async Task<bool> UpdateProductAsync(int id, ProductUpdateDto dto)
    {
        var product = await _productRepo.GetByIdIgnoreFiltersAsync(id);
        if (product == null) return false;

        _mapper.Map(dto, product);

        await _productRepo.UpdateAsync(product);
        return true;
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _productRepo.GetByIdIgnoreFiltersAsync(id);
        if (product == null) return false;
        await _productRepo.DeleteAsync(id);
        return true;
    }

    public async Task<bool> RestoreProductAsync(int id)
    {
        var product = await _productRepo.GetByIdIgnoreFiltersAsync(id);
        if (product != null && !product.IsDeleted) return true; // Đã tồn tại và chưa xóa

        await _productRepo.RestoreAsync(id);
        return true;
    }

    public async Task<PagedResult<ProductDto>> GetAllIncludingDeletedAsync(int pageNumber = 1, int pageSize = 10)
    {
        var query = _productRepo.GetQueryableIgnoreFilters(p => p.Category);
        
        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var dtos = _mapper.Map<IEnumerable<ProductDto>>(items);
        return new PagedResult<ProductDto>(dtos, totalCount, pageNumber, pageSize);
    }
}
