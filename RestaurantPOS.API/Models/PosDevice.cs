using System.ComponentModel.DataAnnotations;

namespace RestaurantPOS.API.Models
{
    public class PosDevice
    {
        [Key]
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string DeviceIdentifier { get; set; } = string.Empty; // Unique hardware ID or consistent token

        public string Type { get; set; } = "Mobile"; // Mobile, Tablet, Desktop

        public string Status { get; set; } = "Pending"; // Pending, Active, Blocked

        public string ConnectionType { get; set; } = "Local"; // Local, Internet

        public string IpAddress { get; set; } = string.Empty;

        public DateTime RequestTime { get; set; } = DateTime.UtcNow;

        public DateTime? LastConnected { get; set; }
    }
}
