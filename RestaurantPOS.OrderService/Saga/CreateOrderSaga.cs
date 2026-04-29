using RestaurantPOS.OrderService.Models;
using RestaurantPOS.OrderService.Clients;
using RestaurantPOS.OrderService.Data;
using RestaurantPOS.Shared.Saga;
using RestaurantPOS.Shared.Http;
using RestaurantPOS.Shared.EventBus;
using RestaurantPOS.Shared.Events;
using Microsoft.Extensions.Logging;

namespace RestaurantPOS.OrderService.Saga;

public class CreateOrderSagaContext
{
    public Order Order { get; set; } = new();
    public string? CorrelationId { get; set; }
    public int? PaymentId { get; set; }
    public bool StockReserved { get; set; }
    public bool PaymentProcessed { get; set; }
    public List<int> ReservedProductIds { get; set; } = new();
    public string? ErrorMessage { get; set; }
}

public class ReserveStockStep : ISagaStep<CreateOrderSagaContext>
{
    public string Name => "ReserveStock";
    private readonly IProductClient _productClient;
    private readonly ILogger<ReserveStockStep> _logger;

    public ReserveStockStep(IProductClient productClient, ILogger<ReserveStockStep> logger)
    {
        _productClient = productClient;
        _logger = logger;
    }

    public async Task ExecuteAsync(CreateOrderSagaContext context)
    {
        // Run stock checks in parallel to avoid N+1 slow HTTP requests
        var stockTasks = context.Order.Items.Select(async item => 
        {
            var available = await _productClient.CheckStockAsync(item.ProductId, item.Quantity, context.CorrelationId);
            if (!available)
                throw new InvalidOperationException($"Product {item.ProductId} unavailable");
            
            return item.ProductId;
        });

        var reservedIds = await Task.WhenAll(stockTasks);

        foreach (var id in reservedIds)
        {
            context.ReservedProductIds.Add(id);
            var item = context.Order.Items.First(i => i.ProductId == id);
            _logger.LogInformation("Reserved stock for product {ProductId}, qty {Qty}", item.ProductId, item.Quantity);
        }
        
        context.StockReserved = true;
    }

    public Task CompensateAsync(CreateOrderSagaContext context)
    {
        _logger.LogWarning("Compensating stock reservation for products [{Ids}]", string.Join(", ", context.ReservedProductIds));
        context.StockReserved = false;
        context.ReservedProductIds.Clear();
        return Task.CompletedTask;
    }
}

public class ProcessPaymentStep : ISagaStep<CreateOrderSagaContext>
{
    public string Name => "ProcessPayment";
    private readonly ResilientHttpClient _httpClient;
    private readonly ILogger<ProcessPaymentStep> _logger;
    private readonly string _paymentServiceUrl;

    public ProcessPaymentStep(ResilientHttpClient httpClient, ILogger<ProcessPaymentStep> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _paymentServiceUrl = configuration["ServiceUrls:PaymentService"] ?? "http://localhost:5003";
    }

    public async Task ExecuteAsync(CreateOrderSagaContext context)
    {
        var payment = new
        {
            orderId = context.Order.Id,
            amount = context.Order.TotalAmount,
            method = context.Order.PaymentMethod,
            status = "Pending"
        };

        var result = await _httpClient.PostAsync<object, PaymentResult>($"{_paymentServiceUrl}/api/payments", payment, context.CorrelationId);
        if (result == null)
            throw new InvalidOperationException("Payment service unavailable");

        context.PaymentId = result.Id;
        context.PaymentProcessed = true;
        _logger.LogInformation("Payment {PaymentId} created for order {OrderId}", result.Id, context.Order.Id);
    }

    public async Task CompensateAsync(CreateOrderSagaContext context)
    {
        if (context.PaymentId.HasValue)
        {
            _logger.LogWarning("Cancelling payment {PaymentId} for order {OrderId}", context.PaymentId, context.Order.Id);
            context.PaymentProcessed = false;
        }
        await Task.CompletedTask;
    }

    private class PaymentResult { public int Id { get; set; } }
}

public class SendNotificationStep : ISagaStep<CreateOrderSagaContext>
{
    public string Name => "SendNotification";
    private readonly IEventBus _eventBus;
    private readonly ILogger<SendNotificationStep> _logger;

    public SendNotificationStep(IEventBus eventBus, ILogger<SendNotificationStep> logger)
    {
        _eventBus = eventBus;
        _logger = logger;
    }

    public async Task ExecuteAsync(CreateOrderSagaContext context)
    {
        var evt = new OrderCreatedEvent
        {
            CorrelationId = context.CorrelationId,
            OrderId = context.Order.Id,
            TotalAmount = context.Order.TotalAmount,
            TableId = context.Order.TableId?.ToString(),
            Items = context.Order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        await _eventBus.PublishAsync(evt);
        _logger.LogInformation("Published OrderCreatedEvent for order {OrderId}", context.Order.Id);
    }

    public Task CompensateAsync(CreateOrderSagaContext context)
    {
        _logger.LogWarning("Notification already sent for order {OrderId} - cannot compensate", context.Order.Id);
        return Task.CompletedTask;
    }
}
