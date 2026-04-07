using System.ComponentModel.DataAnnotations;

namespace TechShop.Application.DTOs;

// ─── Auth DTOs ────────────────────────────────────────────────────────────────
public class RegisterDto
{
    [Required(ErrorMessage = "Tên đăng nhập không được để trống")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Tên đăng nhập từ 3 đến 50 ký tự")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được để trống")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "Mật khẩu phải từ 3 ký tự trở lên")]
    public string Password { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
    [MaxLength(100, ErrorMessage = "Email không quá 100 ký tự")]
    public string? Email { get; set; }

    [MaxLength(100)]
    public string? FullName { get; set; }

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string? Phone { get; set; }
}

public class LoginDto
{
    [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? AvatarUrl { get; set; }
}

public class UpdateProfileDto
{
    [MaxLength(100)]
    public string? FullName { get; set; }

    [EmailAddress(ErrorMessage = "Địa chỉ email không hợp lệ")]
    public string? Email { get; set; }

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    public string? Phone { get; set; }

    [MaxLength(255)]
    public string? Address { get; set; }
    
    public string? AvatarUrl { get; set; }
}

public class ChangePasswordDto
{
    [Required]
    public string OldPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(3, ErrorMessage = "Mật khẩu mới phải từ 3 ký tự")]
    public string NewPassword { get; set; } = string.Empty;
}
