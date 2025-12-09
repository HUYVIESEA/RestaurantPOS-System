using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class TableManagementViewModel : INotifyPropertyChanged
    {
        private readonly TableService _tableService;
        private ObservableCollection<Table> _tables;
        private bool _isLoading;

        public ObservableCollection<Table> Tables
        {
            get => _tables;
            set { _tables = value; OnPropertyChanged(); }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); }
        }

        public RelayCommand AddTableCommand { get; }
        public RelayCommand EditTableCommand { get; }
        public RelayCommand DeleteTableCommand { get; }
        public RelayCommand RefreshCommand { get; }

        public TableManagementViewModel()
        {
            _tableService = new TableService();
            Tables = new ObservableCollection<Table>();
            
            AddTableCommand = new RelayCommand(ExecuteAddTable);
            EditTableCommand = new RelayCommand(ExecuteEditTable);
            DeleteTableCommand = new RelayCommand(ExecuteDeleteTable);
            RefreshCommand = new RelayCommand(ExecuteRefresh);

            LoadTables();
        }

        private async void LoadTables()
        {
            IsLoading = true;
            try
            {
                var tables = await _tableService.GetTablesAsync();
                var orderedTables = tables.OrderBy(t => t.TableNumber);
                Tables = new ObservableCollection<Table>(orderedTables);
            }
            catch { /* Ignore or log */ }
            finally 
            {
                IsLoading = false;
            }
        }

        private void ExecuteRefresh(object? parameter)
        {
            LoadTables();
        }

        private async void ExecuteAddTable(object? parameter)
        {
            var newTable = new Table { TableNumber = "New Table", Capacity = 4, IsAvailable = true };
            var dialog = new Views.TableEditDialog
            {
                DataContext = new TableEditViewModel(newTable)
            };

            var result = await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "RootDialog");
            if (result is bool confirmed && confirmed && dialog.DataContext is TableEditViewModel vm)
            {
                IsLoading = true;
                var success = await _tableService.CreateTableAsync(vm.Table);
                IsLoading = false;
                
                if (success)
                {
                    LoadTables();
                    MessageBox.Show("Thêm bàn thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                }
                else
                {
                    MessageBox.Show("Lỗi khi thêm bàn!", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private async void ExecuteEditTable(object? parameter)
        {
            if (parameter is Table table)
            {
                // Clone table to avoid direct binding updates affecting the list before save
                var tableClone = new Table 
                { 
                    Id = table.Id, 
                    TableNumber = table.TableNumber, 
                    Capacity = table.Capacity, 
                    Floor = table.Floor,
                    IsAvailable = table.IsAvailable 
                };

                var dialog = new Views.TableEditDialog
                {
                    DataContext = new TableEditViewModel(tableClone)
                };

                var result = await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "RootDialog");
                if (result is bool confirmed && confirmed && dialog.DataContext is TableEditViewModel vm)
                {
                    IsLoading = true;
                    var success = await _tableService.UpdateTableAsync(vm.Table);
                    IsLoading = false;

                    if (success)
                    {
                        LoadTables();
                        MessageBox.Show("Cập nhật bàn thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                    else
                    {
                        MessageBox.Show("Lỗi khi cập nhật bàn!", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
        }

        private async void ExecuteDeleteTable(object? parameter)
        {
            if (parameter is Table table)
            {
                if (MessageBox.Show($"Bạn có chắc chắn muốn xóa bàn {table.TableNumber} không?", "Xác nhận xóa", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
                {
                    IsLoading = true;
                    var success = await _tableService.DeleteTableAsync(table.Id);
                    IsLoading = false;

                    if (success)
                    {
                        LoadTables();
                    }
                    else
                    {
                        MessageBox.Show("Không thể xóa bàn này (có thể đang có đơn hàng hoặc lỗi server).", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class TableEditViewModel : INotifyPropertyChanged
    {
        public Table Table { get; }

        public TableEditViewModel(Table table)
        {
            Table = table;
        }

        public string TableNumber
        {
            get => Table.TableNumber;
            set { Table.TableNumber = value; OnPropertyChanged(); }
        }

        public int Capacity
        {
            get => Table.Capacity;
            set { Table.Capacity = value; OnPropertyChanged(); }
        }

        public string Floor
        {
            get => Table.Floor;
            set { Table.Floor = value; OnPropertyChanged(); }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
