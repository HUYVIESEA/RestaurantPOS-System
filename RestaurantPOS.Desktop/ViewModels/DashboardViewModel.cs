using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.ViewModels;

public partial class DashboardViewModel : ObservableObject
{
    private readonly IAuthenticationService _authService;
    private readonly ITableService _tableService;
    private readonly IOrderService _orderService;

    [ObservableProperty]
    private string welcomeMessage = "Welcome to Smart Order";

    [ObservableProperty]
    private decimal revenueToday;

    [ObservableProperty]
    private double revenueGrowth;

    [ObservableProperty]
    private int ordersToday;

    [ObservableProperty]
    private int activeTables;

    [ObservableProperty]
    private int totalTables;

    [ObservableProperty]
    private int activeStaff;

    [ObservableProperty]
    private List<DailyRevenueDto> weeklyRevenue = new();

    [ObservableProperty]
    private List<OrderDto> recentOrders = new();

    [ObservableProperty]
    private List<TopSellingItemDto> topSellingItems = new();

    [ObservableProperty]
    private decimal maxRevenue = 1; // Avoid divide by zero

    public DashboardViewModel(
        IAuthenticationService authService,
        ITableService tableService,
        IOrderService orderService)
    {
        System.Diagnostics.Debug.WriteLine("DashboardViewModel: Constructor called");
        _authService = authService;
        _tableService = tableService;
        _orderService = orderService;
        
        InitializeWelcomeMessage();
        LoadDashboardDataCommand.Execute(null);
    }

    private void InitializeWelcomeMessage()
    {
        try
        {
            if (_authService?.CurrentUser != null)
            {
                WelcomeMessage = $"Xin chào, {_authService.CurrentUser.FullName}!";
            }
            else
            {
                WelcomeMessage = "Xin chào!";
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"DashboardViewModel: Error in constructor - {ex.Message}");
            WelcomeMessage = "Xin chào!";
        }
    }

    [RelayCommand]
    private async Task LoadDashboardData()
    {
        try
        {
            // Load Tables
            var tables = await _tableService.GetTablesAsync();
            TotalTables = tables.Count;
            ActiveTables = tables.Count(t => !t.IsAvailable);

            // Load Orders
            var orders = await _orderService.GetOrdersAsync();
            var today = DateTime.Today;
            var todayOrders = orders.Where(o => o.CreatedAt.Date == today).ToList();
            
            OrdersToday = todayOrders.Count;
            RevenueToday = todayOrders.Sum(o => o.TotalAmount);

            // Recent Orders (Last 5)
            RecentOrders = orders.OrderByDescending(o => o.CreatedAt).Take(5).ToList();

            // Top Selling Items
            var allItems = orders.SelectMany(o => o.Items);
            TopSellingItems = allItems
                .GroupBy(i => i.ProductName)
                .Select(g => new TopSellingItemDto(
                    g.Key, 
                    g.Sum(i => i.Quantity), 
                    g.Sum(i => i.Subtotal)))
                .OrderByDescending(x => x.Quantity)
                .Take(5)
                .ToList();

            // Calculate Growth (Mock logic for now as we might not have yesterday's data easily accessible without backend support)
            RevenueGrowth = 12.5; // Dummy value

            // Active Staff (Mock)
            ActiveStaff = 5; // Dummy value

            // Weekly Revenue (Mock)
            WeeklyRevenue = new List<DailyRevenueDto>
            {
                new("T2", 1200000),
                new("T3", 2500000),
                new("T4", 800000),
                new("T5", 3100000),
                new("T6", 1800000),
                new("T7", 4500000),
                new("CN", 2900000)
            };

            if (WeeklyRevenue.Any())
            {
                MaxRevenue = WeeklyRevenue.Max(r => r.Amount);
                if (MaxRevenue == 0) MaxRevenue = 1;
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Error loading dashboard data: {ex.Message}");
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
    private void NavigateToMenu()
    {
        System.Diagnostics.Debug.WriteLine("DashboardViewModel: Navigating to Menu Management");
        WeakReferenceMessenger.Default.Send(new Messages.NavigateToMessage("MenuManagement"));
    }

    [RelayCommand]
    private async Task Logout()
    {
        await _authService.LogoutAsync();
        // We will handle navigation back to login via messaging
        WeakReferenceMessenger.Default.Send<Messages.LogoutMessage>(new Messages.LogoutMessage());
    }
}
