using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Collections.Generic;

namespace RestaurantPOS.API.Models
{
    public class OrderItem
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public Order? Order { get; set; }

        public int ProductId { get; set; }

        public Product? Product { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        public decimal UnitPrice { get; set; }

        public string? Notes { get; set; }

        // F&B Enhancements
        public int? VariantId { get; set; }

        public string? ModifierItemIdsJson { get; set; }

        [NotMapped]
        public List<int>? ModifierItemIds
        {
            get => string.IsNullOrEmpty(ModifierItemIdsJson) ? new List<int>() : JsonSerializer.Deserialize<List<int>>(ModifierItemIdsJson);
            set => ModifierItemIdsJson = value == null ? null : JsonSerializer.Serialize(value);
        }
    }
}
