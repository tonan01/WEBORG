using System;
using System.Collections.Generic;

namespace TechShop.Application.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? ShippingAddress { get; set; }
    public string? PaymentMethod { get; set; }
    public string? Note { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public List<OrderDetailDto> Details { get; set; } = new();
}

public class OrderDetailDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal SubTotal => (UnitPrice - DiscountAmount) * Quantity;
}

/// <summary>Thông tin giao hàng và thanh toán khi đặt hàng</summary>
public class CheckoutDto
{
    public string? ShippingAddress { get; set; }
    /// <summary>COD | BankTransfer | CreditCard</summary>
    public string? PaymentMethod { get; set; }
    public string? Note { get; set; }
}
