using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TechShop.Application.DTOs;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;
using System.Linq;

namespace TechShop.Application.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
    Task<bool> RegisterAsync(RegisterDto registerDto);
}

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly IConfiguration _config;

    public AuthService(IRepository<User> userRepository, IConfiguration config)
    {
        _userRepository = userRepository;
        _config = config;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
    {
        // ✅ FindAsync — query thẳng DB, không load cả bảng vào memory
        var user = await _userRepository.FindAsync(u => u.Username == loginDto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return null;
        }

        // ✅ Không cần UpdateAsync khi login — không có gì thay đổi
        var token = GenerateJwtToken(user);
        return new AuthResponseDto
        {
            Token = token,
            Username = user.Username,
            Role = user.Role,
            FullName = user.FullName,
            Email = user.Email
        };
    }

    public async Task<bool> RegisterAsync(RegisterDto registerDto)
    {
        // ✅ FindAsync — query thẳng DB theo username, không load cả bảng
        var existing = await _userRepository.FindAsync(u => u.Username == registerDto.Username);
        if (existing != null)
        {
            return false; // Username exists
        }

        var user = new User
        {
            Username = registerDto.Username,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            // ✅ Luôn gán Role = "User" khi register — Admin được thêm thủ công trong DB
            Role = "User",
            Email = registerDto.Email,
            FullName = registerDto.FullName,
            Phone = registerDto.Phone
        };

        await _userRepository.AddAsync(user);
        return true;
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"] ?? "super_secret_key_needs_to_be_long_enough_1234567890!");

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
