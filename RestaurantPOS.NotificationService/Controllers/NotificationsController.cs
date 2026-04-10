using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.NotificationService.Services;

namespace RestaurantPOS.NotificationService.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost("register-device")]
    public async Task<IActionResult> RegisterDevice([FromBody] RegisterDeviceRequest request)
    {
        await _notificationService.RegisterDeviceAsync(request.UserId, request.DeviceToken, request.DeviceType);
        return Ok(new { message = "Device registered successfully" });
    }

    [HttpGet("devices/{userId}")]
    public async Task<IActionResult> GetDeviceTokens(int userId)
    {
        var tokens = await _notificationService.GetUserDeviceTokensAsync(userId);
        return Ok(tokens);
    }

    [HttpPost("log")]
    public async Task<IActionResult> LogNotification([FromBody] LogNotificationRequest request)
    {
        await _notificationService.LogNotificationAsync(request.UserId, request.Title, request.Message, request.IsSent, request.Error);
        return Ok(new { message = "Notification logged" });
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", service = "notification-service", timestamp = DateTime.UtcNow });
    }
}

public class RegisterDeviceRequest
{
    public int UserId { get; set; }
    public string DeviceToken { get; set; } = string.Empty;
    public string? DeviceType { get; set; }
}

public class LogNotificationRequest
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsSent { get; set; }
    public string? Error { get; set; }
}
