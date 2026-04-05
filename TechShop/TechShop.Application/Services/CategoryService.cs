using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;

namespace TechShop.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IRepository<Category> _categoryRepo;

    public CategoryService(IRepository<Category> categoryRepo)
    {
        _categoryRepo = categoryRepo;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
    {
        // ✅ Cây quan hệ: Category kèm ParentCategory (Include)
        var categories = await _categoryRepo.GetAllWithIncludesAsync(c => c.ParentCategory!);
        return categories.Select(MapToDto);
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _categoryRepo.GetByIdWithIncludesAsync(id, c => c.ParentCategory!);
        return category == null ? null : MapToDto(category);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            ParentCategoryId = dto.ParentCategoryId
        };
        await _categoryRepo.AddAsync(category);

        // Load lại để có tên ParentCategory
        var created = await _categoryRepo.GetByIdWithIncludesAsync(category.Id, c => c.ParentCategory!);
        return MapToDto(created ?? category);
    }

    public async Task<bool> UpdateCategoryAsync(int id, CategoryUpdateDto dto)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null) return false;

        category.Name = dto.Name;
        category.Description = dto.Description;
        category.ImageUrl = dto.ImageUrl;
        category.ParentCategoryId = dto.ParentCategoryId;

        await _categoryRepo.UpdateAsync(category);
        return true;
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var category = await _categoryRepo.GetByIdIgnoreFiltersAsync(id);
        if (category == null) return false;

        // Lưu ý: Nếu có sản phẩm thuộc danh mục này, DB sẽ chặn do RESTRICT trong DbContext
        await _categoryRepo.DeleteAsync(id);
        return true;
    }

    public async Task<List<int>> GetCategoryIdsRecursiveAsync(int parentId)
    {
        var result = new List<int> { parentId };
        var allCategories = await _categoryRepo.GetAllAsync(); // Lấy tất cả để xử lý đệ quy trong memory
        GetChildIds(parentId, allCategories.ToList(), result);
        return result;
    }

    private void GetChildIds(int parentId, List<Category> allCategories, List<int> result)
    {
        var children = allCategories.Where(c => c.ParentCategoryId == parentId).Select(c => c.Id).ToList();
        foreach (var childId in children)
        {
            result.Add(childId);
            GetChildIds(childId, allCategories, result);
        }
    }

    private static CategoryDto MapToDto(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Description = c.Description,
        ImageUrl = c.ImageUrl,
        ParentCategoryId = c.ParentCategoryId,
        // ✅ Hiển thị tên danh mục cha
        ParentCategoryName = c.ParentCategory?.Name,
        IsDeleted = c.IsDeleted
    };
}
