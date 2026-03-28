using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

namespace RestaurantPOS.API.Services;

/// <summary>
/// Hybrid Cache Service - Two-tier caching (L1: Memory + L2: Redis)
/// For maximum performance in enterprise environments
/// </summary>
public class HybridCacheService : ICacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly IDistributedCache _distributedCache;
    private readonly ILogger<HybridCacheService> _logger;
    
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = false
    };

    // L1 cache (memory) - Very fast but limited size
    private static readonly TimeSpan MemoryCacheExpiration = TimeSpan.FromMinutes(5);
    
    // L2 cache (Redis) - Slower but distributed and larger
    private static readonly TimeSpan DistributedCacheExpiration = TimeSpan.FromMinutes(30);

    public HybridCacheService(
        IMemoryCache memoryCache,
        IDistributedCache distributedCache,
        ILogger<HybridCacheService> logger)
    {
        _memoryCache = memoryCache;
        _distributedCache = distributedCache;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            // L1: Try memory cache first (fastest)
            if (_memoryCache.TryGetValue<T>(key, out var memoryCached))
            {
                _logger.LogDebug("L1 Cache HIT (Memory): {Key}", key);
                return memoryCached;
            }

            // L2: Try Redis (distributed)
            var redisCached = await _distributedCache.GetStringAsync(key, cancellationToken);
            
            if (!string.IsNullOrEmpty(redisCached))
            {
                _logger.LogDebug("L2 Cache HIT (Redis): {Key}", key);
                var value = JsonSerializer.Deserialize<T>(redisCached, _jsonOptions);
                
                // Promote to L1 cache
                if (value != null)
                {
                    _memoryCache.Set(key, value, MemoryCacheExpiration);
                    _logger.LogDebug("Promoted to L1: {Key}", key);
                }
                
                return value;
            }

            _logger.LogDebug("Cache MISS (both levels): {Key}", key);
            return default;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache key: {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(
        string key, 
        T value, 
        TimeSpan? expiration = null, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            var l1Expiration = expiration ?? MemoryCacheExpiration;
            var l2Expiration = expiration ?? DistributedCacheExpiration;

            // Store in L1 (Memory) - Fast access
            _memoryCache.Set(key, value, l1Expiration);

            // Store in L2 (Redis) - Distributed access
            var json = JsonSerializer.Serialize(value, _jsonOptions);
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = l2Expiration
            };

            await _distributedCache.SetStringAsync(key, json, options, cancellationToken);
            
            _logger.LogDebug("Cache SET (both levels): {Key} - L1:{L1Exp}, L2:{L2Exp}", 
                key, l1Expiration, l2Expiration);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cache key: {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            // Remove from both levels
            _memoryCache.Remove(key);
            await _distributedCache.RemoveAsync(key, cancellationToken);
            
            _logger.LogDebug("Cache REMOVED (both levels): {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache key: {Key}", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        _logger.LogWarning("RemoveByPrefix not fully implemented. Consider using Redis SCAN.");
        await Task.CompletedTask;
    }
}
