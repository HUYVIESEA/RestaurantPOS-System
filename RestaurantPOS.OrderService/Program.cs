using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using RestaurantPOS.OrderService.Data;
using RestaurantPOS.OrderService.Services;
using RestaurantPOS.OrderService.Clients;
using RestaurantPOS.OrderService.EventConsumers;
using RestaurantPOS.OrderService.Saga;
using RestaurantPOS.Shared.Middleware;
using RestaurantPOS.Shared.Http;
using RestaurantPOS.Shared.Observability;
using RestaurantPOS.Shared.EventBus;
using RestaurantPOS.Shared.Saga;
using System.Text.Json;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureTracing("order-service");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var port = builder.Configuration.GetValue<int>("PORT", 5001);
builder.WebHost.ConfigureKestrel(options => options.ListenAnyIP(port));

builder.Services.AddDbContext<OrderDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IOrderService, OrderServiceImpl>();
builder.Services.AddHttpClient<ResilientHttpClient>();
builder.Services.AddScoped<IProductClient, ProductClient>();
builder.Services.AddSingleton<IEventBus, RabbitMqEventBus>();
builder.Services.AddHostedService<OrderEventConsumer>();

// Register Saga orchestrator with all steps
builder.Services.AddScoped<ReserveStockStep>();
builder.Services.AddScoped<ProcessPaymentStep>();
builder.Services.AddScoped<SendNotificationStep>();
builder.Services.AddScoped<SagaOrchestrator<CreateOrderSagaContext>>(sp =>
{
    var logger = sp.GetRequiredService<ILogger<SagaOrchestrator<CreateOrderSagaContext>>>();
    var steps = new ISagaStep<CreateOrderSagaContext>[]
    {
        sp.GetRequiredService<ReserveStockStep>(),
        sp.GetRequiredService<ProcessPaymentStep>(),
        sp.GetRequiredService<SendNotificationStep>()
    };
    return new SagaOrchestrator<CreateOrderSagaContext>(steps, logger);
});

builder.Services.AddHealthChecks()
    .AddDbContextCheck<OrderDbContext>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    ResponseWriter = async (ctx, report) =>
    {
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { status = "alive" }));
    }
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    ResponseWriter = async (ctx, report) =>
    {
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { status = "ready", service = "order-service" }));
    }
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    db.Database.Migrate();
}

app.Run();
