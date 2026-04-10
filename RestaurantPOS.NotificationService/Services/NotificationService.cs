using Microsoft.EntityFrameworkCore;
using RestaurantPOS.NotificationService.Data;
using RestaurantPOS.NotificationService.Models;

namespace RestaurantPOS.NotificationService.Services;

public interface INotificationService
{
    Task RegisterDeviceAsync(int userId, string deviceToken, string? deviceType);
    Task<IEnumerable<string>> GetUserDeviceTokensAsync(int userId);
    Task LogNotificationAsync(int userId, string title, string message, bool isSent, string? error = null);
}

public class NotificationServiceImpl : INotificationService
{
    private readonly NotificationDbContext _context;

    public NotificationServiceImpl(NotificationDbContext context)
    {
        _context = context;
    }

    public async Task RegisterDeviceAsync(int userId, string deviceToken, string? deviceType)
    {
        var existingDevice = await _context.UserDevices
            .FirstOrDefaultAsync(d => d.DeviceToken == deviceToken);

        if (existingDevice != null)
        {
            if (existingDevice.UserId != userId)
                existingDevice.UserId = userId;
            existingDevice.LastUpdated = DateTime.UtcNow;
            existingDevice.DeviceType = deviceType ?? existingDevice.DeviceType;
        }
        else
        {
            _context.UserDevices.Add(new UserDevice
            {
                UserId = userId,
                DeviceToken = deviceToken,
                DeviceType = deviceType,
                LastUpdated = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<string>> GetUserDeviceTokensAsync(int userId)
    {
        return await _context.UserDevices
            .Where(d => d.UserId == userId)
            .Select(d => d.DeviceToken)
            .ToListAsync();
    }

    public async Task LogNotificationAsync(int userId, string title, string message, bool isSent, string? error = null)
    {
        _context.NotificationLogs.Add(new NotificationLog
        {
            UserId = userId,
            Title = title,
            Message = message,
            IsSent = isSent,
            Error = error
        });
        await _context.SaveChangesAsync();
    }
}
