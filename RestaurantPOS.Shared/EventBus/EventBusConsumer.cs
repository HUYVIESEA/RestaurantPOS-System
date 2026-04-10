using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using RestaurantPOS.Shared.Events;

namespace RestaurantPOS.Shared.EventBus;

public abstract class EventBusConsumer : BackgroundService
{
    private readonly IConnection _connection;
    private readonly IChannel _channel;
    private readonly ILogger<EventBusConsumer> _logger;
    private readonly string _queueName;
    private readonly string[] _routingKeys;
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    protected EventBusConsumer(IConfiguration configuration, ILogger<EventBusConsumer> logger,
        string queueName, params string[] routingKeys)
    {
        _logger = logger;
        _queueName = queueName;
        _routingKeys = routingKeys;

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
        _channel.QueueDeclareAsync(queue: _queueName, durable: true, exclusive: false, autoDelete: false).GetAwaiter().GetResult();

        foreach (var key in _routingKeys)
        {
            _channel.QueueBindAsync(queue: _queueName, exchange: "pos_events", routingKey: key).GetAwaiter().GetResult();
        }

        _logger.LogInformation("EventBusConsumer '{Queue}' subscribed to [{Keys}]", queueName, string.Join(", ", routingKeys));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumer = new AsyncEventingBasicConsumer(_channel);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);
            var eventType = ea.BasicProperties.Type;

            _logger.LogInformation("Received event {EventType} (id: {MessageId})", eventType, ea.BasicProperties.MessageId);

            try
            {
                await HandleEventAsync(eventType, message);
                await _channel.BasicAckAsync(deliveryTag: ea.DeliveryTag, multiple: false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process event {EventType}", eventType);
                await _channel.BasicNackAsync(deliveryTag: ea.DeliveryTag, multiple: false, requeue: false);
            }
        };

        await _channel.BasicConsumeAsync(queue: _queueName, autoAck: false, consumer: consumer);

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(1000, stoppingToken);
        }
    }

    protected abstract Task HandleEventAsync(string eventType, string message);

    protected T? Deserialize<T>(string json) where T : class
    {
        return JsonSerializer.Deserialize<T>(json, JsonOptions);
    }

    public override void Dispose()
    {
        _channel?.CloseAsync();
        _connection?.CloseAsync();
        base.Dispose();
    }
}
