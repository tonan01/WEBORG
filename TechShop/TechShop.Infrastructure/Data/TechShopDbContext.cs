using Microsoft.EntityFrameworkCore;
using TechShop.Domain.Entities;
using TechShop.Application.Services;

namespace TechShop.Infrastructure.Data;

public class TechShopDbContext : DbContext
{
    private readonly ICurrentUserService _currentUserService;

    public TechShopDbContext(DbContextOptions<TechShopDbContext> options, ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderDetail> OrderDetails { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── Global Query Filters (Soft Delete) ──────────────────────────────
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Category>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Product>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Order>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<OrderDetail>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Cart>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<CartItem>().HasQueryFilter(e => !e.IsDeleted);

        // ─── Decimal Precision ────────────────────────────────────────────────
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<OrderDetail>()
            .Property(od => od.UnitPrice)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<OrderDetail>()
            .Property(od => od.DiscountAmount)
            .HasColumnType("decimal(18,2)");

        // ─── Relationships ────────────────────────────────────────────────────

        // [ERD] Categories (self-referencing) - ON DELETE RESTRICT
        // Không cho xóa parent Category khi còn sub-category
        modelBuilder.Entity<Category>()
            .HasOne(c => c.ParentCategory)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // [ERD] Categories → Products - ON DELETE RESTRICT
        // Không cho xóa Category khi còn Product thuộc về nó
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // [ERD] Users → Carts (1:1) - ON DELETE CASCADE
        // Xóa User thì xóa luôn Cart của họ
        modelBuilder.Entity<Cart>()
            .HasOne(c => c.User)
            .WithOne(u => u.Cart)
            .HasForeignKey<Cart>(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // [ERD] Carts → CartItems - ON DELETE CASCADE
        // Xóa Cart thì xóa luôn toàn bộ items trong giỏ
        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Cart)
            .WithMany(c => c.CartItems)
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        // [ERD] Products → CartItems - ON DELETE RESTRICT
        // Không tự xóa CartItem khi xóa Product (Soft Delete che khuất)
        modelBuilder.Entity<CartItem>()
            .HasOne(ci => ci.Product)
            .WithMany()
            .HasForeignKey(ci => ci.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // [ERD] Users → Orders - ON DELETE RESTRICT
        // Không cho xóa User khi còn đơn hàng — bảo vệ lịch sử
        modelBuilder.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // [ERD] Orders → OrderDetails - ON DELETE CASCADE
        // Xóa đơn hàng thì xóa luôn chi tiết đơn hàng
        modelBuilder.Entity<OrderDetail>()
            .HasOne(od => od.Order)
            .WithMany(o => o.OrderDetails)
            .HasForeignKey(od => od.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        // [ERD] Products → OrderDetails - ON DELETE RESTRICT
        // Không xóa lịch sử đơn hàng dù Product bị xóa (Soft Delete + ProductName snapshot bảo vệ)
        modelBuilder.Entity<OrderDetail>()
            .HasOne(od => od.Product)
            .WithMany()
            .HasForeignKey(od => od.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // ─── Unique Constraints ───────────────────────────────────────────────
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username).IsUnique();

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.SKU).IsUnique();

        // ─── Performance Indexes (FK + IsDeleted) ────────────────────────────
        // Products
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.CategoryId);
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.IsDeleted);
        modelBuilder.Entity<Product>()
            .HasIndex(p => new { p.CategoryId, p.IsDeleted }); // Composite - rất hay được dùng cùng nhau

        // Orders
        modelBuilder.Entity<Order>()
            .HasIndex(o => o.UserId);
        modelBuilder.Entity<Order>()
            .HasIndex(o => o.IsDeleted);
        modelBuilder.Entity<Order>()
            .HasIndex(o => o.Status);

        // OrderDetails
        modelBuilder.Entity<OrderDetail>()
            .HasIndex(od => od.OrderId);
        modelBuilder.Entity<OrderDetail>()
            .HasIndex(od => od.ProductId);

        // CartItems
        modelBuilder.Entity<CartItem>()
            .HasIndex(ci => ci.CartId);
        modelBuilder.Entity<CartItem>()
            .HasIndex(ci => ci.ProductId);

        // Carts
        modelBuilder.Entity<Cart>()
            .HasIndex(c => c.UserId);

        // Users
        modelBuilder.Entity<User>()
            .HasIndex(u => u.IsDeleted);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var userId = _currentUserService.UserId;
        foreach (var entry in ChangeTracker.Entries<AuditableEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedDate = DateTime.UtcNow;
                    entry.Entity.CreatedBy = userId;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedDate = DateTime.UtcNow;
                    entry.Entity.UpdatedBy = userId;
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.DeletedDate = DateTime.UtcNow;
                    entry.Entity.DeletedBy = userId;
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
