using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;
using System.Linq;

namespace TechShop.Application.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly IConfiguration _config;
    private readonly IMapper _mapper;

    public AuthService(IRepository<User> userRepository, IConfiguration config, IMapper mapper)
    {
        _userRepository = userRepository;
        _config = config;
        _mapper = mapper;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
    {
        var user = await _userRepository.FindAsync(u => u.Username == loginDto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
        {
            return null;
        }

        if (user.IsLocked)
        {
            throw new InvalidOperationException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }

        var token = GenerateJwtToken(user);
        var response = _mapper.Map<AuthResponseDto>(user);
        response.Token = token;
        
        return response;
    }

    public async Task<bool> RegisterAsync(RegisterDto registerDto)
    {
        var existingUser = await _userRepository.FindAsync(u => u.Username == registerDto.Username);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Tên đăng nhập đã tồn tại trong hệ thống.");
        }

        var existingEmail = await _userRepository.FindAsync(u => u.Email == registerDto.Email);
        if (existingEmail != null)
        {
            throw new InvalidOperationException("Địa chỉ email đã được sử dụng bởi một tài khoản khác.");
        }

        var user = _mapper.Map<User>(registerDto);
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
        user.Role = "User"; // Default role

        await _userRepository.AddAsync(user);
        return true;
    }

    public async Task<AuthResponseDto?> GetProfileAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return null;
        return _mapper.Map<AuthResponseDto>(user);
    }

    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto updateProfileDto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return false;

        _mapper.Map(updateProfileDto, user);
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<string> ChangePasswordAsync(int userId, ChangePasswordDto dto)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null) return "Người dùng không tồn tại";

        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
        {
            return "Mật khẩu cũ không chính xác";
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _userRepository.UpdateAsync(user);
        return "SUCCESS";
    }

    private string GenerateJwtToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_config["Jwt:Key"] ?? "super_secret_key_needs_to_be_long_enough_1234567890!");

        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];
        var expireDaysStr = _config["Jwt:ExpireDays"] ?? "7";
        if (!int.TryParse(expireDaysStr, out int expireDays)) expireDays = 7;

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddDays(expireDays),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
