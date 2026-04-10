using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.API.Services;
using System.Security.Claims;

namespace RestaurantPOS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentSettingsController : ControllerBase
{
    private readonly IPaymentSettingsService _paymentSettingsService;

    public PaymentSettingsController(IPaymentSettingsService paymentSettingsService)
    {
        _paymentSettingsService = paymentSettingsService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var result = await _paymentSettingsService.GetSettingsAsync();
        return Ok(result);
    }

    [HttpPut]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdatePaymentSettingsRequest request)
    {
        if (request == null)
            return BadRequest(new { message = "Request body is required" });

        if (string.IsNullOrWhiteSpace(request.BankName) ||
            string.IsNullOrWhiteSpace(request.BankBin) ||
            string.IsNullOrWhiteSpace(request.AccountNumber) ||
            string.IsNullOrWhiteSpace(request.AccountName))
        {
            return BadRequest(new { message = "Vui lòng điền đầy đủ thông tin ngân hàng" });
        }

        if (string.IsNullOrEmpty(request.Password))
            return BadRequest(new { message = "Mật khẩu là bắt buộc" });

        var userIdStr = User.FindFirst("UserId")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userIdInt))
            return Unauthorized(new { message = "Không xác định được người dùng" });

        try
        {
            var result = await _paymentSettingsService.UpdateSettingsAsync(
                request.BankName, request.BankBin, request.AccountNumber, request.AccountName,
                request.Password, userIdInt);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return BadRequest(new { message = ex.Message });
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
    public string Password { get; set; } = string.Empty;
}
