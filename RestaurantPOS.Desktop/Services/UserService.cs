using System.Net.Http;
using System.Net.Http.Json;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public class UserService : IUserService
{
    private readonly HttpClient _httpClient;
    private readonly IAuthenticationService _authService;

    public UserService(HttpClient httpClient, IAuthenticationService authService)
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

    public async Task<List<UserDto>> GetUsersAsync()
    {
        try
        {
            AddAuthorizationHeader();
            var users = await _httpClient.GetFromJsonAsync<List<UserDto>>("api/Users");
            return users ?? new List<UserDto>();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"UserService: Error getting users - {ex.Message}");
            return new List<UserDto>();
        }
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        try
        {
            AddAuthorizationHeader();
            return await _httpClient.GetFromJsonAsync<UserDto>($"api/Users/{id}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"UserService: Error getting user {id} - {ex.Message}");
            return null;
        }
    }

    public async Task<UserDto?> CreateUserAsync(CreateUserRequest request)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PostAsJsonAsync("api/Users", request);
            
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<UserDto>();
            }
            
            var error = await response.Content.ReadAsStringAsync();
            System.Diagnostics.Debug.WriteLine($"UserService: Error creating user - {error}");
            throw new Exception(error);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"UserService: Error creating user - {ex.Message}");
            throw;
        }
    }

    public async Task<bool> UpdateUserAsync(int id, UpdateUserRequest request)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PutAsJsonAsync($"api/Users/{id}", request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"UserService: Error updating user - {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UpdateRoleAsync(int id, string role)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PatchAsJsonAsync($"api/Users/{id}/Role", new UpdateRoleRequest { Role = role });
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"UserService: Error updating role - {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UpdateStatusAsync(int id, bool isActive)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PatchAsJsonAsync($"api/Users/{id}/Status", new UpdateStatusRequest { IsActive = isActive });
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"UserService: Error updating status - {ex.Message}");
            return false;
        }
    }

    public async Task<ResetPasswordResponse?> ResetPasswordAsync(int id)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PostAsync($"api/Users/{id}/ResetPassword", null);
            
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<ResetPasswordResponse>();
            }
            
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"UserService: Error resetting password - {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.DeleteAsync($"api/Users/{id}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"UserService: Error deleting user - {ex.Message}");
            return false;
        }
    }
}
