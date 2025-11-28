using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop.ViewModels;

public partial class DashboardViewModel : ObservableObject
{
    private readonly IAuthenticationService _authService;

    [ObservableProperty]
    private string welcomeMessage = "Welcome to Restaurant POS";

    public DashboardViewModel(IAuthenticationService authService)
    {
        System.Diagnostics.Debug.WriteLine("DashboardViewModel: Constructor called");
        _authService = authService;
        
        try
        {
            if (_authService?.CurrentUser != null)
            {
                WelcomeMessage = $"Xin chào, {_authService.CurrentUser.FullName}!";
                System.Diagnostics.Debug.WriteLine($"DashboardViewModel: Welcome message set for {_authService.CurrentUser.FullName}");
            }
            else
            {
                WelcomeMessage = "Xin chào!";
                System.Diagnostics.Debug.WriteLine("DashboardViewModel: CurrentUser is null, using default message");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"DashboardViewModel: Error in constructor - {ex.Message}");
            WelcomeMessage = "Xin chào!";
        }
    }

    [RelayCommand]
    private void NavigateToTables()
    {
        System.Diagnostics.Debug.WriteLine("DashboardViewModel: Navigating to Tables");
        WeakReferenceMessenger.Default.Send(new Messages.NavigateToMessage("TableManagement"));
    }

    [RelayCommand]
    private void NavigateToOrders()
    {
        System.Diagnostics.Debug.WriteLine("DashboardViewModel: Navigating to Orders");
        WeakReferenceMessenger.Default.Send(new Messages.NavigateToMessage("OrderList"));
    }

    [RelayCommand]
    private void NavigateToCreateOrder()
    {
        System.Diagnostics.Debug.WriteLine("DashboardViewModel: Navigating to Create Order");
        WeakReferenceMessenger.Default.Send(new Messages.NavigateToMessage("CreateOrder"));
    }

    [RelayCommand]
    private void NavigateToUsers()
    {
        System.Diagnostics.Debug.WriteLine("DashboardViewModel: Navigating to User Management");
        WeakReferenceMessenger.Default.Send(new Messages.NavigateToMessage("UserManagement"));
    }

    [RelayCommand]
    private async Task Logout()
    {
        await _authService.LogoutAsync();
        // We will handle navigation back to login via messaging
        WeakReferenceMessenger.Default.Send<Messages.LogoutMessage>(new Messages.LogoutMessage());
    }
}
