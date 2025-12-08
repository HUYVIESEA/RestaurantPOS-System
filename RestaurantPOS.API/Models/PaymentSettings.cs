using System.ComponentModel.DataAnnotations;

namespace RestaurantPOS.API.Models
{
    /// <summary>
    /// Payment settings for the restaurant (bank account info for QR payments)
    /// Stored securely and only accessible by Admin
    /// </summary>
    public class PaymentSettings
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string BankName { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string BankBin { get; set; } = string.Empty; // VietQR Bank BIN

        [Required]
        [StringLength(50)]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string AccountName { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }

        public int? UpdatedByUserId { get; set; }
    }
}
