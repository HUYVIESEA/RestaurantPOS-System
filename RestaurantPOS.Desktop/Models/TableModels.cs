namespace RestaurantPOS.Desktop.Models;

public class TableDto
{
    public int Id { get; set; }
    
    [System.Text.Json.Serialization.JsonPropertyName("tableNumber")]
    public string Name { get; set; } = string.Empty;
    
    public int Capacity { get; set; }
    
    public bool IsAvailable { get; set; }

    public string Status => IsAvailable ? "Available" : "Occupied";

    public int? CurrentOrderId { get; set; }
    public DateTime? OccupiedAt { get; set; }
    public string? CurrentOrderNumber { get; set; }
    public decimal? CurrentOrderTotal { get; set; }
}

public class UpdateTableStatusRequest
{
    public string Status { get; set; } = string.Empty;
}
