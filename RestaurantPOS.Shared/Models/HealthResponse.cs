namespace RestaurantPOS.Shared.Models;

public class HealthResponse
{
    public string Status { get; set; } = "healthy";
    public string Service { get; set; } = string.Empty;
    public string Version { get; set; } = "1.0.0";
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public Dictionary<string, HealthCheckDetail> Checks { get; set; } = new();
}

public class HealthCheckDetail
{
    public string Status { get; set; } = "healthy";
    public string? Message { get; set; }
    public double? DurationMs { get; set; }
}
