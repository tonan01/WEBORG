using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TechShop.Application.Services;
using TechShop.Application.Interfaces;
using TechShop.Application.Mappings;
using TechShop.Domain.Interfaces;
using TechShop.Infrastructure.Data;
using TechShop.Infrastructure.Repositories;
using TechShop.Infrastructure.Services;
using TechShop.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
DotNetEnv.Env.Load();
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT token"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// DbContext
builder.Services.AddDbContext<TechShopDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dependency Injection
builder.Services.AddHttpContextAccessor();
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();

// JWT Authentication
var key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? "super_secret_key_needs_to_be_long_enough_1234567890!");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var app = builder.Build();

// Đăng ký Middleware xử lý lỗi toàn cục ngay đầu pipeline
app.UseMiddleware<TechShop.API.Middleware.ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<TechShopDbContext>();
    dbContext.Database.Migrate();

    if (!dbContext.Categories.Any())
    {
        var catLaptop    = new TechShop.Domain.Entities.Category { Name = "Laptop",     Description = "Laptop & MacBook",       ImageUrl = "https://cdn-icons-png.flaticon.com/512/2920/2920349.png" };
        var catPhone     = new TechShop.Domain.Entities.Category { Name = "Điện thoại", Description = "Smartphone & iPhone",    ImageUrl = "https://cdn-icons-png.flaticon.com/512/2991/2991106.png" };
        var catAccessory = new TechShop.Domain.Entities.Category { Name = "Phụ kiện",   Description = "Tai nghe, Bàn phím...", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2972/2972531.png" };
        dbContext.Categories.AddRange(catLaptop, catPhone, catAccessory);
        dbContext.SaveChanges();

        dbContext.Products.AddRange(
            new TechShop.Domain.Entities.Product { Name = "MacBook Pro M3",    SKU = "MBP-M3-2024",  Price = 50000000, Stock = 10, CategoryId = catLaptop.Id,    Description = "Apple Silicon M3, 16GB RAM, 512GB SSD",      ImageUrl = "https://cdn-icons-png.flaticon.com/512/2820/2820367.png" },
            new TechShop.Domain.Entities.Product { Name = "Dell XPS 15",        SKU = "DELL-XPS15",   Price = 45000000, Stock = 5,  CategoryId = catLaptop.Id,    Description = "Intel Core i9, 32GB RAM, OLED 4K",            ImageUrl = "https://cdn-icons-png.flaticon.com/512/2920/2920349.png" },
            new TechShop.Domain.Entities.Product { Name = "iPhone 16 Pro",      SKU = "IP16-PRO-256", Price = 32000000, Stock = 20, CategoryId = catPhone.Id,     Description = "A18 Pro chip, 256GB, Titanium",              ImageUrl = "https://cdn-icons-png.flaticon.com/512/2991/2991106.png" },
            new TechShop.Domain.Entities.Product { Name = "Samsung Galaxy S25", SKU = "SAM-S25-128",  Price = 28000000, Stock = 15, CategoryId = catPhone.Id,     Description = "Snapdragon 8 Elite, 128GB, 50MP Camera",     ImageUrl = "https://cdn-icons-png.flaticon.com/512/2991/2991106.png" },
            new TechShop.Domain.Entities.Product { Name = "AirPods Pro 2",      SKU = "APP2-USB-C",   Price = 6500000, Stock = 30, CategoryId = catAccessory.Id, Description = "ANC chủ động, USB-C, chip H2",             ImageUrl = "https://cdn-icons-png.flaticon.com/512/2972/2972531.png" },
            new TechShop.Domain.Entities.Product { Name = "Keychron K8 Pro",    SKU = "KEY-K8P-RGB",  Price = 3200000, Stock = 25, CategoryId = catAccessory.Id, Description = "Bàn phím cơ TKL, Gateron, RGB, Bluetooth", ImageUrl = "https://cdn-icons-png.flaticon.com/512/2972/2972531.png" }
        );
        dbContext.SaveChanges();
    }

    if (!dbContext.Users.Any(u => u.Username == "admin"))
    {
        var adminUser = new TechShop.Domain.Entities.User
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Role = "Admin",
            Email = "admin@techshop.com",
            FullName = "Administrator",
            Phone = "0123456789"
        };
        dbContext.Users.Add(adminUser);
    }

    if (!dbContext.Users.Any(u => u.Username == "baoa"))
    {
        var baoaAdmin = new TechShop.Domain.Entities.User
        {
            Username = "baoa",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
            Role = "Admin",
            Email = "baoa@techshop.com",
            FullName = "Bao Admin",
            Phone = "0987654321"
        };
        dbContext.Users.Add(baoaAdmin);
    }

    if (!dbContext.Users.Any(u => u.Username == "bao1"))
    {
        var bao1User = new TechShop.Domain.Entities.User
        {
            Username = "bao1",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("123"),
            Role = "User",
            Email = "bao1@techshop.com",
            FullName = "Bao User",
            Phone = "0123987654"
        };
        dbContext.Users.Add(bao1User);
    }
    
    dbContext.SaveChanges();
}

app.MapControllers();

app.Run();
