using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Services;

public interface IDeviceService
{
    Task<IEnumerable<PosDevice>> GetAllDevicesAsync();
    Task<PosDevice?> GetDeviceByIdAsync(Guid id);
    Task<PosDevice> RequestConnectionAsync(PosDevice device);
    Task<PosDevice> ApproveDeviceAsync(Guid id);
    Task<bool> RejectDeviceAsync(Guid id);
    Task<bool> RevokeDeviceAsync(Guid id);
    Task<PosDevice> LinkInternetAsync(PosDevice device, string storeCode);
    object GetStoreCode();
    object RefreshStoreCode();
}
