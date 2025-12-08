using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services
{
    public class VietQRService
    {
        private static List<Bank>? _cachedBanks;
        private static readonly HttpClient _sharedHttpClient = new HttpClient();

        public VietQRService()
        {
            // Use shared HttpClient
        }

        public async Task<List<Bank>> GetBanksAsync()
        {
            if (_cachedBanks != null && _cachedBanks.Any())
            {
                return _cachedBanks;
            }

            try
            {
                var response = await _sharedHttpClient.GetFromJsonAsync<VietQRBankResponse>("https://api.vietqr.io/v2/banks");
                _cachedBanks = response?.Data ?? new List<Bank>();
                return _cachedBanks;
            }
            catch (Exception)
            {
                return new List<Bank>();
            }
        }

        public string GenerateQRUrl(string bankBin, string accountNumber, decimal amount, string description, string accountName = "", string template = "print")
        {
            // Format: https://img.vietqr.io/image/<BANK_BIN>-<ACCOUNT_NUMBER>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<INFO>&accountName=<NAME>
            var url = $"https://img.vietqr.io/image/{bankBin}-{accountNumber}-{template}.png?amount={amount}&addInfo={Uri.EscapeDataString(description)}";
            
            if (!string.IsNullOrEmpty(accountName))
            {
                url += $"&accountName={Uri.EscapeDataString(accountName)}";
            }
            
            return url;
        }
    }
}
