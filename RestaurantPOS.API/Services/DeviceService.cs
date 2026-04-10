using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Services;

public class DeviceService : IDeviceService
{
    private readonly ApplicationDbContext _context;

    private static string _currentStoreCode = "886622";
    private static DateTime _codeExpiry = DateTime.UtcNow.AddMinutes(10);

    public DeviceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PosDevice>> GetAllDevicesAsync()
    {
        return await _context.PosDevices
            .AsNoTracking()
            .OrderByDescending(d => d.RequestTime)
            .ToListAsync();
    }

    public async Task<PosDevice?> GetDeviceByIdAsync(Guid id)
    {
        return await _context.PosDevices.FindAsync(id);
    }

    public async Task<PosDevice> RequestConnectionAsync(PosDevice device)
    {
        var existing = await _context.PosDevices
            .FirstOrDefaultAsync(d => d.DeviceIdentifier == device.DeviceIdentifier);

        if (existing != null)
        {
            existing.Name = device.Name;
            existing.IpAddress = device.IpAddress;
            existing.LastConnected = DateTime.UtcNow;
            existing.ConnectionType = device.ConnectionType;
            await _context.SaveChangesAsync();
            return existing;
        }

        device.Id = Guid.NewGuid();
        device.RequestTime = DateTime.UtcNow;
        device.Status = "Pending";

        _context.PosDevices.Add(device);
        await _context.SaveChangesAsync();
        return device;
    }

    public async Task<PosDevice> ApproveDeviceAsync(Guid id)
    {
        var device = await _context.PosDevices.FindAsync(id)
            ?? throw new KeyNotFoundException("Device not found");

        device.Status = "Active";
        device.LastConnected = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return device;
    }

    public async Task<bool> RejectDeviceAsync(Guid id)
    {
        var device = await _context.PosDevices.FindAsync(id);
        if (device == null) return false;

        _context.PosDevices.Remove(device);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RevokeDeviceAsync(Guid id)
    {
        var device = await _context.PosDevices.FindAsync(id);
        if (device == null) return false;

        _context.PosDevices.Remove(device);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PosDevice> LinkInternetAsync(PosDevice device, string storeCode)
    {
        if (storeCode != _currentStoreCode || DateTime.UtcNow > _codeExpiry)
            throw new InvalidOperationException("Invalid or expired Store Code");

        var existing = await _context.PosDevices
            .FirstOrDefaultAsync(d => d.DeviceIdentifier == device.DeviceIdentifier);

        if (existing != null)
        {
            existing.Name = device.Name;
            existing.ConnectionType = "Internet";
            existing.LastConnected = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return existing;
        }

        device.Id = Guid.NewGuid();
        device.RequestTime = DateTime.UtcNow;
        device.Status = "Pending";
        device.ConnectionType = "Internet";

        _context.PosDevices.Add(device);
        await _context.SaveChangesAsync();
        return device;
    }

    public object GetStoreCode()
    {
        if (DateTime.UtcNow > _codeExpiry)
        {
            var random = new Random();
            _currentStoreCode = random.Next(100000, 999999).ToString();
            _codeExpiry = DateTime.UtcNow.AddMinutes(10);
        }

        return new { Code = _currentStoreCode, ExpiresAt = _codeExpiry };
    }

    public object RefreshStoreCode()
    {
        var random = new Random();
        _currentStoreCode = random.Next(100000, 999999).ToString();
        _codeExpiry = DateTime.UtcNow.AddMinutes(10);

        return new { Code = _currentStoreCode, ExpiresAt = _codeExpiry };
    }
}
