using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.Services
{
    public class PaymentSettingsService
    {
        private static readonly HttpClient _sharedHttpClient = new HttpClient();
        private static PaymentSettingsResponse? _cachedSettings;
        private static DateTime _lastFetchTime;
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

        public PaymentSettingsService()
        {
            // Use shared HttpClient
        }

        private void SetToken()
        {
            var token = UserSession.Instance.Token;
            if (!string.IsNullOrEmpty(token))
            {
                _sharedHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        public async Task<PaymentSettingsResponse?> GetSettingsAsync(bool forceRefresh = false)
        {
            // Return cached if available and still valid
            if (!forceRefresh && _cachedSettings != null && (DateTime.Now - _lastFetchTime) < CacheDuration)
            {
                return _cachedSettings;
            }

            try
            {
                SetToken();
                var httpResponse = await _sharedHttpClient.GetAsync($"{Constants.ApiBaseUrl}/PaymentSettings");
                
                if (!httpResponse.IsSuccessStatusCode)
                {
                    return new PaymentSettingsResponse { IsConfigured = false, Message = "Không thể kết nối API" };
                }

                var content = await httpResponse.Content.ReadAsStringAsync();
                
                if (string.IsNullOrEmpty(content) || !content.TrimStart().StartsWith("{"))
                {
                    return new PaymentSettingsResponse { IsConfigured = false, Message = "Phản hồi không hợp lệ" };
                }

                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                var result = System.Text.Json.JsonSerializer.Deserialize<PaymentSettingsResponse>(content, options);
                
                // Update Cache
                if (result != null)
                {
                    _cachedSettings = result;
                    _lastFetchTime = DateTime.Now;
                }
                
                return result;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GetSettingsAsync Error: {ex.Message}");
                return new PaymentSettingsResponse { IsConfigured = false, Message = ex.Message };
            }
        }

        public async Task<UpdateSettingsResult> UpdateSettingsAsync(string bankName, string bankBin, string accountNumber, string accountName, string password)
        {
            try
            {
                SetToken();
                var request = new
                {
                    BankName = bankName,
                    BankBin = bankBin,
                    AccountNumber = accountNumber,
                    AccountName = accountName,
                    Password = password
                };

                var response = await _sharedHttpClient.PutAsJsonAsync($"{Constants.ApiBaseUrl}/PaymentSettings", request);
                var content = await response.Content.ReadAsStringAsync();
                
                System.Diagnostics.Debug.WriteLine($"UpdateSettings Response: {(int)response.StatusCode} - {content}");
                
                if (response.IsSuccessStatusCode)
                {
                    // Invalidate cache
                    _cachedSettings = null; 
                    return new UpdateSettingsResult { Success = true, Message = "Cập nhật thành công!" };
                }

                // Try to parse error message from JSON
                if (!string.IsNullOrEmpty(content) && content.TrimStart().StartsWith("{"))
                {
                    try
                    {
                        var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                        var errorResponse = System.Text.Json.JsonSerializer.Deserialize<ErrorResponse>(content, options);
                        return new UpdateSettingsResult { Success = false, Message = errorResponse?.Message ?? $"Lỗi: {(int)response.StatusCode}" };
                    }
                    catch { }
                }

                // Return status code if can't parse
                return new UpdateSettingsResult { Success = false, Message = $"Lỗi API: {(int)response.StatusCode} - {response.ReasonPhrase}" };
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"UpdateSettingsAsync Error: {ex.Message}");
                return new UpdateSettingsResult { Success = false, Message = $"Lỗi kết nối: {ex.Message}" };
            }
        }
    }

    public class PaymentSettingsResponse
    {
        public bool IsConfigured { get; set; }
        public string? Message { get; set; }
        public string? BankName { get; set; }
        public string? BankBin { get; set; }
        public string? AccountNumber { get; set; }
        public string? AccountName { get; set; }
    }

    public class UpdateSettingsResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ErrorResponse
    {
        public string? Message { get; set; }
    }
}
