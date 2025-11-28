using System.Net.Http;
using System.Net.Http.Json;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public class ProductService : IProductService
{
    private readonly HttpClient _httpClient;
    private readonly IAuthenticationService _authService;

    public ProductService(HttpClient httpClient, IAuthenticationService authService)
    {
        _httpClient = httpClient;
        _authService = authService;
    }

    private void AddAuthorizationHeader()
    {
        if (_authService.CurrentUser != null && !string.IsNullOrEmpty(_authService.CurrentUser.Token))
        {
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _authService.CurrentUser.Token);
        }
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        try
        {
            AddAuthorizationHeader();
            var categories = await _httpClient.GetFromJsonAsync<List<CategoryDto>>("api/Categories");
            return categories ?? new List<CategoryDto>();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"ProductService: Error getting categories - {ex.Message}");
            return new List<CategoryDto>();
        }
    }

    public async Task<List<ProductDto>> GetProductsAsync()
    {
        try
        {
            AddAuthorizationHeader();
            var products = await _httpClient.GetFromJsonAsync<List<ProductDto>>("api/Products");
            return products ?? new List<ProductDto>();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"ProductService: Error getting products - {ex.Message}");
            return new List<ProductDto>();
        }
    }

    public async Task<List<ProductDto>> GetProductsByCategoryAsync(int categoryId)
    {
        try
        {
            AddAuthorizationHeader();
            var products = await _httpClient.GetFromJsonAsync<List<ProductDto>>($"api/Products?categoryId={categoryId}");
            return products ?? new List<ProductDto>();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"ProductService: Error getting products by category - {ex.Message}");
            return new List<ProductDto>();
        }
    }
}
