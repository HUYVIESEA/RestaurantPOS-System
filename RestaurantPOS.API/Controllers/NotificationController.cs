using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.API.Models.DTOs;
using RestaurantPOS.API.Services;
using System.Security.Claims;

namespace RestaurantPOS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly IFirebaseService _firebaseService;
    private readonly ILogger<NotificationController> _logger;

    public NotificationController(
        INotificationService notificationService,
        IFirebaseService firebaseService,
        ILogger<NotificationController> logger)
    {
        _notificationService = notificationService;
        _firebaseService = firebaseService;
        _logger = logger;
    }

    [HttpPost("register-device")]
    public async Task<IActionResult> RegisterDevice([FromBody] RegisterDeviceDto dto)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        await _notificationService.RegisterDeviceAsync(userId, dto.DeviceToken, dto.DeviceType);
        return Ok(new { message = "Device registered successfully" });
    }

    [HttpPost("send-test")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> SendTestNotification([FromBody] SendNotificationDto dto)
    {
        try
        {
            if (!string.IsNullOrEmpty(dto.TargetTopic))
            {
                await _firebaseService.SendTopicNotificationAsync(dto.Title, dto.Body, dto.TargetTopic);
                return Ok(new { message = "Topic notification sent" });
            }
            else if (!string.IsNullOrEmpty(dto.TargetDeviceToken))
            {
                await _firebaseService.SendNotificationAsync(dto.Title, dto.Body, dto.TargetDeviceToken);
                return Ok(new { message = "Direct notification sent" });
            }
            return BadRequest("Either TargetTopic or TargetDeviceToken must be provided.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send test notification");
            return StatusCode(500, "Failed to send notification");
        }
    }

    [HttpPost("subscribe-topic")]
    public async Task<IActionResult> SubscribeToTopic([FromBody] string topic)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            return Unauthorized();

        var devices = await _notificationService.GetUserDeviceTokensAsync(userId);
        var tokens = devices.ToList();

        if (tokens.Any())
        {
            await _firebaseService.SubscribeToTopicAsync(tokens, topic);
            return Ok(new { message = $"Subscribed {tokens.Count} devices to topic {topic}" });
        }

        return Ok(new { message = "No devices found for user" });
    }
}
