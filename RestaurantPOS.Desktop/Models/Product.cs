using System;
using System.Text.Json.Serialization;

namespace RestaurantPOS.Desktop.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public string? Unit { get; set; }
        
        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        [JsonIgnore]
        public string CategoryName => Category?.Name ?? "Other";
    }
}
