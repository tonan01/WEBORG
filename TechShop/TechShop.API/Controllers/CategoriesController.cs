using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Application.Common.Models;

namespace TechShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
    {
        var categories = await _categoryService.GetAllCategoriesAsync();
        return Ok(ApiResponse<IEnumerable<CategoryDto>>.SuccessResult(categories));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await _categoryService.GetCategoryByIdAsync(id);
        if (category == null) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy danh mục."));
        return Ok(ApiResponse<CategoryDto>.SuccessResult(category));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CategoryCreateDto dto)
    {
        var category = await _categoryService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, ApiResponse<CategoryDto>.SuccessResult(category, "Tạo danh mục thành công"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CategoryUpdateDto dto)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, dto);
        if (!result) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy danh mục để cập nhật."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Cập nhật danh mục thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _categoryService.DeleteCategoryAsync(id);
        if (!result) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy danh mục để xóa."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Xóa danh mục thành công"));
    }
}
