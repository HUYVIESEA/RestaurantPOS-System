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
    public class ProductService
    {
        private readonly HttpClient _httpClient;

        public ProductService()
        {
            _httpClient = ConfigurationService.CreateHttpClient();
        }

        public async Task<List<Product>> GetProductsAsync()
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var products = await _httpClient.GetFromJsonAsync<List<Product>>($"{Constants.ApiBaseUrl}/Products", options);
                return products ?? new List<Product>();
            }
            catch (Exception)
            {
                // Return empty list or handle error
                return new List<Product>();
            }
        }

        public async Task<List<Category>> GetCategoriesAsync()
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var categories = await _httpClient.GetFromJsonAsync<List<Category>>($"{Constants.ApiBaseUrl}/Categories", options);
                return categories ?? new List<Category>();
            }
            catch (Exception)
            {
                return new List<Category>();
            }
        }
        public async Task<bool> AddProductAsync(Product product)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.PostAsJsonAsync($"{Constants.ApiBaseUrl}/Products", product);
                return response.IsSuccessStatusCode;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> UpdateProductAsync(Product product)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.PutAsJsonAsync($"{Constants.ApiBaseUrl}/Products/{product.Id}", product);
                return response.IsSuccessStatusCode;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> DeleteProductAsync(int productId)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.DeleteAsync($"{Constants.ApiBaseUrl}/Products/{productId}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public async Task<bool> AddCategoryAsync(Category category)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.PostAsJsonAsync($"{Constants.ApiBaseUrl}/Categories", category);
                return response.IsSuccessStatusCode;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> UpdateCategoryAsync(Category category)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.PutAsJsonAsync($"{Constants.ApiBaseUrl}/Categories/{category.Id}", category);
                return response.IsSuccessStatusCode;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> DeleteCategoryAsync(int categoryId)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                var response = await _httpClient.DeleteAsync($"{Constants.ApiBaseUrl}/Categories/{categoryId}");
                return response.IsSuccessStatusCode;
            }
            catch (Exception)
            {
                return false;
            }
        }
        public async Task<string?> UploadImageAsync(string filePath)
        {
            try
            {
                var token = UserSession.Instance.Token;
                if (!string.IsNullOrEmpty(token))
                {
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }

                // Prepare file content
                using (var form = new MultipartFormDataContent())
                {
                    using (var fileStream = System.IO.File.OpenRead(filePath))
                    using (var fileContent = new StreamContent(fileStream))
                    {
                        fileContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg"); // Adjust based on file type if needed, or let generic
                        // Generally, 'image/*' is safer if we detect map, but 'application/octet-stream' works too often.
                        // Let's rely on filename extension for content type if possible, or just default.
                        
                        form.Add(fileContent, "file", System.IO.Path.GetFileName(filePath));

                        var response = await _httpClient.PostAsync($"{Constants.ApiBaseUrl}/Upload/Image", form);
                        
                        if (response.IsSuccessStatusCode)
                        {
                            var result = await response.Content.ReadFromJsonAsync<UploadResult>();
                            return result?.Url;
                        }
                    }
                }
                return null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        private class UploadResult
        {
            public string Url { get; set; } = string.Empty;
        }
    }
}
