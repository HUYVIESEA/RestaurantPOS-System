using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services
{
    public class UserService
    {
        private static readonly HttpClient _httpClient;

        static UserService()
        {
            _httpClient = new HttpClient();
            string baseUrl = Utilities.Constants.ApiBaseUrl;
            if (!baseUrl.EndsWith("/")) baseUrl += "/";
            _httpClient.BaseAddress = new Uri(baseUrl);
        }

        public UserService()
        {
            // Empty constructor
        }

        private void SetAuthHeader()
        {
            var token = UserSession.Instance.Token;
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            try
            {
                SetAuthHeader();
                var response = await _httpClient.GetAsync("Users");
                
                if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized || response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền truy cập danh sách người dùng.");
                }

                response.EnsureSuccessStatusCode();

                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                return await response.Content.ReadFromJsonAsync<List<User>>(options) ?? new List<User>();
            }
            catch (UnauthorizedAccessException) 
            { 
                throw; 
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error getting users: {ex.Message}");
                // Return empty list to prevent crash, but maybe we should rethrow to show UI error? 
                // For now, let's allow rethrow effectively by handling in VM
                throw new Exception($"Lỗi tải dữ liệu: {ex.Message}");
            }
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            try
            {
                SetAuthHeader();
                return await _httpClient.GetFromJsonAsync<User>($"Users/{id}");
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> CreateUserAsync(CreateUserRequest request)
        {
            try
            {
                SetAuthHeader();
                var response = await _httpClient.PostAsJsonAsync("Users", request);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateUserAsync(int id, UpdateUserRequest request)
        {
            try
            {
                SetAuthHeader();
                var response = await _httpClient.PutAsJsonAsync($"Users/{id}", request);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            try
            {
                SetAuthHeader();
                var response = await _httpClient.DeleteAsync($"Users/{id}");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}
