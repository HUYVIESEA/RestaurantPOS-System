using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RestaurantPOS.Shared.EventBus;
using RestaurantPOS.Shared.Events;

namespace RestaurantPOS.NotificationService.EventConsumers;

public class NotificationEventConsumer : EventBusConsumer
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NotificationEventConsumer> _logger;

    public NotificationEventConsumer(IConfiguration configuration, IServiceScopeFactory scopeFactory, ILogger<NotificationEventConsumer> logger)
        : base(configuration, logger, "notification-service-queue", "pos.ordercreatedevent", "pos.ordercompletedevent", "pos.ordercancelledevent")
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task HandleEventAsync(string eventType, string message)
    {
        using var scope = _scopeFactory.CreateScope();

        switch (eventType)
        {
            case "OrderCreatedEvent":
                await HandleOrderCreated(message);
                break;
            case "OrderCompletedEvent":
                await HandleOrderCompleted(message);
                break;
            case "OrderCancelledEvent":
                await HandleOrderCancelled(message);
                break;
            default:
                _logger.LogWarning("Unknown event type: {EventType}", eventType);
                break;
        }
    }

    private async Task HandleOrderCreated(string message)
    {
        var evt = Deserialize<OrderCreatedEvent>(message);
        if (evt == null) return;
        _logger.LogInformation("New order #{OrderId} created with {ItemCount} items, total: {Total}",
            evt.OrderId, evt.Items.Count, evt.TotalAmount);
    }

    private async Task HandleOrderCompleted(string message)
    {
        var evt = Deserialize<OrderCompletedEvent>(message);
        if (evt == null) return;
        _logger.LogInformation("Order #{OrderId} completed via {Method}, total: {Total}",
            evt.OrderId, evt.PaymentMethod, evt.TotalAmount);
    }

    private async Task HandleOrderCancelled(string message)
    {
        var evt = Deserialize<OrderCancelledEvent>(message);
        if (evt == null) return;
        _logger.LogWarning("Order #{OrderId} cancelled: {Reason}", evt.OrderId, evt.Reason);
    }
}
