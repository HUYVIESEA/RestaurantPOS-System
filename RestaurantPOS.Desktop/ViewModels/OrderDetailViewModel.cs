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
                // Refresh table info to ensure we have the latest status
                var freshTable = await _tableService.GetTableByIdAsync(CurrentTable.Id);
                if (freshTable != null)
                {
                    CurrentTable = freshTable;
                }

                var allOrders = new List<OrderDto>();

                if (CurrentTable.IsMerged && CurrentTable.MergedGroupId.HasValue)
                {
                    // For merged tables, fetch orders from all tables in the group
                    var allTables = await _tableService.GetTablesAsync();
                    var groupTables = allTables.Where(t => t.MergedGroupId == CurrentTable.MergedGroupId).ToList();

                    foreach (var table in groupTables)
                    {
                        var orders = await _orderService.GetOrdersByTableAsync(table.Id);
                        allOrders.AddRange(orders);
                    }
                }
                else
                {
                    var orders = await _orderService.GetOrdersByTableAsync(CurrentTable.Id);
                    allOrders.AddRange(orders);
                }
                
                // Filter orders for the current session
                IEnumerable<OrderDto> sessionOrders;

                if (CurrentTable.IsAvailable)
                {
                    // If table is available, show no orders (new session)
                    sessionOrders = Enumerable.Empty<OrderDto>();
                }
                else
                {
                    // If table is occupied, show orders from the current session
                    if (CurrentTable.OccupiedAt.HasValue)
                    {
                        // Add a small buffer (e.g., 1 minute) to account for slight time differences
                        var sessionStart = CurrentTable.OccupiedAt.Value.AddMinutes(-1);
                        sessionOrders = allOrders.Where(o => o.CreatedAt >= sessionStart);
                    }
                    else
                    {
                        // Fallback: only show Pending orders if OccupiedAt is missing
                        sessionOrders = allOrders.Where(o => o.Status == "Pending");
                    }
                }
                
                // Remove duplicates if any (though unlikely with current logic unless same order returned for multiple tables)
                TableOrders = new ObservableCollection<OrderDto>(sessionOrders.GroupBy(o => o.Id).Select(g => g.First()).OrderByDescending(o => o.CreatedAt));
                
                // Ensure OrderId is set on items (in case API doesn't return it in nested objects)
                foreach (var order in TableOrders)
                {
                    foreach (var item in order.Items)
                    {
                        item.OrderId = order.Id;
                    }
                }
                
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
                // Check for existing pending order to add items to
                var pendingOrder = TableOrders.FirstOrDefault(o => o.Status == "Pending");
                
                if (pendingOrder != null)
                {
                    // Add to existing order
                    var param = new AddToOrderParameter 
                    { 
                        Table = CurrentTable, 
                        OrderId = pendingOrder.Id 
                    };
                    WeakReferenceMessenger.Default.Send(new NavigateToMessage("CreateOrder", param));
                }
                else
                {
                    // Create new order
                    WeakReferenceMessenger.Default.Send(new NavigateToMessage("CreateOrder", CurrentTable));
                }
            }
        }
        
        [RelayCommand]
        private async Task PayOrder()
        {
            try
            {
                var pendingOrders = TableOrders.Where(o => o.Status == "Pending").ToList();
                if (!pendingOrders.Any())
                {
                    _toastService.ShowWarning("Không có đơn hàng nào cần thanh toán");
                    return;
                }

                var totalToPay = pendingOrders.Sum(o => o.TotalAmount);

                // Tạm thời dùng MessageBox đơn giản thay vì PaymentDialog
                var result = MessageBox.Show(
                    $"Xác nhận thanh toán cho bàn {CurrentTable?.Name}?\nTổng tiền: {totalToPay:N0} đ\n({pendingOrders.Count} đơn hàng)",
                    "Thanh Toán",
                    MessageBoxButton.YesNo,
                    MessageBoxImage.Question
                );

                if (result == MessageBoxResult.Yes)
                {
                    IsLoading = true;
                    try
                    {
                        bool allSuccess = true;
                        foreach (var order in pendingOrders)
                        {
                            var completedOrder = await _orderService.CompleteOrderAsync(
                                order.Id,
                                order.TotalAmount,
                                "Cash"
                            );
                            
                            if (completedOrder == null)
                            {
                                allSuccess = false;
                            }
                        }

                        if (allSuccess)
                        {
                            _toastService.ShowSuccess("Đã thanh toán thành công!");
                            WeakReferenceMessenger.Default.Send(new NavigateToMessage("TableManagement"));
                        }
                        else
                        {
                            _toastService.ShowError("Có lỗi xảy ra khi thanh toán một số đơn hàng");
                            await LoadTableOrders();
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

        [RelayCommand]
        private async Task IncreaseQuantity(OrderItemDto item)
        {
            if (item == null) return;
            await UpdateItemQuantity(item, item.Quantity + 1);
        }

        [RelayCommand]
        private async Task DecreaseQuantity(OrderItemDto item)
        {
            if (item == null) return;
            if (item.Quantity > 1)
            {
                await UpdateItemQuantity(item, item.Quantity - 1);
            }
        }

        private async Task UpdateItemQuantity(OrderItemDto item, int newQuantity)
        {
            IsLoading = true;
            try
            {
                // Ensure OrderId is set. If not (due to API response), we might fail.
                // But we added OrderId to OrderItemDto.
                // However, GetOrdersByTableAsync deserialization needs to populate it.
                // If the API JSON doesn't have OrderId in OrderItem, it will be 0.
                // But OrderDto has Id. We can infer OrderId if we are careful.
                // But let's assume API returns it or we fix it.
                // Actually, OrderService.GetOrdersByTableAsync returns OrderDto.
                // OrderDto has Id. OrderItemDto is inside OrderDto.
                // We might need to manually set OrderId on items if API doesn't.
                
                var updatedOrder = await _orderService.UpdateItemQuantityAsync(item.OrderId, item.Id, newQuantity);
                if (updatedOrder != null)
                {
                    await LoadTableOrders();
                }
                else
                {
                    _toastService.ShowError("Không thể cập nhật số lượng");
                }
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Lỗi cập nhật: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        [RelayCommand]
        private async Task RemoveItem(OrderItemDto item)
        {
            if (item == null) return;

            var result = MessageBox.Show($"Bạn có chắc muốn xóa món {item.ProductName}?", "Xác nhận xóa", MessageBoxButton.YesNo, MessageBoxImage.Warning);
            if (result != MessageBoxResult.Yes) return;

            IsLoading = true;
            try
            {
                var updatedOrder = await _orderService.RemoveItemFromOrderAsync(item.OrderId, item.Id);
                if (updatedOrder != null)
                {
                    _toastService.ShowSuccess("Đã xóa món thành công");
                    await LoadTableOrders();
                }
                else
                {
                    _toastService.ShowError("Không thể xóa món");
                }
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Lỗi xóa món: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}
