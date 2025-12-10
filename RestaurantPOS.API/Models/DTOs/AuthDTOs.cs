using System.ComponentModel.DataAnnotations;

namespace RestaurantPOS.API.Models.DTOs
{
    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequest
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters")]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FullName { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }
        
        public string Role { get; set; } = "Staff";
    }

    public class LoginResponse
 {
        public int Id { get; set; } // ✅ ADD user ID
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
   public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }

    public class UserResponse
 {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
      public string Email { get; set; } = string.Empty;
      public string FullName { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
      public DateTime CreatedAt { get; set; }
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
      public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

  public class ChangePasswordRequest
  {
   public string OldPassword { get; set; } = string.Empty;
   public string NewPassword { get; set; } = string.Empty;
}
}
