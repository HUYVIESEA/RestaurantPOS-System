using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.Services
{
    public class OrderService
    {
        private readonly HttpClient _httpClient;

        public OrderService()
        {
            _httpClient = new HttpClient();
            _httpClient.BaseAddress = new Uri(Constants.ApiBaseUrl);
        }

        public async Task<List<Order>> GetOrdersByTableAsync(int tableId)
        {
            try
            {
                SetToken();
                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var orders = await _httpClient.GetFromJsonAsync<List<Order>>($"{Constants.ApiBaseUrl}/Orders/Table/{tableId}", options);
                return orders ?? new List<Order>();
            }
            catch
            {
                return new List<Order>();
            }
        }

        public async Task<List<Order>> GetAllOrdersAsync()
        {
            try
            {
                SetToken();
                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var orders = await _httpClient.GetFromJsonAsync<List<Order>>($"{Constants.ApiBaseUrl}/Orders", options);
                return orders ?? new List<Order>();
            }
            catch
            {
                return new List<Order>();
            }
        }

        public async Task<Order?> CreateOrderAsync(CreateOrderRequest request)
        {
            try
            {
                SetToken();
                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var response = await _httpClient.PostAsJsonAsync($"{Constants.ApiBaseUrl}/Orders", request);
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<Order>(options);
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        public async Task<Order?> AddItemToOrderAsync(int orderId, int productId, int quantity)
        {
            try
            {
                SetToken();
                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var item = new { ProductId = productId, Quantity = quantity };
                var response = await _httpClient.PostAsJsonAsync($"{Constants.ApiBaseUrl}/Orders/{orderId}/Items", item);
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<Order>(options);
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        public async Task<Order?> UpdateItemQuantityAsync(int orderId, int itemId, int quantity)
        {
            try
            {
                SetToken();
                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var response = await _httpClient.PatchAsJsonAsync($"{Constants.ApiBaseUrl}/Orders/{orderId}/Items/{itemId}", quantity);
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<Order>(options);
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> CompleteOrderAsync(int orderId, decimal receivedAmount, string paymentMethod = "Cash")
        {
            try
            {
                SetToken();
                var request = new CompleteOrderRequest { ReceivedAmount = receivedAmount, PaymentMethod = paymentMethod };
                var response = await _httpClient.PutAsJsonAsync($"{Constants.ApiBaseUrl}/Orders/{orderId}/Complete", request);
                return response.IsSuccessStatusCode;
            }
            catch(Exception ex)
            {
                // Simple logging or debugging aid
                System.Diagnostics.Debug.WriteLine($"CompleteOrderAsync Error: {ex.Message}");
                return false;
            }
        }

        private void SetToken()
        {
            var token = UserSession.Instance.Token;
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }
    }
}
