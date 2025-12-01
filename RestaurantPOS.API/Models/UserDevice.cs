using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantPOS.API.Models
{
    public class UserDevice
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        public string DeviceToken { get; set; } = string.Empty;

        public string? DeviceType { get; set; } // Android, iOS, Web

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
