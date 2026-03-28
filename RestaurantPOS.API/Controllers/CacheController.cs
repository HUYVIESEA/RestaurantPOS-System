using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace RestaurantPOS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")] // Only admins can view cache statistics
public class CacheController : ControllerBase
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<CacheController> _logger;

    public CacheController(
        IConnectionMultiplexer redis,
        ILogger<CacheController> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    /// <summary>
    /// Get Redis cache statistics and health
    /// GET: api/Cache/stats
    /// </summary>
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetCacheStats()
    {
        try
        {
            var server = _redis.GetServer(_redis.GetEndPoints().First());
            var info = await server.InfoAsync();
            var db = _redis.GetDatabase();

            // Parse Redis INFO command output
            var stats = info
                .Where(section => section.Key == "Stats" || section.Key == "Memory")
                .SelectMany(section => section)
                .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);

            var result = new
            {
                Status = "Connected",
                Server = _redis.GetEndPoints().First().ToString(),
                Memory = new
                {
                    UsedMemory = stats.ContainsKey("used_memory_human") ? stats["used_memory_human"] : "N/A",
                    PeakMemory = stats.ContainsKey("used_memory_peak_human") ? stats["used_memory_peak_human"] : "N/A",
                    MaxMemory = stats.ContainsKey("maxmemory_human") ? stats["maxmemory_human"] : "N/A"
                },
                Stats = new
                {
                    TotalConnections = stats.ContainsKey("total_connections_received") ? stats["total_connections_received"] : "N/A",
                    TotalCommands = stats.ContainsKey("total_commands_processed") ? stats["total_commands_processed"] : "N/A",
                    KeyspaceHits = stats.ContainsKey("keyspace_hits") ? stats["keyspace_hits"] : "0",
                    KeyspaceMisses = stats.ContainsKey("keyspace_misses") ? stats["keyspace_misses"] : "0",
                    HitRate = CalculateHitRate(stats)
                },
                CacheKeys = new
                {
                    TotalKeys = await server.DatabaseSizeAsync(),
                    SampleKeys = await GetSampleKeysAsync(server)
                },
                Timestamp = DateTime.UtcNow
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cache statistics");
            return StatusCode(500, new { Error = "Failed to retrieve cache statistics", Message = ex.Message });
        }
    }

    /// <summary>
    /// Clear all cache entries
    /// DELETE: api/Cache/clear
    /// </summary>
    [HttpDelete("clear")]
    public async Task<ActionResult> ClearCache([FromQuery] string? pattern = null)
    {
        try
        {
            var server = _redis.GetServer(_redis.GetEndPoints().First());
            var db = _redis.GetDatabase();

            if (string.IsNullOrEmpty(pattern))
            {
                // Clear entire cache
                await server.FlushDatabaseAsync();
                _logger.LogWarning("ENTIRE cache cleared by admin");
                return Ok(new { Message = "All cache entries cleared", Pattern = "*" });
            }
            else
            {
                // Clear specific pattern
                var keys = server.Keys(pattern: pattern).ToArray();
                if (keys.Length > 0)
                {
                    await db.KeyDeleteAsync(keys);
                    _logger.LogWarning("Cache cleared for pattern: {Pattern}, Keys deleted: {Count}", pattern, keys.Length);
                    return Ok(new { Message = $"Cache cleared for pattern: {pattern}", KeysDeleted = keys.Length });
                }
                return Ok(new { Message = "No matching keys found", Pattern = pattern });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to clear cache");
            return StatusCode(500, new { Error = "Failed to clear cache", Message = ex.Message });
        }
    }

    /// <summary>
    /// Get specific cache entry by key
    /// GET: api/Cache/get/{key}
    /// </summary>
    [HttpGet("get/{key}")]
    public async Task<ActionResult> GetCacheEntry(string key)
    {
        try
        {
            var db = _redis.GetDatabase();
            var value = await db.StringGetAsync(key);
            
            if (value.IsNullOrEmpty)
            {
                return NotFound(new { Message = $"Key '{key}' not found in cache" });
            }

            var ttl = await db.KeyTimeToLiveAsync(key);
            
            return Ok(new
            {
                Key = key,
                Value = value.ToString(),
                TTL = ttl?.TotalSeconds ?? -1,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get cache entry for key: {Key}", key);
            return StatusCode(500, new { Error = "Failed to retrieve cache entry", Message = ex.Message });
        }
    }

    /// <summary>
    /// Health check for cache system
    /// GET: api/Cache/health
    /// </summary>
    [HttpGet("health")]
    [AllowAnonymous] // Allow health checks without auth
    public async Task<ActionResult> HealthCheck()
    {
        try
        {
            var db = _redis.GetDatabase();
            var ping = await db.PingAsync();
            
            return Ok(new
            {
                Status = "Healthy",
                ResponseTime = $"{ping.TotalMilliseconds:F2}ms",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cache health check failed");
            return StatusCode(503, new
            {
                Status = "Unhealthy",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    private string CalculateHitRate(Dictionary<string, string> stats)
    {
        if (stats.ContainsKey("keyspace_hits") && stats.ContainsKey("keyspace_misses"))
        {
            if (long.TryParse(stats["keyspace_hits"], out var hits) &&
                long.TryParse(stats["keyspace_misses"], out var misses))
            {
                var total = hits + misses;
                if (total > 0)
                {
                    var hitRate = (double)hits / total * 100;
                    return $"{hitRate:F2}%";
                }
            }
        }
        return "N/A";
    }

    private async Task<List<string>> GetSampleKeysAsync(IServer server, int count = 10)
    {
        var keys = server.Keys(pageSize: count).Take(count).Select(k => k.ToString()).ToList();
        return keys;
    }
}
