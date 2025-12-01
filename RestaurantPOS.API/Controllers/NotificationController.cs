using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Models.DTOs;
using RestaurantPOS.API.Services;
using System.Security.Claims;

namespace RestaurantPOS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IFirebaseService _firebaseService;
        private readonly ILogger<NotificationController> _logger;

        public NotificationController(ApplicationDbContext context, IFirebaseService firebaseService, ILogger<NotificationController> logger)
        {
            _context = context;
            _firebaseService = firebaseService;
            _logger = logger;
        }

        [HttpPost("register-device")]
        public async Task<IActionResult> RegisterDevice([FromBody] RegisterDeviceDto dto)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var existingDevice = await _context.UserDevices
                .FirstOrDefaultAsync(d => d.DeviceToken == dto.DeviceToken);

            if (existingDevice != null)
            {
                // Update existing device if needed (e.g., user changed, or just update timestamp)
                if (existingDevice.UserId != userId)
                {
                    existingDevice.UserId = userId; // Token now belongs to this user
                }
                existingDevice.LastUpdated = DateTime.UtcNow;
                existingDevice.DeviceType = dto.DeviceType ?? existingDevice.DeviceType;
            }
            else
            {
                var newDevice = new UserDevice
                {
                    UserId = userId,
                    DeviceToken = dto.DeviceToken,
                    DeviceType = dto.DeviceType,
                    LastUpdated = DateTime.UtcNow
                };
                _context.UserDevices.Add(newDevice);
            }

            await _context.SaveChangesAsync();
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
                else
                {
                    return BadRequest("Either TargetTopic or TargetDeviceToken must be provided.");
                }
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
            {
                return Unauthorized();
            }
            
            // Get all devices for this user
            var devices = await _context.UserDevices.Where(d => d.UserId == userId).Select(d => d.DeviceToken).ToListAsync();
            
            if (devices.Any())
            {
                await _firebaseService.SubscribeToTopicAsync(devices, topic);
                return Ok(new { message = $"Subscribed {devices.Count} devices to topic {topic}" });
            }
            
            return Ok(new { message = "No devices found for user" });
        }
    }
}
