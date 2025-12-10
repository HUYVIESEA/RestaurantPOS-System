using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.Services
{
    public class AuthService
    {
        private readonly HttpClient _httpClient;

        public AuthService()
        {
            _httpClient = ConfigurationService.CreateHttpClient();
        }

        public async Task<LoginResponse?> LoginAsync(string username, string password)
        {
            try
            {
                var request = new LoginRequest { Username = username, Password = password };
                var response = await _httpClient.PostAsJsonAsync($"{Constants.ApiBaseUrl}/Auth/Login", request);

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<LoginResponse>();
                }
                return null;
            }
            catch (Exception)
            {
                // Log error
                return null;
            }
        }
    }
}
