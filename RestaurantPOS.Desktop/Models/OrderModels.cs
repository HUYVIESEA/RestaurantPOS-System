namespace RestaurantPOS.Desktop.Models;

public class OrderDto
{
    public int Id { get; set; }
    
    // Backend doesn't have OrderNumber, use Id as fallback or map if added later
    public string OrderNumber => $"ORD-{Id:D6}"; 
    
    public int TableId { get; set; }
    
    // Backend returns Table object, we might need to extract Name manually or ignore if not needed for list
    // But for now let's keep it simple. If Backend includes Table object, we can't map directly to string TableName.
    public string TableName { get; set; } = string.Empty; 
    
    public string Status { get; set; } = "Pending"; 
    
    public decimal TotalAmount { get; set; }
    
    [System.Text.Json.Serialization.JsonPropertyName("orderItems")]
    public List<OrderItemDto> Items { get; set; } = new();
    
    [System.Text.Json.Serialization.JsonPropertyName("orderDate")]
    public DateTime CreatedAt { get; set; }
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    
    // Backend returns Product object inside OrderItem, we need to handle this.
    // OrderService.cs (Backend) includes Product: .ThenInclude(oi => oi.Product)
    // So JSON will have "product": { "name": "..." }
    // We can't map "product.name" directly to "ProductName" with simple attributes.
    // We need a custom converter or a nested DTO.
    // For simplicity, let's add a nested ProductDto property and a helper property.
    
    [System.Text.Json.Serialization.JsonPropertyName("product")]
    public ProductDto? Product { get; set; }

    public string ProductName => Product?.Name ?? "Unknown Product";
    
    [System.Text.Json.Serialization.JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("unitPrice")]
    public decimal UnitPrice { get; set; }
    
    public decimal Subtotal => Quantity * UnitPrice;
    
    [System.Text.Json.Serialization.JsonPropertyName("notes")]
    public string Notes { get; set; } = string.Empty;
}

public class CreateOrderRequest
{
    public int TableId { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class CreateOrderItemRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string Notes { get; set; } = string.Empty;
}

public class UpdateOrderStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class AddItemsToOrderRequest
{
    public int OrderId { get; set; }
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}
