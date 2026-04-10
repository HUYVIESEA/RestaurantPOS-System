namespace RestaurantPOS.NotificationService.Models;

public class UserDevice
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string DeviceToken { get; set; } = string.Empty;
    public string? DeviceType { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}

public class NotificationLog
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Topic { get; set; }
    public bool IsSent { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public string? Error { get; set; }
}
