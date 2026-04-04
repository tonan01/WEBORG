using TechShop.Application.DTOs;

namespace TechShop.Application.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto);
    Task<bool> UpdateCategoryAsync(int id, CategoryUpdateDto dto);
    Task<bool> DeleteCategoryAsync(int id);
}
