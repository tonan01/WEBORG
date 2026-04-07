using Microsoft.EntityFrameworkCore;
using AutoMapper;
using TechShop.Application.DTOs;
using TechShop.Application.Interfaces;
using TechShop.Domain.Entities;
using TechShop.Domain.Interfaces;

namespace TechShop.Application.Services;

public class UserService : IUserService
{
    private readonly IRepository<User> _userRepository;
    private readonly IMapper _mapper;

    public UserService(IRepository<User> userRepository, IMapper mapper)
    {
        _userRepository = userRepository;
        _mapper = mapper;
    }

    public async Task<PagedResult<UserDto>> GetAllUsersAsync(string? role = null, bool? isLocked = null, int pageNumber = 1, int pageSize = 10)
    {
        var query = _userRepository.GetQueryable();

        if (!string.IsNullOrEmpty(role))
        {
            query = query.Where(u => u.Role == role);
        }

        if (isLocked.HasValue)
        {
            query = query.Where(u => u.IsLocked == isLocked.Value);
        }

        var totalCount = await query.CountAsync();
        var users = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
            
        var dtos = _mapper.Map<IEnumerable<UserDto>>(users);
        return new PagedResult<UserDto>(dtos, totalCount, pageNumber, pageSize);
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return _mapper.Map<UserDto>(user);
    }

    public async Task<bool> ToggleUserLockAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;

        user.IsLocked = !user.IsLocked;
        await _userRepository.UpdateAsync(user);
        return true;
    }

    public async Task<bool> UpdateUserRoleAsync(int id, string role)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return false;

        user.Role = role;
        await _userRepository.UpdateAsync(user);
        return true;
    }
}
