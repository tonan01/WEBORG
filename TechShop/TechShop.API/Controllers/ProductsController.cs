using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Application.Common.Models;

namespace TechShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetAll(
        [FromQuery] string? keyword = null, 
        [FromQuery] int? categoryId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var products = await _productService.GetAllProductsAsync(keyword, categoryId, page, pageSize);
        return Ok(ApiResponse<PagedResult<ProductDto>>.SuccessResult(products));
    }

    [HttpGet("all-with-deleted")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllWithDeleted(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var products = await _productService.GetAllIncludingDeletedAsync(page, pageSize);
        return Ok(ApiResponse<PagedResult<ProductDto>>.SuccessResult(products));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _productService.GetProductByIdAsync(id);
        if (product == null) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy sản phẩm."));
        return Ok(ApiResponse<ProductDto>.SuccessResult(product));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
    {
        var product = await _productService.CreateProductAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, ApiResponse<ProductDto>.SuccessResult(product, "Tạo sản phẩm thành công"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
    {
        var result = await _productService.UpdateProductAsync(id, dto);
        if (!result) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy sản phẩm để cập nhật."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Cập nhật sản phẩm thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _productService.DeleteProductAsync(id);
        if (!result) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy sản phẩm để xóa."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Xóa sản phẩm thành công"));
    }

    [HttpPatch("{id}/restore")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Restore(int id)
    {
        var result = await _productService.RestoreProductAsync(id);
        if (!result) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy sản phẩm để khôi phục."));
        return Ok(ApiResponse<object>.SuccessResult(null, "Sản phẩm đã được khôi phục"));
    }
}
