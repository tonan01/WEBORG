using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Application.Common.Models;

namespace TechShop.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
            return BadRequest(ApiResponse<object>.FailureResult("Tên đăng nhập và mật khẩu không được để trống."));

        var response = await _authService.LoginAsync(dto);
        if (response == null) return Unauthorized(ApiResponse<object>.FailureResult("Tên đăng nhập hoặc mật khẩu không chính xác."));

        return Ok(ApiResponse<AuthResponseDto>.SuccessResult(response, "Đăng nhập thành công"));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
            return BadRequest(ApiResponse<object>.FailureResult("Tên đăng nhập và mật khẩu không được để trống."));

        var result = await _authService.RegisterAsync(dto);
        if (!result) return BadRequest(ApiResponse<object>.FailureResult("Tên đăng nhập đã tồn tại trong hệ thống."));

        return Ok(ApiResponse<object>.SuccessResult(null, "Đăng ký tài khoản thành công"));
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var profile = await _authService.GetProfileAsync(userId);
        if (profile == null) return NotFound(ApiResponse<object>.FailureResult("Không tìm thấy thông tin người dùng."));
        return Ok(ApiResponse<AuthResponseDto>.SuccessResult(profile));
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var result = await _authService.UpdateProfileAsync(userId, dto);
        if (!result) return BadRequest(ApiResponse<object>.FailureResult("Cập nhật thông tin thất bại"));
        return Ok(ApiResponse<object>.SuccessResult(null, "Cập nhật hồ sơ thành công"));
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var result = await _authService.ChangePasswordAsync(userId, dto);
        if (result != "SUCCESS") return BadRequest(ApiResponse<object>.FailureResult(result));
        return Ok(ApiResponse<object>.SuccessResult(null, "Đổi mật khẩu thành công"));
    }
}
