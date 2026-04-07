using System.ComponentModel.DataAnnotations;

namespace TechShop.Application.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? SKU { get; set; }
    public string? ImageUrl { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
}

public class ProductCreateDto
{
    [Required(ErrorMessage = "Tên sản phẩm là bắt buộc")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Range(0, 1000000000, ErrorMessage = "Giá sản phẩm phải từ 0 đến 1 tỷ")]
    public decimal Price { get; set; }

    [Range(0, 1000000, ErrorMessage = "Số lượng tồn kho không được âm")]
    public int Stock { get; set; }

    [MaxLength(50)]
    public string? SKU { get; set; }

    public string? ImageUrl { get; set; }

    [Required]
    public int CategoryId { get; set; }
}

public class ProductUpdateDto
{
    [Required(ErrorMessage = "Tên sản phẩm là bắt buộc")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Range(0, 1000000000, ErrorMessage = "Giá sản phẩm phải từ 0 đến 1 tỷ")]
    public decimal Price { get; set; }

    [Range(0, 1000000, ErrorMessage = "Số lượng tồn kho không được âm")]
    public int Stock { get; set; }

    [MaxLength(50)]
    public string? SKU { get; set; }

    public string? ImageUrl { get; set; }

    [Required]
    public int CategoryId { get; set; }
}
