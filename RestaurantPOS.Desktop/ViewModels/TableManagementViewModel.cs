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
    public partial class TableManagementViewModel : ObservableObject, INavigationAware, IRecipient<TableUpdatedMessage>
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

        [ObservableProperty]
        private ObservableCollection<string> floors = new() { "Tất cả" };

        [ObservableProperty]
        private string selectedFloor = "Tất cả";

        private System.Windows.Threading.DispatcherTimer _timer;

        public TableManagementViewModel(ITableService tableService, IToastService toastService)
        {
            _tableService = tableService;
            _toastService = toastService;
            
            WeakReferenceMessenger.Default.Register(this);
            
            _timer = new System.Windows.Threading.DispatcherTimer();
            _timer.Interval = TimeSpan.FromMinutes(1);
            _timer.Tick += (s, e) => UpdateDurations();
            _timer.Start();

            LoadTablesCommand.Execute(null);
        }

        private void UpdateDurations()
        {
             if (Tables == null) return;
             foreach (var table in Tables)
             {
                 if (!table.IsAvailable && table.OccupiedAt.HasValue)
                 {
                     var diff = DateTime.UtcNow - table.OccupiedAt.Value;
                     table.Duration = $"{(int)diff.TotalHours:00}:{diff.Minutes:00}";
                 }
                 else
                 {
                     table.Duration = "";
                 }
             }
        }

        public void Receive(TableUpdatedMessage message)
        {
            System.Diagnostics.Debug.WriteLine("TableManagementViewModel: Received TableUpdatedMessage");
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

                // Populate Floors
                var distinctFloors = tables.Select(t => t.Floor).Distinct().OrderBy(f => f).ToList();
                foreach (var f in distinctFloors)
                {
                    if (!Floors.Contains(f)) Floors.Add(f);
                }

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

                // Filter by Floor
                if (SelectedFloor != "Tất cả")
                {
                    tables = tables.Where(t => t.Floor == SelectedFloor).ToList();
                }

                Tables = new ObservableCollection<TableDto>(tables);
                UpdateDurations();
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

        [ObservableProperty]
        private bool isMergeMode;

        [ObservableProperty]
        private ObservableCollection<TableDto> selectedTablesForMerge = new();

        [RelayCommand]
        private void ToggleMergeMode()
        {
            IsMergeMode = !IsMergeMode;
            SelectedTablesForMerge.Clear();
            if (Tables != null)
            {
                foreach (var t in Tables) t.IsSelected = false;
            }
        }

        [RelayCommand]
        private async Task ConfirmMerge()
        {
            if (SelectedTablesForMerge.Count < 2)
            {
                _toastService.ShowWarning("Vui lòng chọn ít nhất 2 bàn để ghép.");
                return;
            }

            var ids = SelectedTablesForMerge.Select(t => t.Id).ToList();
            var success = await _tableService.MergeTablesAsync(ids);
            if (success)
            {
                _toastService.ShowSuccess("Ghép bàn thành công!");
                IsMergeMode = false;
                SelectedTablesForMerge.Clear();
                await LoadTables();
            }
            else
            {
                _toastService.ShowError("Ghép bàn thất bại. Vui lòng kiểm tra lại.");
            }
        }

        [RelayCommand]
        private async Task SplitTable(TableDto table)
        {
            if (!table.IsMerged || !table.MergedGroupId.HasValue) return;

            var result = MessageBox.Show($"Bạn có chắc muốn tách nhóm bàn {table.MergedTableNumbers}?", "Xác nhận tách bàn", MessageBoxButton.YesNo, MessageBoxImage.Question);
            if (result == MessageBoxResult.Yes)
            {
                var success = await _tableService.SplitTablesAsync(table.MergedGroupId.Value);
                if (success)
                {
                    _toastService.ShowSuccess("Tách bàn thành công!");
                    await LoadTables();
                }
                else
                {
                    _toastService.ShowError("Tách bàn thất bại.");
                }
            }
        }

        [RelayCommand]
        private void SelectTable(TableDto table)
        {
            if (table == null) return;

            if (IsMergeMode)
            {
                if (table.IsSelected)
                {
                    table.IsSelected = false;
                    SelectedTablesForMerge.Remove(table);
                }
                else
                {
                    if (!table.IsAvailable)
                    {
                        _toastService.ShowWarning("Chỉ có thể ghép các bàn trống.");
                        return;
                    }
                    table.IsSelected = true;
                    SelectedTablesForMerge.Add(table);
                }
                return;
            }

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

        partial void OnSelectedFloorChanged(string value)
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

        // --- Right Panel & CRUD Logic ---

        [ObservableProperty]
        private bool _isRightPanelOpen;

        [ObservableProperty]
        private string _rightPanelTitle = string.Empty;

        [ObservableProperty]
        private TableDto _editableTable = new();

        private bool _isCreatingNew;

        [RelayCommand]
        private void CloseRightPanel()
        {
            IsRightPanelOpen = false;
        }

        [RelayCommand]
        private void AddTable()
        {
            IsRightPanelOpen = true;
            RightPanelTitle = "Thêm bàn mới";
            EditableTable = new TableDto { Status = "Available", Capacity = 4 };
            _isCreatingNew = true;
        }

        [RelayCommand]
        private void EditTable(TableDto? table)
        {
            if (table == null) return;
            IsRightPanelOpen = true;
            RightPanelTitle = "Sửa thông tin bàn";
            EditableTable = new TableDto 
            { 
                Id = table.Id, 
                Name = table.Name, 
                Capacity = table.Capacity, 
                Status = table.Status,
                Floor = table.Floor,
                IsAvailable = table.IsAvailable
            };
            _isCreatingNew = false;
        }

        [RelayCommand]
        private async Task DeleteTable(TableDto? table)
        {
            if (table == null) return;

            var result = MessageBox.Show(
                $"Bạn có chắc muốn xóa bàn '{table.Name}'?",
                "Xác nhận xóa",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning);

            if (result == MessageBoxResult.Yes)
            {
                IsLoading = true;
                try
                {
                    var success = await _tableService.DeleteTableAsync(table.Id);
                    if (success)
                    {
                        _toastService.ShowSuccess($"Đã xóa bàn '{table.Name}'");
                        await LoadTables();
                        if (IsRightPanelOpen && EditableTable.Id == table.Id)
                        {
                            IsRightPanelOpen = false;
                        }
                    }
                    else
                    {
                        _toastService.ShowError("Không thể xóa bàn");
                    }
                }
                catch (Exception ex)
                {
                    _toastService.ShowError($"Lỗi: {ex.Message}");
                }
                finally
                {
                    IsLoading = false;
                }
            }
        }

        [RelayCommand]
        private async Task SavePanel()
        {
            if (string.IsNullOrWhiteSpace(EditableTable.Name))
            {
                _toastService.ShowWarning("Tên bàn không được để trống");
                return;
            }
            if (EditableTable.Capacity <= 0)
            {
                _toastService.ShowWarning("Sức chứa phải lớn hơn 0");
                return;
            }

            IsLoading = true;
            try
            {
                if (_isCreatingNew)
                {
                    var result = await _tableService.CreateTableAsync(EditableTable);
                    if (result != null)
                    {
                        _toastService.ShowSuccess($"Đã thêm bàn '{result.Name}'");
                        await LoadTables();
                        IsRightPanelOpen = false;
                    }
                }
                else
                {
                    var success = await _tableService.UpdateTableAsync(EditableTable);
                    if (success)
                    {
                        _toastService.ShowSuccess($"Đã cập nhật bàn '{EditableTable.Name}'");
                        await LoadTables();
                        IsRightPanelOpen = false;
                    }
                }
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Lỗi: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }
    }
}
