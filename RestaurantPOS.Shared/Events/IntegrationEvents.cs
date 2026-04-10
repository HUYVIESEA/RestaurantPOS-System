namespace RestaurantPOS.Shared.Events;

public interface IIntegrationEvent
{
    Guid EventId { get; }
    DateTime OccurredOn { get; }
    string EventType { get; }
    string? CorrelationId { get; }
}

public abstract class IntegrationEvent : IIntegrationEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
    public string EventType => GetType().Name;
    public string? CorrelationId { get; set; }
}

// Order Events
public class OrderCreatedEvent : IntegrationEvent
{
    public int OrderId { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string? TableId { get; set; }
}

public class OrderCompletedEvent : IntegrationEvent
{
    public int OrderId { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
}

public class OrderCancelledEvent : IntegrationEvent
{
    public int OrderId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

// Payment Events
public class PaymentCompletedEvent : IntegrationEvent
{
    public int OrderId { get; set; }
    public int PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string TransactionId { get; set; } = string.Empty;
}

public class PaymentFailedEvent : IntegrationEvent
{
    public int OrderId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

// Product Events
public class ProductStockUpdatedEvent : IntegrationEvent
{
    public int ProductId { get; set; }
    public int NewStockQuantity { get; set; }
}

// Notification Events
public class NotificationRequestedEvent : IntegrationEvent
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Channel { get; set; } = "push";
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
