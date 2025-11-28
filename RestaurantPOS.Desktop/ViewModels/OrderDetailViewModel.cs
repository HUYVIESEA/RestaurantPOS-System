using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using RestaurantPOS.Desktop.Messages;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using System.Collections.ObjectModel;
using System.Windows;
using RestaurantPOS.Desktop.Views;

namespace RestaurantPOS.Desktop.ViewModels
{
    public partial class OrderDetailViewModel : ObservableObject, INavigationAware
    {
        private readonly IOrderService _orderService;
        private readonly ITableService _tableService;
        private readonly IToastService _toastService;

        [ObservableProperty]
        private TableDto? _currentTable;

        [ObservableProperty]
        private ObservableCollection<OrderDto> _tableOrders = new();

        [ObservableProperty]
        private bool _isLoading;

        [ObservableProperty]
        private decimal _totalAmount;

        public OrderDetailViewModel(IOrderService orderService, ITableService tableService, IToastService toastService)
        {
            _orderService = orderService;
            _tableService = tableService;
            _toastService = toastService;
        }

        public void OnNavigatedTo(object? parameter)
        {
            if (parameter is TableDto table)
            {
                CurrentTable = table;
                LoadTableOrdersCommand.Execute(null);
            }
        }

        [RelayCommand]
        private async Task LoadTableOrders()
        {
            if (CurrentTable == null) return;

            IsLoading = true;
            try
            {
                var orders = await _orderService.GetOrdersByTableAsync(CurrentTable.Id);
                
                // Hiển thị TẤT CẢ đơn hàng (không filter)
                TableOrders = new ObservableCollection<OrderDto>(orders.OrderByDescending(o => o.CreatedAt));
                
                CalculateTotal();
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Lỗi tải chi tiết đơn hàng: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        private void CalculateTotal()
        {
            TotalAmount = TableOrders.Sum(o => o.TotalAmount);
        }

        [RelayCommand]
        private void NavigateToDashboard()
        {
            WeakReferenceMessenger.Default.Send(new NavigateToMessage("Dashboard"));
        }

        [RelayCommand]
        private void NavigateBack()
        {
            WeakReferenceMessenger.Default.Send(new NavigateToMessage("TableManagement"));
        }

        [RelayCommand]
        private void AddMoreItems()
        {
            if (CurrentTable != null)
            {
                // Luôn tạo đơn mới (đơn giản nhất)
                WeakReferenceMessenger.Default.Send(new NavigateToMessage("CreateOrder", CurrentTable));
            }
        }
        
        [RelayCommand]
        private async Task PayOrder()
        {
            try
            {
                if (TableOrders.Count == 0)
                {
                    _toastService.ShowWarning("Không có đơn hàng nào để thanh toán");
                    return;
                }

                // Lấy đơn đầu tiên
                var firstOrder = TableOrders.FirstOrDefault();
                if (firstOrder == null) return;

                // Tạm thời dùng MessageBox đơn giản thay vì PaymentDialog
                var result = MessageBox.Show(
                    $"Xác nhận thanh toán đơn hàng {firstOrder.OrderNumber}?\nTổng tiền: {firstOrder.TotalAmount:N0} đ",
                    "Thanh Toán",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question
                );

                if (result == MessageBoxResult.Yes)
                {
                    IsLoading = true;
                    try
                    {
                        var completedOrder = await _orderService.CompleteOrderAsync(
                            firstOrder.Id,
                            firstOrder.TotalAmount,
                            "Cash"
                        );

                        if (completedOrder != null)
                        {
                            _toastService.ShowSuccess("Đã thanh toán thành công!");
                            WeakReferenceMessenger.Default.Send(new NavigateToMessage("TableManagement"));
                        }
                        else
                        {
                            _toastService.ShowError("Có lỗi xảy ra khi thanh toán");
                        }
                    }
                    finally
                    {
                        IsLoading = false;
                    }
                }
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Lỗi thanh toán: {ex.Message}");
            }
        }
    }
}
