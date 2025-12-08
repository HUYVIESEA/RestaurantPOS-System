using System.Net.Http.Json;

namespace RestaurantPOS.API.Services.VietQR
{
    public class VietQRService : IVietQRService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<VietQRService> _logger;
        private List<BankInfo>? _cachedBanks;

        public VietQRService(IHttpClientFactory httpClientFactory, ILogger<VietQRService> logger)
        {
            _httpClient = httpClientFactory.CreateClient();
            _logger = logger;
        }

        public async Task<List<BankInfo>> GetBanksAsync()
        {
            // Return cached if available
            if (_cachedBanks != null && _cachedBanks.Any())
            {
                return _cachedBanks;
            }

            try
            {
                var response = await _httpClient.GetFromJsonAsync<VietQRBankResponse>("https://api.vietqr.io/v2/banks");
                if (response?.Data != null)
                {
                    _cachedBanks = response.Data;
                    return _cachedBanks;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching banks from VietQR API");
            }

            return new List<BankInfo>();
        }

        public string GenerateQRUrl(string bankBin, string accountNumber, decimal amount, string description, string accountName = "")
        {
            // VietQR URL format: https://img.vietqr.io/image/<BANK_BIN>-<ACCOUNT_NUMBER>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<INFO>&accountName=<NAME>
            var template = "print"; // Options: print, compact, compact2, qr_only
            var url = $"https://img.vietqr.io/image/{bankBin}-{accountNumber}-{template}.png?amount={amount}&addInfo={Uri.EscapeDataString(description)}";
            
            if (!string.IsNullOrEmpty(accountName))
            {
                url += $"&accountName={Uri.EscapeDataString(accountName)}";
            }
            
            return url;
        }
    }
}
