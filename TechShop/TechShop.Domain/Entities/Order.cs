using System;
using System.Collections.Generic;

namespace TechShop.Domain.Entities;

public class Order : AuditableEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }

    /// <summary>Pending → Processing → Shipped → Delivered | Cancelled</summary>
    public string Status { get; set; } = "Pending";

    // Shipping info
    public string? ShippingAddress { get; set; }
    public string? PaymentMethod { get; set; } // COD, BankTransfer, CreditCard
    public string? Note { get; set; }

    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }

    public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
}
