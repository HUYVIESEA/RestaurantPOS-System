using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop.ViewModels;

public partial class LoginViewModel : ObservableObject
{
    private readonly IAuthenticationService _authService;

    [ObservableProperty]
    private string username = string.Empty;

    [ObservableProperty]
    private string password = string.Empty;

    [ObservableProperty]
    private bool isLoading = false;

    [ObservableProperty]
    private string errorMessage = string.Empty;

    public LoginViewModel(IAuthenticationService authService)
    {
        _authService = authService;
    }

    [RelayCommand]
    private async Task Login()
    {
        ErrorMessage = string.Empty;

        if (string.IsNullOrWhiteSpace(Username) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Vui lòng nhập tên đăng nhập và mật khẩu";
            return;
        }

        IsLoading = true;
        try
        {
            var user = await _authService.LoginAsync(Username, Password);
            System.Diagnostics.Debug.WriteLine($"LoginViewModel: Login result - User: {user?.Username ?? "null"}");
            if (user != null)
            {
                System.Diagnostics.Debug.WriteLine("LoginViewModel: Sending LoginSuccessMessage");
                WeakReferenceMessenger.Default.Send<Messages.LoginSuccessMessage>(new Messages.LoginSuccessMessage());
                System.Diagnostics.Debug.WriteLine("LoginViewModel: LoginSuccessMessage sent");
            }
            else
            {
                ErrorMessage = "Tên đăng nhập hoặc mật khẩu không đúng";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Lỗi kết nối: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }
}
