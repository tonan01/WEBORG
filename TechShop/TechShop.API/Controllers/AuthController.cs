using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TechShop.Application.DTOs;
using TechShop.Application.Services;

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
            return BadRequest("Username and Password are required.");

        var response = await _authService.LoginAsync(dto);
        if (response == null) return Unauthorized("Invalid credentials.");

        return Ok(response);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (string.IsNullOrEmpty(dto.Username) || string.IsNullOrEmpty(dto.Password))
            return BadRequest("Username and Password are required.");

        var result = await _authService.RegisterAsync(dto);
        if (!result) return BadRequest("Username already exists.");

        return Ok(new { Message = "Registration successful" });
    }
}
