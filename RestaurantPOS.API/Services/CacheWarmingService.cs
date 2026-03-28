using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;

namespace RestaurantPOS.API.Services;

/// <summary>
/// Cache Warming Service - Preloads frequently accessed data into cache on startup
/// Improves initial response times for enterprise applications
/// </summary>
public class CacheWarmingService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CacheWarmingService> _logger;

    public CacheWarmingService(
        IServiceProvider serviceProvider,
        ILogger<CacheWarmingService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("🔥 Cache Warming: Starting...");
        
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var productService = scope.ServiceProvider.GetRequiredService<IProductService>();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var cache = scope.ServiceProvider.GetRequiredService<ICacheService>();

            var startTime = DateTime.UtcNow;

            // Warm up products cache (most frequently accessed)
            _logger.LogInformation("Warming up products cache...");
            var products = await productService.GetAllProductsAsync();
            _logger.LogInformation("✅ Cached {Count} products", products.Count());

            // Warm up categories
            _logger.LogInformation("Warming up categories cache...");
            var categories = await context.Categories.AsNoTracking().ToListAsync(cancellationToken);
            await cache.SetAsync("categories:all", categories, TimeSpan.FromHours(1), cancellationToken);
            _logger.LogInformation("✅ Cached {Count} categories", categories.Count);

            // Warm up recent orders (last 24 hours)
            _logger.LogInformation("Warming up recent orders cache...");
            var yesterday = DateTime.UtcNow.AddDays(-1);
            var recentOrders = await context.Orders
                .AsNoTracking()
                .Include(o => o.OrderItems)
                .Where(o => o.OrderDate >= yesterday)
                .Take(100)
                .ToListAsync(cancellationToken);
            
            foreach (var order in recentOrders.Take(20)) // Cache top 20 recent orders
            {
                await cache.SetAsync($"order:{order.Id}", order, TimeSpan.FromMinutes(10), cancellationToken);
            }
            _logger.LogInformation("✅ Cached {Count} recent orders", Math.Min(20, recentOrders.Count));

            var duration = (DateTime.UtcNow - startTime).TotalSeconds;
            _logger.LogInformation("🔥 Cache Warming: Completed in {Duration:F2} seconds", duration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Cache warming failed");
        }

        return;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Cache Warming Service stopped");
        return Task.CompletedTask;
    }
}
