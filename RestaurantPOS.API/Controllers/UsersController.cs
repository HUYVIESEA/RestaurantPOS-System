using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Models.DTOs;
using BCrypt.Net;
using System.Security.Claims; // ✅ ADD for ClaimTypes

namespace RestaurantPOS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Users
        [HttpGet]
   [Authorize(Roles = "Admin")] // Only admins can view all users
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
      {
    var users = await _context.Users
    .Select(u => new UserDto
     {
        Id = u.Id,
 Username = u.Username,
   Email = u.Email,
               FullName = u.FullName,
        Role = u.Role,
     IsActive = u.IsActive,
         CreatedAt = u.CreatedAt
     })
   .OrderByDescending(u => u.CreatedAt)
   .ToListAsync();

            return Ok(users);
        }

        // GET: api/Users/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
        {
 var user = await _context.Users.FindAsync(id);

 if (user == null)
            {
        return NotFound();
       }

   var userDto = new UserDto
       {
     Id = user.Id,
   Username = user.Username,
            Email = user.Email,
      FullName = user.FullName,
          Role = user.Role,
   IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
     };

         return Ok(userDto);
        }

        // GET: api/Users/Profile - Get current user profile
        [HttpGet("Profile")]
        public async Task<ActionResult<UserDto>> GetProfile()
        {
            var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0"); // ✅ FIXED: Use custom claim
         var user = await _context.Users.FindAsync(userId);

   if (user == null)
            {
        return NotFound();
            }

       var userDto = new UserDto
         {
     Id = user.Id,
 Username = user.Username,
    Email = user.Email,
     FullName = user.FullName,
 Role = user.Role,
    IsActive = user.IsActive,
CreatedAt = user.CreatedAt
        };

            return Ok(userDto);
        }

    // POST: api/Users
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<UserDto>> CreateUser(CreateUserRequest request)
        {
       // Check if username already exists
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            {
 return BadRequest("Username đã tồn tại");
 }

          // Check if email already exists
 if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
      return BadRequest("Email đã tồn tại");
      }

            var user = new User
            {
 Username = request.Username,
Email = request.Email,
          FullName = request.FullName,
                Role = request.Role ?? "Staff",
          PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
   IsActive = true,
     CreatedAt = DateTime.UtcNow
            };

    _context.Users.Add(user);
   await _context.SaveChangesAsync();

            var userDto = new UserDto
            {
  Id = user.Id,
 Username = user.Username,
       Email = user.Email,
        FullName = user.FullName,
    Role = user.Role,
       IsActive = user.IsActive,
       CreatedAt = user.CreatedAt
            };

return CreatedAtAction(nameof(GetUser), new { id = user.Id }, userDto);
        }

        // PUT: api/Users/5
        [HttpPut("{id}")]
  [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest request)
   {
         var user = await _context.Users.FindAsync(id);
      if (user == null)
        {
     return NotFound();
            }

            // Check username conflict
         if (request.Username != user.Username && 
   await _context.Users.AnyAsync(u => u.Username == request.Username && u.Id != id))
     {
      return BadRequest("Username đã tồn tại");
          }

      // Check email conflict
      if (request.Email != user.Email && 
        await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != id))
         {
   return BadRequest("Email đã tồn tại");
            }

    user.Username = request.Username;
user.Email = request.Email;
   user.FullName = request.FullName;

         await _context.SaveChangesAsync();

      return NoContent();
    }

        // PUT: api/Users/Profile - Update current user profile
        [HttpPut("Profile")]
  public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
      var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0"); // ✅ FIXED
    var user = await _context.Users.FindAsync(userId);

 if (user == null)
     {
      return NotFound();
       }

          // Check email conflict
    if (request.Email != user.Email && 
      await _context.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId))
{
     return BadRequest("Email đã tồn tại");
         }

       user.Email = request.Email;
 user.FullName = request.FullName;

  await _context.SaveChangesAsync();

 return NoContent();
 }

        // POST: api/Users/ChangePassword
    [HttpPost("ChangePassword")]
 public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
     {
       var userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0"); // ✅ FIXED
      var user = await _context.Users.FindAsync(userId);

       if (user == null)
       {
   return NotFound();
   }

   // Verify current password
 if (!BCrypt.Net.BCrypt.Verify(request.OldPassword, user.PasswordHash))
        {
            return BadRequest("Mật khẩu hiện tại không đúng");
       }

      // Update password
user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();

      return Ok(new { message = "Đổi mật khẩu thành công" });
 }

      // PATCH: api/Users/5/Role
  [HttpPatch("{id}/Role")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] string role)
 {
         var user = await _context.Users.FindAsync(id);
   if (user == null)
         {
        return NotFound();
  }

            if (role != "Admin" && role != "Manager" && role != "Staff")
    {
      return BadRequest("Role không hợp lệ. Chỉ chấp nhận 'Admin', 'Manager' hoặc 'Staff'");
            }

            user.Role = role;
         await _context.SaveChangesAsync();

 return NoContent();
        }

        // PATCH: api/Users/5/Status
        [HttpPatch("{id}/Status")]
     [Authorize(Roles = "Admin")]
     public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool isActive)
        {
     var user = await _context.Users.FindAsync(id);
 if (user == null)
     {
      return NotFound();
   }

// Don't allow deactivating yourself
            var currentUserId = int.Parse(User.FindFirst("UserId")?.Value ?? "0"); // ✅ FIXED
 if (id == currentUserId && !isActive)
 {
             return BadRequest("Không thể vô hiệu hóa tài khoản của chính mình");
 }

   user.IsActive = isActive;
      await _context.SaveChangesAsync();

    return NoContent();
 }

        // POST: api/Users/5/ResetPassword
        [HttpPost("{id}/ResetPassword")]
  [Authorize(Roles = "Admin")]
     public async Task<ActionResult<ResetPasswordResponse>> ResetPassword(int id)
        {
       var user = await _context.Users.FindAsync(id);
     if (user == null)
  {
        return NotFound();
     }

    // Generate random password
            var newPassword = GenerateRandomPassword();
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
await _context.SaveChangesAsync();

        return Ok(new ResetPasswordResponse
         {
                NewPassword = newPassword,
              Message = "Mật khẩu đã được reset thành công"
  });
        }

        // DELETE: api/Users/5
     [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
      {
   var user = await _context.Users.FindAsync(id);
if (user == null)
    {
   return NotFound();
  }

     // Don't allow deleting yourself
   var currentUserId = int.Parse(User.FindFirst("UserId")?.Value ?? "0"); // ✅ FIXED
    if (id == currentUserId)
   {
  return BadRequest("Không thể xóa tài khoản của chính mình");
     }

   _context.Users.Remove(user);
         await _context.SaveChangesAsync();

    return NoContent();
 }

        private string GenerateRandomPassword()
        {
  const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    var random = new Random();
  return new string(Enumerable.Repeat(chars, 12)
       .Select(s => s[random.Next(s.Length)]).ToArray());
      }
}

    // ✅ DTOs - Only add new ones that don't exist in AuthDTOs
    public class UserDto
    {
   public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
      public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

 public class CreateUserRequest
  {
      public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? Role { get; set; }
}

public class UpdateUserRequest
    {
    public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    }

    public class UpdateProfileRequest
    {
 public string Email { get; set; } = string.Empty;
      public string FullName { get; set; } = string.Empty;
    }

    // ✅ REMOVED duplicate DTOs (ChangePasswordRequest, ResetPasswordResponse)
    // These already exist in AuthDTOs.cs
    
    public class ResetPasswordResponse
    {
 public string NewPassword { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    }
}
