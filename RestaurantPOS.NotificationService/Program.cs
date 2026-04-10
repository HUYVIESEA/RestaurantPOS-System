using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using RestaurantPOS.NotificationService.Data;
using RestaurantPOS.NotificationService.Services;
using RestaurantPOS.NotificationService.EventConsumers;
using RestaurantPOS.Shared.Middleware;
using RestaurantPOS.Shared.Http;
using RestaurantPOS.Shared.Observability;
using RestaurantPOS.Shared.EventBus;
using System.Text.Json;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureTracing("notification-service");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var port = builder.Configuration.GetValue<int>("PORT", 5004);
builder.WebHost.ConfigureKestrel(options => options.ListenAnyIP(port));

builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<INotificationService, NotificationServiceImpl>();
builder.Services.AddHttpClient<ResilientHttpClient>();
builder.Services.AddSingleton<IEventBus, RabbitMqEventBus>();
builder.Services.AddHostedService<NotificationEventConsumer>();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<NotificationDbContext>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
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

app.MapHealthChecks("/health/live", new HealthCheckOptions { ResponseWriter = async (ctx, report) => { ctx.Response.ContentType = "application/json"; await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { status = "alive" })); } });
app.MapHealthChecks("/health/ready", new HealthCheckOptions { ResponseWriter = async (ctx, report) => { ctx.Response.ContentType = "application/json"; await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { status = "ready", service = "notification-service" })); } });

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
    db.Database.Migrate();
}

app.Run();
