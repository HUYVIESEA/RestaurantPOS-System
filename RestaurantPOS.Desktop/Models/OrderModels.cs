using System;
using System.Collections.Generic;

namespace RestaurantPOS.Desktop.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int? TableId { get; set; }
        public string Status { get; set; } = "Pending";
        public decimal TotalAmount { get; set; }
        
        public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        
        [System.Text.Json.Serialization.JsonPropertyName("orderDate")]
        public DateTime CreatedAt { get; set; }
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        
        public Product? Product { get; set; }

        public string ProductName => Product?.Name ?? "Unknown Item";
        
        public int Quantity { get; set; }
        
        public decimal UnitPrice { get; set; }
        
        public decimal TotalPrice => Quantity * UnitPrice;

        [System.Text.Json.Serialization.JsonPropertyName("notes")]
        public string? Note { get; set; }
    }

    public class CreateOrderRequest
    {
        public int TableId { get; set; }
        
        [System.Text.Json.Serialization.JsonPropertyName("orderItems")]
        public List<CreateOrderItemRequest> Items { get; set; } = new List<CreateOrderItemRequest>();
    }

    public class CreateOrderItemRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; }
    }

    public class CompleteOrderRequest
    {
        public decimal ReceivedAmount { get; set; }
        public string PaymentMethod { get; set; } = "Cash";
    }
}
