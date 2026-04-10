namespace RestaurantPOS.API.Services;

public interface INotificationService
{
    Task RegisterDeviceAsync(int userId, string deviceToken, string? deviceType);
    Task<IEnumerable<string>> GetUserDeviceTokensAsync(int userId);
}
