using TechShop.Application.DTOs;

namespace TechShop.Application.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetAllUsersAsync(string? role = null, bool? isLocked = null, int pageNumber = 1, int pageSize = 10);
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<bool> ToggleUserLockAsync(int id);
    Task<bool> UpdateUserRoleAsync(int id, string role);
}
