using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using RestaurantPOS.Desktop.ViewModels; // For LinkedDevice
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.Services
{
    public class DeviceService
    {
        private readonly HttpClient _httpClient;
        private const string BaseUrl = "http://localhost:5000/api/devices"; // Adjust if needed

        private static DeviceService? _instance;
        public static DeviceService Instance => _instance ??= new DeviceService();

        private DeviceService()
        {
            _httpClient = new HttpClient { BaseAddress = new Uri(BaseUrl) };
        }

        public async Task<List<LinkedDevice>> GetDevicesAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("");
                if (response.IsSuccessStatusCode)
                {
                    var devices = await response.Content.ReadFromJsonAsync<List<PosDeviceDto>>();
                    return devices?.Select(MapToLinkedDevice).ToList() ?? new List<LinkedDevice>();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error fetching devices: {ex.Message}");
            }
            return new List<LinkedDevice>();
        }

        public async Task<StoreCodeResponse?> GetStoreCodeAsync()
        {
            try
            {
                return await _httpClient.GetFromJsonAsync<StoreCodeResponse>("store-code");
            }
            catch
            {
                return null;
            }
        }

        public async Task<StoreCodeResponse?> RefreshStoreCodeAsync()
        {
            try
            {
                var response = await _httpClient.PostAsync("refresh-code", null);
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<StoreCodeResponse>();
                }
            }
            catch { }
            return null;
        }

        public async Task<bool> ApproveDeviceAsync(string id)
        {
            try
            {
                var response = await _httpClient.PostAsync($"approve/{id}", null);
                return response.IsSuccessStatusCode;
            }
            catch { return false; }
        }

        public async Task<bool> RejectDeviceAsync(string id)
        {
            try
            {
                var response = await _httpClient.PostAsync($"reject/{id}", null);
                return response.IsSuccessStatusCode;
            }
            catch { return false; }
        }

        public async Task<bool> RevokeDeviceAsync(string id)
        {
            try
            {
                var response = await _httpClient.DeleteAsync($"{id}");
                return response.IsSuccessStatusCode;
            }
            catch { return false; }
        }

        private LinkedDevice MapToLinkedDevice(PosDeviceDto dto)
        {
            return new LinkedDevice
            {
                Id = dto.Id.ToString(),
                Name = dto.Name,
                IpAddress = dto.IpAddress,
                Type = dto.Type,
                ConnectionType = dto.ConnectionType,
                RequestTime = dto.RequestTime,
                ConnectedTime = dto.LastConnected,
                Status = dto.Status
            };
        }
    }

    // DTO matching API model
    public class PosDeviceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string DeviceIdentifier { get; set; } = string.Empty;
        public string Type { get; set; } = "Mobile";
        public string Status { get; set; } = "Pending";
        public string ConnectionType { get; set; } = "Local";
        public string IpAddress { get; set; } = string.Empty;
        public DateTime RequestTime { get; set; }
        public DateTime? LastConnected { get; set; }
    }

    public class StoreCodeResponse
    {
        public string Code { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
