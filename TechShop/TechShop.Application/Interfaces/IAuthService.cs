using System.Threading.Tasks;
using TechShop.Application.DTOs;

namespace TechShop.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
    Task<bool> RegisterAsync(RegisterDto registerDto);
    Task<AuthResponseDto?> GetProfileAsync(int userId);
    Task<bool> UpdateProfileAsync(int userId, UpdateProfileDto updateProfileDto);
    Task<string> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
}
