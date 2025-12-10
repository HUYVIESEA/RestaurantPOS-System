using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.Services
{
    public class TableService
    {
        private readonly HttpClient _httpClient;

        public TableService()
        {
            _httpClient = ConfigurationService.CreateHttpClient();
        }

        public async Task<List<Table>> GetTablesAsync()
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var tables = await _httpClient.GetFromJsonAsync<List<Table>>($"{Constants.ApiBaseUrl}/Tables");
                return tables ?? new List<Table>();
            }
            catch (Exception)
            {
                return new List<Table>();
            }
        }

        public async Task<bool> MergeTablesAsync(List<int> tableIds)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var request = new { TableIds = tableIds };
                var response = await _httpClient.PostAsJsonAsync($"{Constants.ApiBaseUrl}/Tables/Merge", request);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> SplitTablesAsync(int groupId)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.PostAsync($"{Constants.ApiBaseUrl}/Tables/Split/{groupId}", null);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> CreateTableAsync(Table table)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.PostAsJsonAsync($"{Constants.ApiBaseUrl}/Tables", table);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateTableAsync(Table table)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.PutAsJsonAsync($"{Constants.ApiBaseUrl}/Tables/{table.Id}", table);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> DeleteTableAsync(int id)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.DeleteAsync($"{Constants.ApiBaseUrl}/Tables/{id}");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
    }
}
