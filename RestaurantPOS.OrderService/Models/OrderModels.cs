namespace RestaurantPOS.OrderService.Models;

public class Order
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public string Status { get; set; } = "Pending";
    public string PaymentMethod { get; set; } = "Cash";
    public string PaymentStatus { get; set; } = "Unpaid";
    public string? Notes { get; set; }
    public int? TableId { get; set; }
    public string OrderType { get; set; } = "DineIn";
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public int? ParentOrderId { get; set; }
    public int? OrderGroupId { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string? Notes { get; set; }
    public Order? Order { get; set; }
}

public class Table
{
    public int Id { get; set; }
    public string TableNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string Floor { get; set; } = "Ground";
    public bool IsAvailable { get; set; } = true;
    public DateTime? OccupiedAt { get; set; }
    public bool IsMerged { get; set; }
    public int? MergedGroupId { get; set; }
    public string? MergedTableNumbers { get; set; }
}

public class PosDevice
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string IpAddress { get; set; } = string.Empty;
    public string MacAddress { get; set; } = string.Empty;
    public string DeviceIdentifier { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending";
    public DateTime RequestTime { get; set; }
    public DateTime? LastConnected { get; set; }
    public string ConnectionType { get; set; } = "LAN";
}
