using System.Net.Http;
using System.Net.Http.Json;
using System.Windows;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public class AuthenticationService : IAuthenticationService
{
    private readonly HttpClient _httpClient;
    private LoginResponse? _currentUser;

    public AuthenticationService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public bool IsAuthenticated => _currentUser != null;

    public LoginResponse? CurrentUser => _currentUser;

    public async Task<LoginResponse?> LoginAsync(string username, string password)
    {
        try
        {
            var loginRequest = new LoginRequest { Username = username, Password = password };
            var response = await _httpClient.PostAsJsonAsync("api/Auth/Login", loginRequest);

            if (response.IsSuccessStatusCode)
            {
                _currentUser = await response.Content.ReadFromJsonAsync<LoginResponse>();
                return _currentUser;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            // Log error
            MessageBox.Show($"Login error: {ex.Message}");
            return null;
        }
    }

    public Task LogoutAsync()
    {
        _currentUser = null;
        return Task.CompletedTask;
    }
}
