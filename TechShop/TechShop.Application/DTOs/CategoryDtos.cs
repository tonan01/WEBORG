using System.ComponentModel.DataAnnotations;

namespace TechShop.Application.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public int? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
    public bool IsDeleted { get; set; }
}

public class CategoryCreateDto
{
    [Required(ErrorMessage = "Tên danh mục là bắt buộc")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public int? ParentCategoryId { get; set; }
}

public class CategoryUpdateDto
{
    [Required(ErrorMessage = "Tên danh mục là bắt buộc")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public int? ParentCategoryId { get; set; }
}
