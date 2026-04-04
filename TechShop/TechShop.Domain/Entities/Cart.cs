using System.Collections.Generic;

namespace TechShop.Domain.Entities;

public class Cart : AuditableEntity
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
