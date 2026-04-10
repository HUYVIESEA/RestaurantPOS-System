using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using RestaurantPOS.Shared.Events;

namespace RestaurantPOS.Shared.EventBus;

public interface IEventBus
{
    Task PublishAsync<T>(T @event) where T : IIntegrationEvent;
}

public class RabbitMqEventBus : IEventBus, IDisposable
{
    private readonly IConnection _connection;
    private readonly IChannel _channel;
    private readonly ILogger<RabbitMqEventBus> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public RabbitMqEventBus(IConfiguration configuration, ILogger<RabbitMqEventBus> logger)
    {
        _logger = logger;
        var factory = new ConnectionFactory
        {
            HostName = configuration["RabbitMQ:HostName"] ?? "localhost",
            Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672"),
            UserName = configuration["RabbitMQ:UserName"] ?? "guest",
            Password = configuration["RabbitMQ:Password"] ?? "guest"
        };

        _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        _channel = _connection.CreateChannelAsync().GetAwaiter().GetResult();
        _channel.ExchangeDeclareAsync(exchange: "pos_events", type: ExchangeType.Topic, durable: true).GetAwaiter().GetResult();
        _logger.LogInformation("RabbitMQ EventBus connected to {Host}", factory.HostName);
    }

    public async Task PublishAsync<T>(T @event) where T : IIntegrationEvent
    {
        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(@event, JsonOptions));
        var properties = new BasicProperties
        {
            Persistent = true,
            MessageId = @event.EventId.ToString(),
            Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds()),
            Type = @event.EventType
        };

        if (!string.IsNullOrEmpty(@event.CorrelationId))
            properties.Headers = new Dictionary<string, object> { ["x-correlation-id"] = @event.CorrelationId };

        var routingKey = $"pos.{@event.EventType.ToLower()}";
        await _channel.BasicPublishAsync(exchange: "pos_events", routingKey: routingKey, mandatory: false, basicProperties: properties, body: body);

        _logger.LogInformation("Published event {EventType} (id: {EventId}) to {RoutingKey}",
            @event.EventType, @event.EventId, routingKey);
    }

    public void Dispose()
    {
        _channel?.CloseAsync();
        _connection?.CloseAsync();
    }
}
