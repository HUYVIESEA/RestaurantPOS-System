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
    public partial class TableManagementViewModel : ObservableObject, INavigationAware
    {
        private readonly ITableService _tableService;
        private readonly IToastService _toastService;

        [ObservableProperty]
        private ObservableCollection<TableDto> _tables = new();

        [ObservableProperty]
        private bool _isLoading;

        [ObservableProperty]
        private string _searchText = string.Empty;

        [ObservableProperty]
        private string _filterStatus = "All";

        [ObservableProperty]
        private string _filterCapacity = "0";

        public TableManagementViewModel(ITableService tableService, IToastService toastService)
        {
            _tableService = tableService;
            _toastService = toastService;
            LoadTablesCommand.Execute(null);
        }

        public void OnNavigatedTo(object? parameter)
        {
            System.Diagnostics.Debug.WriteLine("TableManagementViewModel: OnNavigatedTo triggered");
            // Reload tables whenever navigated to
            LoadTablesCommand.Execute(null);
        }

        [RelayCommand]
        private async Task LoadTables()
        {
            System.Diagnostics.Debug.WriteLine("TableManagementViewModel: Loading tables...");
            IsLoading = true;
            try
            {
                var tables = await _tableService.GetTablesAsync();

                // Filter by Search Text
                if (!string.IsNullOrWhiteSpace(SearchText))
                {
                    tables = tables.Where(t => t.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase)).ToList();
                }

                // Filter by Status
                if (FilterStatus != "All")
                {
                    tables = tables.Where(t => t.Status == FilterStatus).ToList();
                }

                // Filter by Capacity
                if (int.TryParse(FilterCapacity, out int cap) && cap > 0)
                {
                    tables = tables.Where(t => t.Capacity >= cap).ToList();
                }

                Tables = new ObservableCollection<TableDto>(tables);
                System.Diagnostics.Debug.WriteLine($"TableManagementViewModel: Loaded {Tables.Count} tables");
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Lỗi tải danh sách bàn: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        [RelayCommand]
        private async Task Refresh()
        {
            await LoadTables();
        }

        [RelayCommand]
        private void SelectTable(TableDto table)
        {
            if (table == null) return;

            if (table.Status == "Available")
            {
                // Nếu bàn trống -> Chuyển sang trang Tạo Đơn (kèm thông tin bàn)
                WeakReferenceMessenger.Default.Send(new NavigateToMessage("CreateOrder", table));
            }
            else
            {
                // Nếu bàn đang có khách -> Chuyển sang trang Chi tiết đơn
                WeakReferenceMessenger.Default.Send(new NavigateToMessage("OrderDetail", table));
            }
        }

        partial void OnSearchTextChanged(string value)
        {
            _ = LoadTables();
        }

        partial void OnFilterStatusChanged(string value)
        {
            _ = LoadTables();
        }

        partial void OnFilterCapacityChanged(string value)
        {
            _ = LoadTables();
        }

        [RelayCommand]
        private void Filter(string status)
        {
            FilterStatus = status;
        }

        [RelayCommand]
        private void NavigateToDashboard()
        {
            WeakReferenceMessenger.Default.Send(new NavigateToMessage("Dashboard"));
        }
    }
}
