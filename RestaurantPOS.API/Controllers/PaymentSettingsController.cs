using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using System.Security.Claims;

namespace RestaurantPOS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentSettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentSettingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get current payment settings (requires authentication)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _context.PaymentSettings
                .Where(s => s.IsActive)
                .OrderByDescending(s => s.Id)
                .FirstOrDefaultAsync();

            if (settings == null)
            {
                return Ok(new
                {
                    isConfigured = false,
                    message = "Chưa cấu hình thông tin thanh toán"
                });
            }

            return Ok(new
            {
                isConfigured = true,
                bankName = settings.BankName,
                bankBin = settings.BankBin,
                accountNumber = settings.AccountNumber,
                accountName = settings.AccountName
            });
        }

        /// <summary>
        /// Update payment settings (requires Admin role and password verification)
        /// </summary>
        [HttpPut]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateSettings([FromBody] UpdatePaymentSettingsRequest request)
        {
            try
            {
                // Validate request
                if (request == null)
                {
                    return BadRequest(new { message = "Request body is required" });
                }

                if (string.IsNullOrEmpty(request.Password))
                {
                    return BadRequest(new { message = "Mật khẩu là bắt buộc" });
                }

                // Get user ID from claims - try multiple claim types
                string? userId = null;
                
                // Try UserId claim first (custom claim we set)
                userId = User.FindFirst("UserId")?.Value;
                
                // Try NameIdentifier
                if (string.IsNullOrEmpty(userId))
                {
                    userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                }
                
                // Try sub claim (JWT standard)
                if (string.IsNullOrEmpty(userId))
                {
                    userId = User.FindFirst("sub")?.Value;
                }

                // Log all claims for debugging
                var allClaims = User.Claims.Select(c => $"{c.Type}={c.Value}").ToList();
                Console.WriteLine($"All claims: {string.Join(", ", allClaims)}");
                Console.WriteLine($"Found userId: {userId}");

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Không xác định được người dùng", claims = allClaims });
                }

                if (!int.TryParse(userId, out int userIdInt))
                {
                    return Unauthorized(new { message = $"ID người dùng không hợp lệ: '{userId}'", claims = allClaims });
                }

                var user = await _context.Users.FindAsync(userIdInt);
                if (user == null)
                {
                    return Unauthorized(new { message = "Không tìm thấy người dùng" });
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                {
                    return BadRequest(new { message = "Mật khẩu không chính xác" });
                }

                // Deactivate old settings
                var oldSettings = await _context.PaymentSettings.Where(s => s.IsActive).ToListAsync();
                foreach (var old in oldSettings)
                {
                    old.IsActive = false;
                }

                // Create new settings
                var newSettings = new PaymentSettings
                {
                    BankName = request.BankName ?? "",
                    BankBin = request.BankBin ?? "",
                    AccountNumber = request.AccountNumber ?? "",
                    AccountName = request.AccountName ?? "",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedByUserId = userIdInt
                };

                _context.PaymentSettings.Add(newSettings);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Cập nhật thông tin thanh toán thành công"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }
    }

    public class UpdatePaymentSettingsRequest
    {
        public string BankName { get; set; } = string.Empty;
        public string BankBin { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty; // Required for security
    }
}
