using Microsoft.EntityFrameworkCore;
using TechShop.Infrastructure.Data;
using TechShop.Domain.Entities;

namespace TechShop.API.Data;

public static class DbInitializer
{
    public static void Initialize(TechShopDbContext context)
    {
        context.Database.Migrate();

        if (!context.Categories.Any())
        {
            var catLaptop = new Category { Name = "Laptop", Description = "Laptop & MacBook", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2920/2920349.png" };
            var catPhone = new Category { Name = "Điện thoại", Description = "Smartphone & iPhone", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2991/2991106.png" };
            var catAccessory = new Category { Name = "Phụ kiện", Description = "Tai nghe, Bàn phím...", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2972/2972531.png" };
            
            context.Categories.AddRange(catLaptop, catPhone, catAccessory);
            context.SaveChanges();

            context.Products.AddRange(
                new Product { Name = "MacBook Pro M3", SKU = "MBP-M3-2024", Price = 50000000, Stock = 10, CategoryId = catLaptop.Id, Description = "Apple Silicon M3, 16GB RAM, 512GB SSD", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2820/2820367.png" },
                new Product { Name = "Dell XPS 15", SKU = "DELL-XPS15", Price = 45000000, Stock = 5, CategoryId = catLaptop.Id, Description = "Intel Core i9, 32GB RAM, OLED 4K", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2920/2920349.png" },
                new Product { Name = "iPhone 16 Pro", SKU = "IP16-PRO-256", Price = 32000000, Stock = 20, CategoryId = catPhone.Id, Description = "A18 Pro chip, 256GB, Titanium", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2991/2991106.png" },
                new Product { Name = "Samsung Galaxy S25", SKU = "SAM-S25-128", Price = 28000000, Stock = 15, CategoryId = catPhone.Id, Description = "Snapdragon 8 Elite, 128GB, 50MP Camera", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2991/2991106.png" },
                new Product { Name = "AirPods Pro 2", SKU = "APP2-USB-C", Price = 6500000, Stock = 30, CategoryId = catAccessory.Id, Description = "ANC chủ động, USB-C, chip H2", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2972/2972531.png" },
                new Product { Name = "Keychron K8 Pro", SKU = "KEY-K8P-RGB", Price = 3200000, Stock = 25, CategoryId = catAccessory.Id, Description = "Bàn phím cơ TKL, Gateron, RGB, Bluetooth", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2972/2972531.png" }
            );
            context.SaveChanges();
        }

        if (!context.Users.Any(u => u.Username == "admin"))
        {
            context.Users.Add(new User
            {
                Username = "admin",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "Admin",
                Email = "admin@techshop.com",
                FullName = "Administrator",
                Phone = "0123456789"
            });
        }

        if (!context.Users.Any(u => u.Username == "baoa"))
        {
            context.Users.Add(new User
            {
                Username = "baoa",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                Role = "Admin",
                Email = "baoa@techshop.com",
                FullName = "Bao Admin",
                Phone = "0987654321"
            });
        }

        if (!context.Users.Any(u => u.Username == "bao1"))
        {
            context.Users.Add(new User
            {
                Username = "bao1",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
                Role = "User",
                Email = "bao1@techshop.com",
                FullName = "Bao User",
                Phone = "0123987654"
            });
        }

        context.SaveChanges();
    }
}
