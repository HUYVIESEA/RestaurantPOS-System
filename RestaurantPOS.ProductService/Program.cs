using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using RestaurantPOS.ProductService.Data;
using RestaurantPOS.ProductService.Services;
using RestaurantPOS.Shared.Middleware;
using RestaurantPOS.Shared.Http;
using RestaurantPOS.Shared.Observability;
using System.Text.Json;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.ConfigureTracing("product-service");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddMemoryCache();

var port = builder.Configuration.GetValue<int>("PORT", 5002);
builder.WebHost.ConfigureKestrel(options => options.ListenAnyIP(port));

builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IProductService, ProductServiceImpl>();
builder.Services.AddHttpClient<ResilientHttpClient>();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ProductDbContext>();

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
app.MapHealthChecks("/health/ready", new HealthCheckOptions { ResponseWriter = async (ctx, report) => { ctx.Response.ContentType = "application/json"; await ctx.Response.WriteAsync(JsonSerializer.Serialize(new { status = "ready", service = "product-service" })); } });

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
    db.Database.Migrate();
}

app.Run();
