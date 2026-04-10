using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RestaurantPOS.Shared.EventBus;
using RestaurantPOS.Shared.Events;

namespace RestaurantPOS.OrderService.EventConsumers;

public class OrderEventConsumer : EventBusConsumer
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OrderEventConsumer> _logger;

    public OrderEventConsumer(IConfiguration configuration, IServiceScopeFactory scopeFactory, ILogger<OrderEventConsumer> logger)
        : base(configuration, logger, "order-service-queue", "pos.paymentcompletedevent", "pos.paymentfailedevent")
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task HandleEventAsync(string eventType, string message)
    {
        using var scope = _scopeFactory.CreateScope();

        switch (eventType)
        {
            case "PaymentCompletedEvent":
                await HandlePaymentCompleted(message);
                break;
            case "PaymentFailedEvent":
                await HandlePaymentFailed(message);
                break;
            default:
                _logger.LogWarning("Unknown event type: {EventType}", eventType);
                break;
        }
    }

    private async Task HandlePaymentCompleted(string message)
    {
        var evt = Deserialize<PaymentCompletedEvent>(message);
        if (evt == null) return;

        _logger.LogInformation("Payment completed for Order {OrderId}, Amount: {Amount}", evt.OrderId, evt.Amount);
        // Update order status to Paid via service layer
    }

    private async Task HandlePaymentFailed(string message)
    {
        var evt = Deserialize<PaymentFailedEvent>(message);
        if (evt == null) return;

        _logger.LogWarning("Payment failed for Order {OrderId}: {Reason}", evt.OrderId, evt.Reason);
        // Cancel order or retry payment
    }
}
