using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantPOS.API.Models
{
    public class Shift
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal StartingCash { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? EndingCash { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? ExpectedCash { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Active"; // Active, Closed

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}