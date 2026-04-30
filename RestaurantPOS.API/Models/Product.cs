using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace RestaurantPOS.API.Models
{
    public class Product
    {
      public int Id { get; set; }

        [Required]
        [StringLength(100)]
    public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

     [Required]
        [Range(0, double.MaxValue)]
   public decimal Price { get; set; }

        public int CategoryId { get; set; }

 public Category? Category { get; set; }

   public string? ImageUrl { get; set; }

        public int StockQuantity { get; set; }

        public bool IsAvailable { get; set; } = true;

        [JsonIgnore]
        public string VariantsJson { get; set; } = "[]";

        [JsonIgnore]
        public string ModifiersJson { get; set; } = "[]";

        [NotMapped]
        public List<ProductVariant>? Variants
        {
            get => string.IsNullOrEmpty(VariantsJson) ? new List<ProductVariant>() : JsonSerializer.Deserialize<List<ProductVariant>>(VariantsJson);
            set => VariantsJson = JsonSerializer.Serialize(value ?? new List<ProductVariant>());
        }

        [NotMapped]
        public List<ProductModifier>? Modifiers
        {
            get => string.IsNullOrEmpty(ModifiersJson) ? new List<ProductModifier>() : JsonSerializer.Deserialize<List<ProductModifier>>(ModifiersJson);
            set => ModifiersJson = JsonSerializer.Serialize(value ?? new List<ProductModifier>());
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime? UpdatedAt { get; set; }
    }

    public class ProductVariant
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal PriceDelta { get; set; }
    }

    public class ProductModifier
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<ModifierItem> Items { get; set; } = new();
    }

    public class ModifierItem
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal PriceDelta { get; set; }
    }
}
