using System.Collections.Generic;
using System.Threading.Tasks;
using TechShop.Application.DTOs;

namespace TechShop.Application.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto?> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto);
    Task<bool> UpdateCategoryAsync(int id, CategoryUpdateDto dto);
    Task<bool> DeleteCategoryAsync(int id);
    Task<List<int>> GetCategoryIdsRecursiveAsync(int parentId);
}
