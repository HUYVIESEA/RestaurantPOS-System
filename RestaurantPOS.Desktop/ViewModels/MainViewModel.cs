using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Messaging;
using CommunityToolkit.Mvvm.Input;
using Microsoft.Extensions.DependencyInjection;
using RestaurantPOS.Desktop.Messages;
using System.Windows;

namespace RestaurantPOS.Desktop.ViewModels;

public partial class MainViewModel : ObservableObject, 
    IRecipient<LoginSuccessMessage>, 
    IRecipient<LogoutMessage>,
    IRecipient<NavigateToMessage>,
    IRecipient<ShowToastMessage>
{
    private readonly IServiceProvider _serviceProvider;

    [ObservableProperty]
    private ObservableObject currentViewModel;

    // Toast Properties
    [ObservableProperty]
    private string toastMessage = string.Empty;

    [ObservableProperty]
    private bool isToastVisible;

    [ObservableProperty]
    private string toastColor = "#4CAF50"; // Default Green

    [ObservableProperty]
    private bool isLoggedIn = false;

    public MainViewModel(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
        CurrentViewModel = _serviceProvider.GetRequiredService<LoginViewModel>();
        
        WeakReferenceMessenger.Default.RegisterAll(this);
    }

    [RelayCommand]
    private void NavigateToDashboard() => WeakReferenceMessenger.Default.Send(new NavigateToMessage("Dashboard"));

    [RelayCommand]
    private void NavigateToTables() => WeakReferenceMessenger.Default.Send(new NavigateToMessage("TableManagement"));

    [RelayCommand]
    private void NavigateToOrders() => WeakReferenceMessenger.Default.Send(new NavigateToMessage("OrderList"));

    [RelayCommand]
    private void NavigateToUsers() => WeakReferenceMessenger.Default.Send(new NavigateToMessage("UserManagement"));

    [RelayCommand]
    private void Logout()
    {
        WeakReferenceMessenger.Default.Send(new LogoutMessage());
    }

    public void Receive(LoginSuccessMessage message)
    {
        System.Diagnostics.Debug.WriteLine("MainViewModel: Received LoginSuccessMessage");
        IsLoggedIn = true;
        CurrentViewModel = _serviceProvider.GetRequiredService<DashboardViewModel>();
    }

    public void Receive(LogoutMessage message)
    {
        System.Diagnostics.Debug.WriteLine("MainViewModel: Received LogoutMessage");
        IsLoggedIn = false;
        CurrentViewModel = _serviceProvider.GetRequiredService<LoginViewModel>();
    }

    public void Receive(NavigateToMessage message)
    {
        System.Diagnostics.Debug.WriteLine($"MainViewModel: Received NavigateToMessage - {message.ViewName}");
        
        CurrentViewModel = message.ViewName switch
        {
            "TableManagement" => _serviceProvider.GetRequiredService<TableManagementViewModel>(),
            "Dashboard" => _serviceProvider.GetRequiredService<DashboardViewModel>(),
            "OrderList" => _serviceProvider.GetRequiredService<OrderListViewModel>(),
            "CreateOrder" => _serviceProvider.GetRequiredService<CreateOrderViewModel>(),
            "OrderDetail" => _serviceProvider.GetRequiredService<OrderDetailViewModel>(),
            "UserManagement" => _serviceProvider.GetRequiredService<UserManagementViewModel>(),
            _ => CurrentViewModel
        };

        if (CurrentViewModel is INavigationAware navigationAware)
        {
            navigationAware.OnNavigatedTo(message.Parameter);
        }
    }

    public void Receive(ShowToastMessage message)
    {
        ToastMessage = message.Message;
        
        switch (message.Type)
        {
            case "Error":
                ToastColor = "#F44336"; // Red
                break;
            case "Warning":
                ToastColor = "#FF9800"; // Orange
                break;
            case "Success":
            default:
                ToastColor = "#4CAF50"; // Green
                break;
        }

        IsToastVisible = true;

        // Auto hide after 3 seconds
        Task.Delay(3000).ContinueWith(_ => 
        {
            Application.Current.Dispatcher.Invoke(() => 
            {
                IsToastVisible = false;
            });
        });
    }
}
