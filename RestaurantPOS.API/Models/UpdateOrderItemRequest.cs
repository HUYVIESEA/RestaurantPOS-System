using System.ComponentModel.DataAnnotations;

namespace RestaurantPOS.API.Models
{
    public class UpdateOrderItemRequest
    {
        [Required]
        public int ProductId { get; set; }
        
        [Range(1, 1000)]
        public int Quantity { get; set; }
        
        public string? Note { get; set; }
    }
}