using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Data;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class MainViewModel : INotifyPropertyChanged
    {
        private readonly ProductService _productService;
        private readonly TableService _tableService;
        private readonly OrderService _orderService;
        private List<Product> _allProducts = new List<Product>();
        private ObservableCollection<Product> _products;
        private ObservableCollection<CartItem> _cartItems;
        private ObservableCollection<Table> _tables;
        private Table? _selectedTable;
        private Order? _currentOrder; // Track current active order for the table
        private string _selectedCategory = "All";
        private string _selectedTableFilter = "All"; // All, Available, Occupied
        private string _searchQuery = "";
        private bool _isLoading;
        private bool _isTableSelectionMode = true;

        private bool _isMergeMode;
        private ObservableCollection<Table> _selectedTablesForMerge = new ObservableCollection<Table>();

        public ICollectionView ProductsView { get; set; }

        public string SearchQuery
        {
            get => _searchQuery;
            set 
            { 
                _searchQuery = value; 
                OnPropertyChanged();
                ProductsView.Refresh(); // Filter products
                TablesView.Refresh(); // Filter tables
            }
        }

        // ... existing properties ...

        public MainViewModel()
        {
            _productService = new ProductService();
            _tableService = new TableService();
            _orderService = new OrderService();
            Products = new ObservableCollection<Product>();
            ProductsView = CollectionViewSource.GetDefaultView(Products);
            ProductsView.Filter = FilterProduct;

            CartItems = new ObservableCollection<CartItem>();
            Tables = new ObservableCollection<Table>();
            TablesView = CollectionViewSource.GetDefaultView(Tables);
            TablesView.Filter = FilterTable;

            // ... view models ...
            ReportsVM = new ReportsViewModel();
            ProductsVM = new ProductsViewModel();
            DashboardVM = new DashboardViewModel();
            SettingsVM = new SettingsViewModel();
            TableManagementVM = new TableManagementViewModel();
            
            // ... commands ...
            // (Same commands)
            AddToCartCommand = new RelayCommand(ExecuteAddToCart);
            RemoveFromCartCommand = new RelayCommand(ExecuteRemoveFromCart);
            IncreaseQuantityCommand = new RelayCommand(ExecuteIncreaseQuantity);
            DecreaseQuantityCommand = new RelayCommand(ExecuteDecreaseQuantity);
            FilterCategoryCommand = new RelayCommand(ExecuteFilterCategory);
            FilterTableCommand = new RelayCommand(ExecuteFilterTable);
            ClearCartCommand = new RelayCommand(ExecuteClearCart);
            CheckoutCommand = new RelayCommand(ExecuteCheckout);
            SelectTableCommand = new RelayCommand(ExecuteSelectTable);
            BackToTablesCommand = new RelayCommand(ExecuteBackToTables);
            SaveOrderCommand = new RelayCommand(ExecuteSaveOrder);
            LogoutCommand = new RelayCommand(ExecuteLogout);
            CloseApplicationCommand = new RelayCommand(ExecuteCloseApplication);
            NavigateCommand = new RelayCommand(ExecuteNavigate);
            ToggleNotificationsCommand = new RelayCommand(ExecuteToggleNotifications);
            
            // Merge Table Commands
            ToggleMergeModeCommand = new RelayCommand(ExecuteToggleMergeMode);
            ConfirmMergeCommand = new RelayCommand(ExecuteConfirmMerge);
            SplitTableCommand = new RelayCommand(ExecuteSplitTable);
            ViewDetailsCommand = new RelayCommand(ExecuteViewDetails);
            ViewDetailsCommand = new RelayCommand(ExecuteViewDetails);
            PrintOrderCommand = new RelayCommand(ExecutePrintOrder);
            RefreshCommand = new RelayCommand(_ => LoadData()); // F5 Refresh
            SearchCommand = new RelayCommand(_ => { /* Focus Search Box logic to be handled by View */ });
            
            // Load data
            LoadData();

            // Start Timer
            var timer = new System.Windows.Threading.DispatcherTimer();
            timer.Interval = TimeSpan.FromSeconds(1); // Update every second
            timer.Tick += (s, e) => UpdateTableDurations();
            timer.Start();

            // Pre-load data to warm up caches for faster Payment Dialog
            Task.Run(async () =>
            {
                try
                {
                    // Warm up Payment Settings
                    var settingsService = new PaymentSettingsService();
                    await settingsService.GetSettingsAsync();

                    // Warm up VietQR Banks
                    var qrService = new VietQRService();
                    await qrService.GetBanksAsync();
                }
                catch { /* Ignore preload errors */ }
            });
        }

        // ...

        private bool FilterProduct(object item)
        {
            if (item is Product product)
            {
                // Filter by Category
                bool categoryMatch = _selectedCategory == "All" || product.CategoryName == _selectedCategory;

                // Filter by Search
                bool searchMatch = string.IsNullOrEmpty(SearchQuery) || 
                                   product.Name.ToLower().Contains(SearchQuery.ToLower());

                return categoryMatch && searchMatch;
            }
            return true;
        }

        private async void LoadData()
        {
            IsLoading = true;
            try
            {
                // Load Data in Parallel
                var productsTask = _productService.GetProductsAsync();
                var tablesTask = _tableService.GetTablesAsync();

                await Task.WhenAll(productsTask, tablesTask);

                var products = productsTask.Result;
                var latestTables = tablesTask.Result;

                // Update Products (Bulk)
                _allProducts = products; // Keep raw list for lookups
                Products = new ObservableCollection<Product>(products);
                // Re-bind View
                ProductsView = CollectionViewSource.GetDefaultView(Products);
                ProductsView.Filter = FilterProduct;
                OnPropertyChanged(nameof(ProductsView));
                
                // Smart Update: Update existing tables instead of clearing
                foreach (var latestTable in latestTables)
                {
                    var existingTable = Tables.FirstOrDefault(t => t.Id == latestTable.Id);
                    if (existingTable != null)
                    {
                        // Update properties
                        existingTable.IsAvailable = latestTable.IsAvailable;
                        existingTable.OccupiedAt = latestTable.OccupiedAt;
                        existingTable.Floor = latestTable.Floor; // Update Floor
                        existingTable.IsMerged = latestTable.IsMerged;
                        existingTable.MergedGroupId = latestTable.MergedGroupId;
                        existingTable.MergedTableNumbers = latestTable.MergedTableNumbers;
                        
                        // Force duration update immediately
                        existingTable.UpdateDuration();
                    }
                    else
                    {
                        // Add new table
                        latestTable.UpdateDuration();
                        Tables.Add(latestTable);
                    }
                }

                // Update Floors List
                var activeFloors = latestTables
                    .Select(t => t.Floor)
                    .Where(f => !string.IsNullOrWhiteSpace(f))
                    .Distinct()
                    .OrderBy(f => f)
                    .ToList();
                
                // 1. Add new floors
                foreach (var floor in activeFloors)
                {
                    if (!AvailableFloors.Contains(floor))
                    {
                        AvailableFloors.Add(floor);
                    }
                }

                // 2. Remove floors that no longer exist (except "All")
                var floorsToRemove = AvailableFloors
                    .Where(f => f != "All" && !activeFloors.Contains(f))
                    .ToList();
                    
                foreach(var f in floorsToRemove)
                {
                    AvailableFloors.Remove(f);
                }

                // 3. Ensure 'All' exists
                if (!AvailableFloors.Contains("All"))
                {
                    AvailableFloors.Insert(0, "All");
                }

                // 4. Validate Selection
                if (!AvailableFloors.Contains(SelectedFloorFilter))
                {
                    SelectedFloorFilter = "All";
                }

                // Remove deleted tables
                var idsToRemove = Tables.Select(t => t.Id).Except(latestTables.Select(t => t.Id)).ToList();
                foreach (var id in idsToRemove)
                {
                    var tableToRemove = Tables.First(t => t.Id == id);
                    Tables.Remove(tableToRemove);
                }

                TablesView.Refresh(); // Apply filters to tables
            }
            catch
            {
                // Handle error
            }
            finally
            {
                IsLoading = false;
            }
        }
        
        // ...

        private void ExecuteFilterCategory(object? parameter)
        {
            if (parameter is string category)
            {
                _selectedCategory = category;
                ProductsView.Refresh();
            }
        }

        private void UpdateTableDurations()
        {
            if (Tables != null)
            {
                foreach (var table in Tables)
                {
                    table.UpdateDuration();
                }
            }
        }

        public ObservableCollection<Product> Products
        {
            get => _products;
            set { _products = value; OnPropertyChanged(); }
        }

        public ObservableCollection<CartItem> CartItems
        {
            get => _cartItems;
            set { _cartItems = value; OnPropertyChanged(); }
        }

        public ObservableCollection<Table> Tables
        {
            get => _tables;
            set { _tables = value; OnPropertyChanged(); }
        }

        public ICollectionView TablesView { get; }

        public string SelectedTableFilter
        {
            get => _selectedTableFilter;
            set { _selectedTableFilter = value; OnPropertyChanged(); TablesView.Refresh(); }
        }

        private string _selectedFloorFilter = "All";
        public string SelectedFloorFilter
        {
            get => _selectedFloorFilter;
            set { _selectedFloorFilter = value; OnPropertyChanged(); TablesView.Refresh(); }
        }

        private ObservableCollection<string> _availableFloors = new ObservableCollection<string> { "All" };
        public ObservableCollection<string> AvailableFloors
        {
            get => _availableFloors;
            set { _availableFloors = value; OnPropertyChanged(); }
        }

        public Table? SelectedTable
        {
            get => _selectedTable;
            set { _selectedTable = value; OnPropertyChanged(); }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); }
        }


        public bool IsTableSelectionMode
        {
            get => _isTableSelectionMode;
            set { _isTableSelectionMode = value; OnPropertyChanged(); }
        }

        public bool IsMergeMode
        {
            get => _isMergeMode;
            set { _isMergeMode = value; OnPropertyChanged(); }
        }

        public ObservableCollection<Table> SelectedTablesForMerge
        {
            get => _selectedTablesForMerge;
            set { _selectedTablesForMerge = value; OnPropertyChanged(); }
        }

        public decimal TotalAmount => CartItems.Sum(x => x.TotalPrice);

        public string CurrentUserName => UserSession.Instance.Username ?? "Admin";
        public bool IsAdmin => UserSession.Instance.Role == "Admin" || CurrentUserName == "Admin"; // Fallback for dev

        // View Navigation Properties
        private string _currentView = "Dashboard";
        public string CurrentView
        {
            get => _currentView;
            set
            {
                _currentView = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(IsSalesView));
                OnPropertyChanged(nameof(IsOrdersView));
                OnPropertyChanged(nameof(IsProductsView));
                OnPropertyChanged(nameof(IsReportsView));
                OnPropertyChanged(nameof(IsSettingsView));
                OnPropertyChanged(nameof(IsTableManagementView));
                OnPropertyChanged(nameof(IsDashboardView));
                
                if (value == "Orders")
                {
                    LoadOrders();
                }
                else if (value == "Dashboard")
                {
                    DashboardVM.LoadDashboardData();
                }
                else if (value == "Reports")
                {
                    ReportsVM.RefreshData();
                }
            }
        }

        public bool IsSalesView => CurrentView == "Sales";
        public bool IsOrdersView => CurrentView == "Orders";
        public bool IsProductsView => CurrentView == "Products";
        public bool IsReportsView => CurrentView == "Reports";
        public bool IsSettingsView => CurrentView == "Settings";
        public bool IsTableManagementView => CurrentView == "TableManagement";
        public bool IsDashboardView => CurrentView == "Dashboard";

        private ObservableCollection<Order> _orders = new ObservableCollection<Order>();
        public ObservableCollection<Order> Orders
        {
            get => _orders;
            set { _orders = value; OnPropertyChanged(); }
        }

        public ReportsViewModel ReportsVM { get; }
        public ProductsViewModel ProductsVM { get; }
        public DashboardViewModel DashboardVM { get; }
        public SettingsViewModel SettingsVM { get; }
        public TableManagementViewModel TableManagementVM { get; }

        // Commands
        public RelayCommand AddToCartCommand { get; }
        public RelayCommand RemoveFromCartCommand { get; }
        public RelayCommand IncreaseQuantityCommand { get; }
        public RelayCommand DecreaseQuantityCommand { get; }
        public RelayCommand FilterCategoryCommand { get; }
        public RelayCommand FilterTableCommand { get; }
        public RelayCommand ClearCartCommand { get; }
        public RelayCommand CheckoutCommand { get; }
        public RelayCommand SelectTableCommand { get; }
        public RelayCommand BackToTablesCommand { get; }
        public RelayCommand SaveOrderCommand { get; }
        public RelayCommand LogoutCommand { get; }
        public RelayCommand CloseApplicationCommand { get; }
        public RelayCommand NavigateCommand { get; }
        public RelayCommand ToggleMergeModeCommand { get; }
        public RelayCommand ConfirmMergeCommand { get; }
        public RelayCommand SplitTableCommand { get; }
        public RelayCommand ViewDetailsCommand { get; private set; }
        public RelayCommand PrintOrderCommand { get; private set; }
        public RelayCommand RefreshCommand { get; private set; }
        public RelayCommand SearchCommand { get; private set; } // Added for F3


        private void ExecuteToggleMergeMode(object? parameter)
        {
            IsMergeMode = !IsMergeMode;
            
            // Clear previous selections
            foreach(var t in SelectedTablesForMerge) t.IsSelectedForMerge = false;
            SelectedTablesForMerge.Clear();

            if (IsMergeMode)
            {
                ShowNotification("Chọn các bàn cần ghép, sau đó nhấn 'Xác nhận ghép'", NotificationType.Info);
            }
        }

        private async void ExecuteConfirmMerge(object? parameter)
        {
            if (SelectedTablesForMerge.Count < 2)
            {
                ShowNotification("Vui lòng chọn ít nhất 2 bàn để ghép!", NotificationType.Warning);
                return;
            }

            IsLoading = true;
            var tableIds = SelectedTablesForMerge.Select(t => t.Id).ToList();
            var success = await _tableService.MergeTablesAsync(tableIds);
            
            if (success)
            {
                ShowNotification($"Đã ghép {SelectedTablesForMerge.Count} bàn thành công!", NotificationType.Success);
                IsMergeMode = false;
                foreach(var t in SelectedTablesForMerge) t.IsSelectedForMerge = false;
                SelectedTablesForMerge.Clear();
                LoadData(); // Refresh tables
            }
            else
            {
                ShowNotification("Lỗi khi ghép bàn! Vui lòng thử lại.", NotificationType.Error);
            }
            IsLoading = false;
        }

        private async void ExecuteSplitTable(object? parameter)
        {
            if (SelectedTable == null || !SelectedTable.IsMerged || !SelectedTable.MergedGroupId.HasValue)
            {
                ShowNotification("Bàn này không phải bàn ghép!", NotificationType.Warning);
                return;
            }

            if (MessageBox.Show($"Bạn có chắc chắn muốn tách bàn {SelectedTable.TableNumber} không?", "Xác nhận tách bàn", MessageBoxButton.YesNo, MessageBoxImage.Question) != MessageBoxResult.Yes)
            {
                return;
            }

            IsLoading = true;
            var success = await _tableService.SplitTablesAsync(SelectedTable.MergedGroupId.Value);
            IsLoading = false;

            if (success)
            {
                ShowNotification("Đã tách bàn thành công!", NotificationType.Success);
                LoadData(); // Refresh tables to clear merge status
                ExecuteBackToTables(null);
            }
            else
            {
                ShowNotification("Không thể tách bàn! Vui lòng kiểm tra xem còn đơn hàng chưa thanh toán không.", NotificationType.Error);
            }
        }

        private async void ExecuteSelectTable(object? parameter)
        {
            if (parameter is Table table)
            {
                if (IsMergeMode)
                {
                    if (SelectedTablesForMerge.Contains(table))
                    {
                        SelectedTablesForMerge.Remove(table);
                        table.IsSelectedForMerge = false;
                        ShowNotification($"Đã bỏ chọn bàn {table.TableNumber}", NotificationType.Info);
                    }
                    else
                    {
                        if (!table.IsAvailable)
                        {
                             ShowNotification($"Bàn {table.TableNumber} đang có khách, không thể ghép!", NotificationType.Warning);
                             return;
                        }
                        SelectedTablesForMerge.Add(table);
                        table.IsSelectedForMerge = true;
                        ShowNotification($"Đã chọn bàn {table.TableNumber}", NotificationType.Info);
                    }
                    return;
                }

                SelectedTable = table;
                IsTableSelectionMode = false;
                CartItems.Clear();
                _currentOrder = null;

                // Always try to load existing order, regardless of table status (backend sync safety)
                IsLoading = true;
                var orders = await _orderService.GetOrdersByTableAsync(table.Id);
                var activeOrder = orders.FirstOrDefault(o => o.Status != "Completed" && o.Status != "Cancelled");
                
                if (activeOrder != null)
                {
                    _currentOrder = activeOrder;
                    foreach (var item in activeOrder.OrderItems)
                    {
                        // Map OrderItem to CartItem
                        var product = _allProducts.FirstOrDefault(p => p.Id == item.ProductId) ?? item.Product;
                        
                        if (product != null)
                        {
                            CartItems.Add(new CartItem(product, item.Quantity, false, item.Id));
                        }
                    }
                    OnPropertyChanged(nameof(TotalAmount));
                    
                    if (SelectedTable.IsAvailable)
                    {
                        SelectedTable.IsAvailable = false;
                        OnPropertyChanged(nameof(SelectedTable));
                    }
                }
                // Show Empty Cart or Loaded Cart on Display
                UpdateCustomerDisplay();
                IsLoading = false;
            }
        }

        private void ExecuteBackToTables(object? parameter)
        {
            IsTableSelectionMode = true;
            SelectedTable = null;
            CartItems.Clear();
            _currentOrder = null;
            CustomerDisplayService.Instance.ShowIdle(); // Reset display
            LoadData(); // Refresh table status
        }

        private void UpdateCustomerDisplay()
        {
            CustomerDisplayService.Instance.UpdateCart(CartItems, TotalAmount);
        }

        private void ExecuteAddToCart(object? parameter)
        {
            if (parameter is Product product)
            {
                var existingItem = CartItems.FirstOrDefault(i => i.Product.Id == product.Id);
                if (existingItem != null)
                {
                    existingItem.Quantity++;
                }
                else
                {
                    CartItems.Add(new CartItem(product));
                }
                OnPropertyChanged(nameof(TotalAmount));
                UpdateCustomerDisplay();
            }
        }

        private void ExecuteRemoveFromCart(object? parameter)
        {
            if (parameter is CartItem item)
            {
                CartItems.Remove(item);
                OnPropertyChanged(nameof(TotalAmount));
                UpdateCustomerDisplay();
            }
        }

        private void ExecuteIncreaseQuantity(object? parameter)
        {
            if (parameter is CartItem item)
            {
                item.Quantity++;
                OnPropertyChanged(nameof(TotalAmount));
                UpdateCustomerDisplay();
            }
        }

        private void ExecuteDecreaseQuantity(object? parameter)
        {
            if (parameter is CartItem item)
            {
                if (item.Quantity > 1)
                {
                    item.Quantity--;
                }
                else
                {
                    CartItems.Remove(item);
                }
                OnPropertyChanged(nameof(TotalAmount));
                UpdateCustomerDisplay();
            }
        }


        private void ExecuteFilterTable(object? parameter)
        {
            if (parameter is string filter)
            {
                SelectedTableFilter = filter;
            }
        }

        private bool FilterTable(object item)
        {
            if (item is Table table)
            {
                // Filter by Status
                bool statusMatch = SelectedTableFilter == "All" ||
                                   (SelectedTableFilter == "Available" && table.IsAvailable) ||
                                   (SelectedTableFilter == "Occupied" && !table.IsAvailable);

                // Filter by Floor
                bool floorMatch = SelectedFloorFilter == "All" || table.Floor == SelectedFloorFilter;

                // Filter by Search Query (Table Number)
                bool searchMatch = string.IsNullOrEmpty(SearchQuery) || 
                                   table.TableNumber.ToLower().Contains(SearchQuery.ToLower());

                return statusMatch && floorMatch && searchMatch;
            }
            return true;
        }


        private void ExecuteClearCart(object? parameter)
        {
            CartItems.Clear();
            OnPropertyChanged(nameof(TotalAmount));
            UpdateCustomerDisplay();
        }

        // Notifications
        public MaterialDesignThemes.Wpf.SnackbarMessageQueue MessageQueue { get; } = new MaterialDesignThemes.Wpf.SnackbarMessageQueue(TimeSpan.FromSeconds(2));
        public ObservableCollection<NotificationModel> Notifications { get; } = new ObservableCollection<NotificationModel>();
        
        private bool _isNotificationsOpen;
        public bool IsNotificationsOpen
        {
            get => _isNotificationsOpen;
            set { _isNotificationsOpen = value; OnPropertyChanged(); }
        }

        public RelayCommand ToggleNotificationsCommand { get; }

        private void ShowNotification(string message, NotificationType type)
        {
            // 1. Show Toast (Snackbar)
            MessageQueue.Enqueue(message);

            // 2. Add to History
            Application.Current.Dispatcher.Invoke(() => 
            {
                Notifications.Insert(0, new NotificationModel(message, type));
            });
        }

        private async void ExecuteSaveOrder(object? parameter)
        {
            if (SelectedTable == null || CartItems.Count == 0) return;

            IsLoading = true;
            if (_currentOrder == null)
            {
                // Create new order
                var request = new CreateOrderRequest
                {
                    TableId = SelectedTable.Id,
                    Items = CartItems.Select(c => new CreateOrderItemRequest 
                    { 
                        ProductId = c.Product.Id, 
                        Quantity = c.Quantity,
                        Note = c.Note
                    }).ToList()
                };

                var newOrder = await _orderService.CreateOrderAsync(request);
                if (newOrder != null)
                {
                    _currentOrder = newOrder;
                    ShowNotification("Đã lưu đơn hàng thành công!", NotificationType.Success);
                    
                    // Mark all as not new
                    foreach(var item in CartItems) item.IsNew = false;
                    
                    ExecuteBackToTables(null); 
                }
                else
                {
                    ShowNotification("Lỗi khi lưu đơn hàng!", NotificationType.Error);
                }
            }
            else
            {
                // Update existing order
                bool allSuccess = true;
                int updatesCount = 0;

                // 1. Handle New Items
                var newItems = CartItems.Where(c => c.IsNew).ToList();
                foreach (var item in newItems)
                {
                    var updatedOrder = await _orderService.AddItemToOrderAsync(_currentOrder.Id, item.Product.Id, item.Quantity, item.Note);
                    if (updatedOrder == null) allSuccess = false;
                    else updatesCount++;
                }

                // 2. Handle Updated Items (Quantity Changed)
                var updatedItems = CartItems.Where(c => !c.IsNew && c.Quantity != c.OriginalQuantity).ToList();
                foreach (var item in updatedItems)
                {
                    if (item.OrderItemId.HasValue)
                    {
                        var updatedOrder = await _orderService.UpdateItemQuantityAsync(_currentOrder.Id, item.OrderItemId.Value, item.Quantity);
                        if (updatedOrder == null) allSuccess = false;
                        else updatesCount++;
                    }
                }

                if (updatesCount > 0 && allSuccess)
                {
                     ShowNotification($"Đã cập nhật {updatesCount} món!", NotificationType.Success);
                     ExecuteBackToTables(null);
                }
                else if (updatesCount > 0 && !allSuccess)
                {
                    ShowNotification("Một số món không cập nhật được!", NotificationType.Warning);
                    ExecuteSelectTable(SelectedTable);
                }
                else
                {
                     ShowNotification("Không có thay đổi nào để lưu!", NotificationType.Info);
                }
            }
            IsLoading = false;
        }

        private async void ExecuteCheckout(object? parameter)
        {
            try
            {
                if (SelectedTable == null || _currentOrder == null) 
                {
                    ShowNotification("Vui lòng lưu đơn hàng trước khi thanh toán!", NotificationType.Warning);
                    return;
                }

                // Create Payment ViewModel
                var paymentVm = new PaymentViewModel(TotalAmount, SelectedTable.TableNumber);
                
                // Create View
                var paymentView = new Views.PaymentDialog
                {
                    DataContext = paymentVm
                };

                // Show Dialog
                var result = await MaterialDesignThemes.Wpf.DialogHost.Show(paymentView, "RootDialog");

                // Check Result
                if (result is bool confirmed && confirmed)
                {
                    IsLoading = true;
                    
                    // Determine payment method and final amount
                    string method = paymentVm.IsCashPayment ? "Cash" : "Transfer";
                    decimal amountPaid = paymentVm.IsCashPayment ? paymentVm.ReceivedAmount : paymentVm.FinalAmount;
                    
                    var success = await _orderService.CompleteOrderAsync(_currentOrder.Id, amountPaid, method);
                    
                    IsLoading = false;

                    if (success)
                    {
                        ShowNotification($"Thanh toán thành công cho bàn {SelectedTable.TableNumber}!", NotificationType.Success);
                        
                        // Print Receipt Prompt
                        var printResult = MessageBox.Show("Thanh toán thành công! Bạn có muốn in hóa đơn không?", "In hóa đơn", MessageBoxButton.YesNo, MessageBoxImage.Question);
                        if (printResult == MessageBoxResult.Yes)
                        {
                            var printingService = new ReceiptPrintingService();
                            printingService.PrintReceipt(_currentOrder, amountPaid, paymentVm.Change, method, CurrentUserName);
                        }

                        CartItems.Clear();
                        _currentOrder = null;
                        OnPropertyChanged(nameof(TotalAmount));
                        
                        // Force refresh tables to update color status immediately
                        ExecuteBackToTables(null);
                    }
                    else
                    {
                        ShowNotification("Lỗi khi thanh toán! Vui lòng thử lại.", NotificationType.Error);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi thanh toán: {ex.Message}\n\nChi tiết: {ex.StackTrace}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ExecuteLogout(object? parameter)
        {
            MessageBox.Show("Đăng xuất thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);

            UserSession.Instance.ClearSession();
            
            var loginWindow = new LoginWindow();
                Application.Current.MainWindow = loginWindow;
                loginWindow.Show();
                
                // Close current window
                if (parameter is Window mainWindow)
                {
                    mainWindow.Close();
                }
                else
                {
                    // Fallback if parameter not passed
                    foreach (Window window in Application.Current.Windows)
                    {
                        if (window is MainWindow)
                        {
                            window.Close();
                            break;
                        }
                    }
                }
        }

        private void ExecuteCloseApplication(object? parameter)
        {
            if (MessageBox.Show("Bạn có chắc chắn muốn thoát ứng dụng?", "Thoát", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
            {
                Application.Current.Shutdown();
            }
        }

        private void ExecuteNavigate(object? parameter)
        {
            if (parameter is string viewName)
            {
                CurrentView = viewName;
            }
        }

        private void ExecuteToggleNotifications(object? parameter)
        {
            IsNotificationsOpen = !IsNotificationsOpen;
        }

        private async void LoadOrders()
        {
            IsLoading = true;
            try 
            {
                var orders = await _orderService.GetAllOrdersAsync();
                var orderedList = orders.OrderByDescending(o => o.CreatedAt);
                
                // Bulk Update
                Orders = new ObservableCollection<Order>(orderedList);
            }
            catch (Exception ex)
            {
                // Optionally log
                ShowNotification("Lỗi tải danh sách đơn hàng", NotificationType.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async void ExecuteViewDetails(object? parameter)
        {
            if (parameter is Order order)
            {
                var view = new Views.OrderDetailsDialog
                {
                    DataContext = order
                };

                await MaterialDesignThemes.Wpf.DialogHost.Show(view, "RootDialog");
            }
        }

        private void ExecutePrintOrder(object? parameter)
        {
             if (parameter is Order order)
            {
                var result = MessageBox.Show($"Bạn muốn in loại phiếu nào cho đơn #{order.Id}?\n\nYes: Hóa đơn thanh toán\nNo: Phiếu báo bếp\nCancel: Hủy", "Chọn loại in", MessageBoxButton.YesNoCancel, MessageBoxImage.Question);

                if (result == MessageBoxResult.Cancel) return;

                var printingService = new ReceiptPrintingService();

                if (result == MessageBoxResult.Yes)
                {
                    // Print Receipt (Reprints receipt with 0 paid/change since it's just a reprint or view)
                    // Or we could try to fetch payment info if available. For now, assuming reprint.
                    // We'll pass 0 for paid/change as it might be a pre-bill check.
                    printingService.PrintReceipt(order, order.TotalAmount, 0, "Reprint", CurrentUserName);
                }
                else if (result == MessageBoxResult.No)
                {
                    // Print Kitchen Ticket
                    printingService.PrintKitchenTicket(order, "In lại bởi quản lý");
                }
            }
        }



        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
