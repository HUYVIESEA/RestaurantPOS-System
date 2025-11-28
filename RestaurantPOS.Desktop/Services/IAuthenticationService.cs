using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public interface IAuthenticationService
{
    Task<LoginResponse?> LoginAsync(string username, string password);
    Task LogoutAsync();
    bool IsAuthenticated { get; }
    LoginResponse? CurrentUser { get; }
}
