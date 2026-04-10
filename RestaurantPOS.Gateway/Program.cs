using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using RestaurantPOS.Shared.Middleware;
using RestaurantPOS.Shared.Observability;
using System.Text.Json;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureTracing("api-gateway");

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddHealthChecks();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseCors("AllowAll");

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
        await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { status = "ready", service = "api-gateway" }));
    }
});

app.MapReverseProxy();

app.Run();
