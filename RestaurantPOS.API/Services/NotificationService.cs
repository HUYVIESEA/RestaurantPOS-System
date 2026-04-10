using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;

    public NotificationService(ApplicationDbContext context)
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
            {
                existingDevice.UserId = userId;
            }
            existingDevice.LastUpdated = DateTime.UtcNow;
            existingDevice.DeviceType = deviceType ?? existingDevice.DeviceType;
        }
        else
        {
            var newDevice = new UserDevice
            {
                UserId = userId,
                DeviceToken = deviceToken,
                DeviceType = deviceType,
                LastUpdated = DateTime.UtcNow
            };
            _context.UserDevices.Add(newDevice);
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
}
