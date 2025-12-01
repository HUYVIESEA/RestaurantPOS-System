using System.ComponentModel.DataAnnotations;

namespace RestaurantPOS.API.Models.DTOs
{
    public class RegisterDeviceDto
    {
        [Required]
        public string DeviceToken { get; set; } = string.Empty;

        public string? DeviceType { get; set; }
    }

    public class SendNotificationDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Body { get; set; } = string.Empty;

        public string? TargetDeviceToken { get; set; } // Optional, if sending to specific device
        public string? TargetTopic { get; set; } // Optional, if sending to topic
    }
}
