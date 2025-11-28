using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using RestaurantPOS.Desktop.Messages;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace RestaurantPOS.Desktop.ViewModels
{
    public partial class OrderListViewModel : ObservableObject
    {
        private readonly IOrderService _orderService;

        [ObservableProperty]
        private ObservableCollection<OrderDto> _orders = new();

        [ObservableProperty]
        private bool _isLoading;

        [ObservableProperty]
        private string _filterStatus = "All";

        public OrderListViewModel(IOrderService orderService)
        {
            _orderService = orderService;
            LoadOrdersCommand.Execute(null);
        }

        [RelayCommand]
        private async Task LoadOrders()
        {
            IsLoading = true;
            try
            {
                var orders = await _orderService.GetOrdersAsync();

                if (FilterStatus != "All")
                {
                    orders = orders.Where(o => o.Status == FilterStatus).ToList();
                }

                Orders = new ObservableCollection<OrderDto>(orders);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải danh sách đơn hàng: {ex.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }

        [RelayCommand]
        private async Task Refresh()
        {
            await LoadOrders();
        }

        partial void OnFilterStatusChanged(string value)
        {
            _ = LoadOrders();
        }

        [RelayCommand]
        private void NavigateToDashboard()
        {
            WeakReferenceMessenger.Default.Send(new NavigateToMessage("Dashboard"));
        }
    }
}
