using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;

namespace TechShop.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IRepository<Category> _categoryRepo;
    private readonly IMapper _mapper;

    public CategoryService(IRepository<Category> categoryRepo, IMapper mapper)
    {
        _categoryRepo = categoryRepo;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
    {
        // Cây quan hệ: Category kèm ParentCategory (Include)
        var categories = await _categoryRepo.GetAllWithIncludesAsync(c => c.ParentCategory!);
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        var category = await _categoryRepo.GetByIdWithIncludesAsync(id, c => c.ParentCategory!);
        return _mapper.Map<CategoryDto?>(category);
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto)
    {
        var category = _mapper.Map<Category>(dto);
        await _categoryRepo.AddAsync(category);

        // Load lại để có tên ParentCategory
        var created = await _categoryRepo.GetByIdWithIncludesAsync(category.Id, c => c.ParentCategory!);
        return _mapper.Map<CategoryDto>(created ?? category);
    }

    public async Task<bool> UpdateCategoryAsync(int id, CategoryUpdateDto dto)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null) return false;

        _mapper.Map(dto, category);

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
        
        // Chỉ lấy Id và ParentId để tối ưu bộ nhớ khi xử lý đệ quy
        var allCategoryRefs = await _categoryRepo.GetQueryable()
            .Select(c => new { c.Id, c.ParentCategoryId })
            .ToListAsync();
            
        GetChildIds(parentId, allCategoryRefs, result);
        return result;
    }

    private void GetChildIds(int parentId, IEnumerable<dynamic> allCategories, List<int> result)
    {
        var children = allCategories.Where(c => c.ParentCategoryId == parentId).Select(c => (int)c.Id).ToList();
        foreach (var childId in children)
        {
            result.Add(childId);
            GetChildIds(childId, allCategories, result);
        }
    }
}
