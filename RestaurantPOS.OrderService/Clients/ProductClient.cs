using RestaurantPOS.OrderService.Models;
using RestaurantPOS.Shared.Http;
using RestaurantPOS.Shared.Resilience;
using Microsoft.Extensions.Logging;

namespace RestaurantPOS.OrderService.Clients;

public interface IProductClient
{
    Task<ProductDto?> GetProductAsync(int productId, string? correlationId = null);
    Task<bool> CheckStockAsync(int productId, int quantity, string? correlationId = null);
}

public class ProductClient : IProductClient
{
    private readonly ResilientHttpClient _httpClient;
    private readonly CircuitBreaker _circuitBreaker;
    private readonly ILogger<ProductClient> _logger;
    private readonly string _baseUrl;

    public ProductClient(ResilientHttpClient httpClient, ILogger<ProductClient> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _baseUrl = configuration["ServiceUrls:ProductService"] ?? "http://localhost:5002";
        _circuitBreaker = new CircuitBreaker(failureThreshold: 5, resetTimeoutSeconds: 30);
    }

    public async Task<ProductDto?> GetProductAsync(int productId, string? correlationId = null)
    {
        return await _circuitBreaker.ExecuteAsync(
            async () => await _httpClient.GetAsync<ProductDto>($"{_baseUrl}/api/products/{productId}", correlationId),
            fallback: () => Task.FromResult<ProductDto?>(null)
        );
    }

    public async Task<bool> CheckStockAsync(int productId, int quantity, string? correlationId = null)
    {
        var product = await GetProductAsync(productId, correlationId);
        if (product == null)
        {
            _logger.LogWarning("Product {ProductId} not found or service unavailable", productId);
            return false;
        }

        if (!product.IsAvailable)
        {
            _logger.LogWarning("Product {ProductId} is not available", productId);
            return false;
        }

        if (product.StockQuantity < quantity)
        {
            _logger.LogWarning("Product {ProductId} has insufficient stock: {Stock} < {Requested}", productId, product.StockQuantity, quantity);
            return false;
        }

        return true;
    }
}
