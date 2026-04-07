using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechShop.Application.Interfaces;

namespace TechShop.API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? role = null, 
        [FromQuery] bool? isLocked = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var users = await _userService.GetAllUsersAsync(role, isLocked, page, pageSize);
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpPost("{id}/toggle-lock")]
    public async Task<IActionResult> ToggleLock(int id)
    {
        var success = await _userService.ToggleUserLockAsync(id);
        if (!success) return NotFound();
        return Ok(new { message = "Cập nhật trạng thái khóa thành công" });
    }

    [HttpPost("{id}/role")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleRequest request)
    {
        var success = await _userService.UpdateUserRoleAsync(id, request.Role);
        if (!success) return NotFound();
        return Ok(new { message = "Cập nhật quyền thành công" });
    }

    public class UpdateRoleRequest
    {
        public string Role { get; set; } = string.Empty;
    }
}
