using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.Services
{
    public class ReportService
    {
        private readonly HttpClient _httpClient;
        private string BaseUrl => $"{Constants.ApiBaseUrl}/Reports";

        public ReportService()
        {
            _httpClient = new HttpClient();
            // In a real app, use IHttpClientFactory
        }

        private void AddAuthHeader()
        {
            var token = UserSession.Instance.Token;
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            }
        }

        public async Task<SalesSummaryDto?> GetSalesSummaryAsync()
        {
            try
            {
                AddAuthHeader();
                return await _httpClient.GetFromJsonAsync<SalesSummaryDto>($"{BaseUrl}/summary");
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<List<DailyRevenueDto>> GetRevenueReportAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                AddAuthHeader();
                var url = $"{BaseUrl}/revenue?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}";
                var result = await _httpClient.GetFromJsonAsync<RevenueReportResponse>(url);
                return result?.DailyRevenue ?? new List<DailyRevenueDto>();
            }
            catch (Exception)
            {
                return new List<DailyRevenueDto>();
            }
        }

        public async Task<List<ProductReportDto>> GetTopSellingProductsAsync(DateTime startDate, DateTime endDate, int top = 10)
        {
            try
            {
                AddAuthHeader();
                var url = $"{BaseUrl}/products/top-selling?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}&topCount={top}";
                var result = await _httpClient.GetFromJsonAsync<List<ProductReportDto>>(url);
                return result ?? new List<ProductReportDto>();
            }
            catch (Exception)
            {
                return new List<ProductReportDto>();
            }
        }

        public async Task<List<CategoryReportDto>> GetCategoryReportAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                AddAuthHeader();
                var url = $"{BaseUrl}/categories?startDate={startDate:yyyy-MM-dd}&endDate={endDate:yyyy-MM-dd}";
                var result = await _httpClient.GetFromJsonAsync<List<CategoryReportDto>>(url);
                return result ?? new List<CategoryReportDto>();
            }
            catch (Exception)
            {
                return new List<CategoryReportDto>();
            }
        }
    }
}
