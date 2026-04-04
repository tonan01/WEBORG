namespace TechShop.Domain.Entities;

public class OrderDetail : AuditableEntity
{
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    /// <summary>Snapshot tên sản phẩm tại thời điểm mua - tránh mất data khi đổi tên/xóa sản phẩm</summary>
    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }

    /// <summary>Giảm giá áp dụng riêng cho item này (VD: coupon, flash sale...)</summary>
    public decimal DiscountAmount { get; set; } = 0;

    public decimal SubTotal => (UnitPrice - DiscountAmount) * Quantity;
}
