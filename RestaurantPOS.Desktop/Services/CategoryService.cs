using System.Net.Http;
using System.Net.Http.Json;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public class CategoryService : ICategoryService
{
    private readonly HttpClient _httpClient;
    private readonly IAuthenticationService _authService;

    public CategoryService(HttpClient httpClient, IAuthenticationService authService)
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
            System.Diagnostics.Debug.WriteLine($"CategoryService: Error getting categories - {ex.Message}");
            return new List<CategoryDto>();
        }
    }

    public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
    {
        try
        {
            AddAuthorizationHeader();
            return await _httpClient.GetFromJsonAsync<CategoryDto>($"api/Categories/{id}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"CategoryService: Error getting category {id} - {ex.Message}");
            return null;
        }
    }

    public async Task<CategoryDto?> CreateCategoryAsync(CategoryDto category)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PostAsJsonAsync("api/Categories", category);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<CategoryDto>();
            }
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"CategoryService: Error creating category - {ex.Message}");
            return null;
        }
    }

    public async Task<bool> UpdateCategoryAsync(CategoryDto category)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PutAsJsonAsync($"api/Categories/{category.Id}", category);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"CategoryService: Error updating category {category.Id} - {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.DeleteAsync($"api/Categories/{id}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"CategoryService: Error deleting category {id} - {ex.Message}");
            return false;
        }
    }
}
