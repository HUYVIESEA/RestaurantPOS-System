using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Models.DTOs;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace RestaurantPOS.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
   private readonly IConfiguration _configuration;
   private readonly IEmailService _emailService;

   public AuthService(
    ApplicationDbContext context, 
 IConfiguration configuration,
  IEmailService emailService)
        {
   _context = context;
   _configuration = configuration;
            _emailService = emailService;
    }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Username == request.Username);

    // Check if user exists
    if (user == null)
    {
        // User doesn't exist - return null to avoid user enumeration
        return null;
    }

    // Check if account is locked out
    if (user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTime.UtcNow)
    {
        // Account is locked out
        return null;
    }

    // Check password
    if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
    {
        // Increment failed login attempts
        user.FailedLoginAttempts++;

        // Lock account after 5 failed attempts
        if (user.FailedLoginAttempts >= 5)
        {
            user.LockoutEnd = DateTime.UtcNow.AddMinutes(15); // Lock for 15 minutes
        }

        await _context.SaveChangesAsync();
        return null;
    }

    // Password is correct - reset failed attempts and check if active
    user.FailedLoginAttempts = 0;
    user.LockoutEnd = null;

    if (!user.IsActive)
    {
        return null;
    }

    // Check if this is first login with default password
    bool mustChangePassword = false;
    if (user.LastLoginAt == null && 
        user.Username == "admin" && 
        BCrypt.Net.BCrypt.Verify("Admin@123", user.PasswordHash))
    {
        mustChangePassword = true;
    }

    // Update last login
    user.LastLoginAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    // Generate JWT token
   var token = GenerateJwtToken(user);

       return new LoginResponse
     {
         Id = user.Id, // ✅ ADD user ID
     Token = token,
        Username = user.Username,
          Email = user.Email,
                 FullName = user.FullName,
     Role = user.Role,
   ExpiresAt = DateTime.UtcNow.AddHours(_configuration.GetValue<int>("JwtSettings:ExpiryInHours")),
   MustChangePassword = mustChangePassword
   };
        }

        public async Task<UserResponse?> RegisterAsync(RegisterRequest request)
   {
   // Check if username exists
         if (await _context.Users.AnyAsync(u => u.Username == request.Username))
       {
       return null;
      }

    // Check if email exists
       if (await _context.Users.AnyAsync(u => u.Email == request.Email))
   {
             return null;
     }

        var user = new User
            {
          Username = request.Username,
    Email = request.Email,
  PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
        FullName = request.FullName,
          PhoneNumber = request.PhoneNumber,
        Role = "Staff", // SECURITY: Force default role, ignore client-supplied role
 IsActive = true,
        CreatedAt = DateTime.UtcNow
     };

  _context.Users.Add(user);
   await _context.SaveChangesAsync();

      return new UserResponse
   {
 Id = user.Id,
    Username = user.Username,
      Email = user.Email,
             FullName = user.FullName,
      PhoneNumber = user.PhoneNumber,
         Role = user.Role,
      IsActive = user.IsActive,
       CreatedAt = user.CreatedAt
      };
        }

        public async Task<UserResponse?> GetUserByIdAsync(int id)
  {
   var user = await _context.Users.FindAsync(id);
       if (user == null) return null;

     return new UserResponse
        {
    Id = user.Id,
       Username = user.Username,
     Email = user.Email,
          FullName = user.FullName,
        PhoneNumber = user.PhoneNumber,
Role = user.Role,
        IsActive = user.IsActive,
  CreatedAt = user.CreatedAt
     };
 }

   public async Task<IEnumerable<UserResponse>> GetAllUsersAsync()
    {
       var users = await _context.Users.ToListAsync();
  return users.Select(u => new UserResponse
       {
      Id = u.Id,
   Username = u.Username,
       Email = u.Email,
        FullName = u.FullName,
           PhoneNumber = u.PhoneNumber,
     Role = u.Role,
       IsActive = u.IsActive,
      CreatedAt = u.CreatedAt
  });
        }

   public async Task<bool> UpdateUserAsync(int id, User user)
        {
      var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null) return false;

   existingUser.Email = user.Email;
        existingUser.FullName = user.FullName;
        existingUser.PhoneNumber = user.PhoneNumber;
        existingUser.Role = user.Role;
  existingUser.IsActive = user.IsActive;

  await _context.SaveChangesAsync();
       return true;
        }

    public async Task<bool> DeleteUserAsync(int id)
        {
       var user = await _context.Users.FindAsync(id);
       if (user == null) return false;

       _context.Users.Remove(user);
      await _context.SaveChangesAsync();
         return true;
        }

    public async Task<bool> ChangePasswordAsync(int userId, string oldPassword, string newPassword)
      {
   var user = await _context.Users.FindAsync(userId);
          if (user == null) return false;

       if (!BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash))
             {
   return false;
   }

     user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
     user.PasswordChangedAt = DateTime.UtcNow; // Track when password was changed
  await _context.SaveChangesAsync();
         return true;
    }

   public async Task<bool> ForgotPasswordAsync(string email)
        {
       var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null || !user.IsActive)
   {
return false;
}

        // Generate reset token
  var resetToken = GenerateResetToken();

          // Save token to database
   var passwordResetToken = new PasswordResetToken
   {
    UserId = user.Id,
     Token = resetToken,
     CreatedAt = DateTime.UtcNow,
        ExpiresAt = DateTime.UtcNow.AddHours(1), // Token valid for 1 hour
    IsUsed = false
      };

  _context.PasswordResetTokens.Add(passwordResetToken);
          await _context.SaveChangesAsync();

       // Send email
     try
       {
    await _emailService.SendPasswordResetEmailAsync(user.Email, user.FullName, resetToken);
    return true;
      }
         catch (Exception)
   {
    // Log error but don't reveal to user
      return true; // Return true anyway for security
   }
        }

        public async Task<bool> ResetPasswordAsync(string token, string newPassword)
      {
    var resetToken = await _context.PasswordResetTokens
         .Include(rt => rt.User)
        .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsUsed);

        if (resetToken == null)
        return false;

        // Check if token is expired
        if (resetToken.ExpiresAt < DateTime.UtcNow)
        {
            return false; // Reject expired tokens
        }

             var user = resetToken.User;

        if (user == null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

     // Mark token as used
    resetToken.IsUsed = true;
   resetToken.UsedAt = DateTime.UtcNow;

   await _context.SaveChangesAsync();

          // Send confirmation email
             try
  {
       await _emailService.SendPasswordChangedEmailAsync(user.Email, user.FullName);
    }
        catch { /* Ignore email errors */ }

       return true;
         }

        public async Task<bool> ValidateResetTokenAsync(string token)
        {
            var resetToken = await _context.PasswordResetTokens
                .FirstOrDefaultAsync(rt => rt.Token == token && !rt.IsUsed);

            if (resetToken == null)
            {
                return false;
            }

            // Check if token is expired
            return resetToken.ExpiresAt >= DateTime.UtcNow;
        }

        public async Task<bool> UpdateFcmTokenAsync(int userId, string fcmToken)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.FcmToken = fcmToken;
            await _context.SaveChangesAsync();
            return true;
        }

        private string GenerateResetToken()
        {
            // Generate a cryptographically secure random token
            var randomBytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
            }
            return Convert.ToBase64String(randomBytes)
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            if (string.IsNullOrEmpty(secretKey))
            {
                secretKey = "RestaurantPOS_Super_Secret_Development_Key_2026_DoNotUseInProd!";
            }
            var issuer = jwtSettings["Issuer"] ?? "RestaurantPOS";
            var audience = jwtSettings["Audience"] ?? "RestaurantPOSClient";
            var expiryInHours = jwtSettings.GetValue<int?>("ExpiryInHours") ?? 24;

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
                new Claim("UserId", user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiryInHours),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
