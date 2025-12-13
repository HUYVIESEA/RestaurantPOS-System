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
        private bool _isGlobalLoading;
        public bool IsGlobalLoading
        {
            get => _isGlobalLoading;
            set
            {
                _isGlobalLoading = value;
                OnPropertyChanged();
            }
        }

        private readonly ProductService _productService;
        private readonly TableService _tableService;
        private readonly OrderService _orderService;
        private List<Product> _allProducts = new List<Product>();
        private ObservableCollection<Product> _products = new ObservableCollection<Product>();
        private ObservableCollection<CartItem> _cartItems = new ObservableCollection<CartItem>();
        private ObservableCollection<Table> _tables = new ObservableCollection<Table>();
        private Table? _selectedTable;
        private Order? _currentOrder; // Track current active order for the table
        public Order? CurrentOrder
        {
            get => _currentOrder;
            set { _currentOrder = value; OnPropertyChanged(); }
        }

        private Table? _takeAwayTable;
        public Table? TakeAwayTable
        {
            get => _takeAwayTable;
            set { _takeAwayTable = value; OnPropertyChanged(); }
        }
        private string _selectedCategory = "All";
        private string _selectedTableFilter = "All"; // All, Available, Occupied
        private string _searchQuery = "";
        private bool _isLoading;
        private bool _isTableSelectionMode = true;

        private bool _isMergeMode;
        private ObservableCollection<Table> _selectedTablesForMerge = new ObservableCollection<Table>();
        private System.Windows.Threading.DispatcherTimer _timer;

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
            TablesView.SortDescriptions.Add(new SortDescription(nameof(Table.TableNumber), ListSortDirection.Ascending));

            // ... view models ...
            ReportsVM = new ReportsViewModel();
            ProductsVM = new ProductsViewModel();
            DashboardVM = new DashboardViewModel();
            SettingsVM = new SettingsViewModel();
            TableManagementVM = new TableManagementViewModel();
            UsersVM = new UsersViewModel();
            
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
            PrintOrderCommand = new RelayCommand(ExecutePrintOrder);
            PrintKitchenCommand = new RelayCommand(ExecutePrintKitchen);
            RefreshCommand = new RelayCommand(_ => _ = LoadData()); // F5 Refresh
            SearchCommand = new RelayCommand(_ => { /* Focus Search Box logic to be handled by View */ });
            SearchCommand = new RelayCommand(_ => { /* Focus Search Box logic to be handled by View */ });
            ExportOrdersCommand = new RelayCommand(ExecuteExportOrders);
            SelectTakeAwayCommand = new RelayCommand(ExecuteSelectTakeAway);
            
            // Pagination
            NextPageCommand = new RelayCommand(ExecuteNextPage, _ => CanGoNext);
            PreviousPageCommand = new RelayCommand(ExecutePreviousPage, _ => CanGoPrevious);

            // Load data
            _ = LoadData();

            // Start Timer
            _timer = new System.Windows.Threading.DispatcherTimer();
            _timer.Interval = TimeSpan.FromSeconds(1); // Update every second
            _timer.Tick += (s, e) => UpdateTableDurations();
            _timer.Start();

            // Pre-load data to warm up caches for faster Payment Dialog
            _ = Task.Run(async () =>
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
                bool categoryMatch = _selectedCategory == "All" || string.Equals(product.CategoryName, _selectedCategory, StringComparison.OrdinalIgnoreCase);

                // Filter by Search - Optimized with IndexOf
                bool searchMatch = string.IsNullOrEmpty(SearchQuery) || 
                                   product.Name.IndexOf(SearchQuery, StringComparison.OrdinalIgnoreCase) >= 0;

                return categoryMatch && searchMatch;
            }
            return true;
        }

        public async Task LoadData()
        {
            if (IsLoading) return;
            IsLoading = true;
            IsGlobalLoading = true;

            try
            {
                // 1. Load Users (if needed for permissions)
                await UsersVM.LoadUsersAsync();

                // 2. Load Products & Tables in Parallel
                await Task.WhenAll(LoadProductsAsync(), LoadTablesAsync());

                if (!_timer.IsEnabled) _timer.Start();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadData Error: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
                IsGlobalLoading = false;
            }
        }

        public async Task LoadProductsAsync()
        {
            try
            {
                var products = await _productService.GetProductsAsync();
                _allProducts = products.ToList();
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    // Optimized: Replace collection instead of Clear/Add loop
                    Products = new ObservableCollection<Product>(_allProducts);
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadProducts Error: {ex.Message}");
            }
        }

        public async Task LoadTablesAsync()
        {
            try
            {
                var latestTables = await _tableService.GetTablesAsync();

                // SPECIAL: Handler for "Mang ve" (Take Away)
                var takeAway = latestTables.FirstOrDefault(t => 
                    t.TableNumber.Equals("Mang về", StringComparison.OrdinalIgnoreCase) || 
                    t.TableNumber.Equals("Mang ve", StringComparison.OrdinalIgnoreCase) ||
                    t.TableNumber.Equals("Take Away", StringComparison.OrdinalIgnoreCase));
                
                if (takeAway != null)
                {
                    TakeAwayTable = takeAway;
                    latestTables.Remove(takeAway); // Don't show in Grid
                }

                Application.Current.Dispatcher.Invoke(() =>
                {
                    // Remove deleted tables
                    var idsToRemove = Tables.Select(t => t.Id).Except(latestTables.Select(t => t.Id)).ToList();
                    foreach (var id in idsToRemove)
                    {
                        var tableToRemove = Tables.First(t => t.Id == id);
                        Tables.Remove(tableToRemove);
                    }

                    // Update existing or Add new
                    foreach (var latestTable in latestTables)
                    {
                        var existingTable = Tables.FirstOrDefault(t => t.Id == latestTable.Id);
                        if (existingTable != null)
                        {
                            // Update properties
                            if (existingTable.IsAvailable != latestTable.IsAvailable) existingTable.IsAvailable = latestTable.IsAvailable;
                            if (existingTable.OccupiedAt != latestTable.OccupiedAt) existingTable.OccupiedAt = latestTable.OccupiedAt;
                            if (existingTable.Floor != latestTable.Floor) existingTable.Floor = latestTable.Floor;
                            if (existingTable.IsMerged != latestTable.IsMerged) existingTable.IsMerged = latestTable.IsMerged;
                            if (existingTable.MergedGroupId != latestTable.MergedGroupId) existingTable.MergedGroupId = latestTable.MergedGroupId;
                            if (existingTable.MergedTableNumbers != latestTable.MergedTableNumbers) existingTable.MergedTableNumbers = latestTable.MergedTableNumbers;
                            existingTable.UpdateDuration();
                        }
                        else
                        {
                            latestTable.UpdateDuration();
                            Tables.Add(latestTable);
                        }
                    }

                    // Update Floors
                    var activeFloors = latestTables.Select(t => t.Floor).Where(f => !string.IsNullOrWhiteSpace(f)).Distinct().OrderBy(f => f).ToList();
                    foreach (var floor in activeFloors)
                    {
                        if (!AvailableFloors.Contains(floor)) AvailableFloors.Add(floor);
                    }
                    var floorsToRemove = AvailableFloors.Where(f => f != "All" && !activeFloors.Contains(f)).ToList();
                    foreach(var f in floorsToRemove) AvailableFloors.Remove(f);

                    TablesView.Refresh();
                });
            }
            catch (Exception ex)
            {
                 System.Diagnostics.Debug.WriteLine($"LoadTables Error: {ex.Message}");
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
            set 
            { 
                _products = value; 
                OnPropertyChanged();
                
                // Update View when collection changes
                ProductsView = CollectionViewSource.GetDefaultView(_products);
                ProductsView.Filter = FilterProduct;
                OnPropertyChanged(nameof(ProductsView));
            }
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


        public string CurrentUserName => UserSession.Instance.Username ?? "User";
        public string CurrentUserRole => UserSession.Instance.Role ?? "Staff";

        // Role Flags
        public bool IsAdmin => CurrentUserRole == "Admin";
        public bool IsManager => CurrentUserRole == "Admin" || CurrentUserRole == "Manager";
        
        // Feature Permissions
        public bool CanViewReports => IsManager;
        public bool CanManageProducts => IsManager;
        public bool CanManageTables => IsManager;
        public bool CanManageUsers => IsAdmin; // Only Admin can manage users
        public bool CanAccessSettings => IsAdmin; // Only Admin can access system settings

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
                OnPropertyChanged(nameof(IsUsersView));
                
                if (value == "Orders")
                {
                    LoadOrders();
                }
                else if (value == "Dashboard")
                {
                    _ = DashboardVM.LoadDashboardData();
                }
                else if (value == "Reports")
                {
                    _ = ReportsVM.RefreshData();
                }
                else if (value == "Users")
                {
                    if (UsersVM.Users.Count == 0)
                    {
                        UsersVM.LoadUsersCommand.Execute(null);
                    }
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
        public bool IsUsersView => CurrentView == "Users";

        private ObservableCollection<Order> _orders = new ObservableCollection<Order>();
        public ObservableCollection<Order> Orders
        {
            get => _orders;
            set { _orders = value; OnPropertyChanged(); }
        }

        // Pagination Properties
        private int _currentPage = 1;
        public int CurrentPage
        {
            get => _currentPage;
            set { _currentPage = value; OnPropertyChanged(); OnPropertyChanged(nameof(CanGoNext)); OnPropertyChanged(nameof(CanGoPrevious)); }
        }

        private int _totalPages = 1;
        public int TotalPages
        {
            get => _totalPages;
            set { _totalPages = value; OnPropertyChanged(); OnPropertyChanged(nameof(CanGoNext)); OnPropertyChanged(nameof(CanGoPrevious)); }
        }

        private int _pageSize = 20; // Default page size

        public bool CanGoNext => CurrentPage < TotalPages;
        public bool CanGoPrevious => CurrentPage > 1;

        public ReportsViewModel ReportsVM { get; }
        public ProductsViewModel ProductsVM { get; }
        public DashboardViewModel DashboardVM { get; }
        public SettingsViewModel SettingsVM { get; }
        public TableManagementViewModel TableManagementVM { get; }
        public UsersViewModel UsersVM { get; }

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
        
        // Pagination Commands
        public RelayCommand NextPageCommand { get; }
        public RelayCommand PreviousPageCommand { get; }
        public RelayCommand ToggleMergeModeCommand { get; }
        public RelayCommand ConfirmMergeCommand { get; }
        public RelayCommand SplitTableCommand { get; }
        public RelayCommand ViewDetailsCommand { get; private set; }
        public RelayCommand PrintOrderCommand { get; private set; }
        public RelayCommand PrintKitchenCommand { get; private set; }
        public RelayCommand RefreshCommand { get; private set; }
        public RelayCommand SearchCommand { get; private set; } // Added for F3
        public RelayCommand ExportOrdersCommand { get; private set; }
        public RelayCommand SelectTakeAwayCommand { get; private set; }

        private async void ExecuteSelectTakeAway(object? parameter)
        {
            if (TakeAwayTable == null)
            {
                ShowNotification("Không tìm thấy bàn 'Mang về' trong hệ thống!", NotificationType.Error);
                return;
            }

            // Create VM in Loading State
            var vm = new RestaurantPOS.Desktop.Views.Dialogs.TakeAwaySelectionViewModel(
                new RelayCommand(o => {
                    MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(null, null);
                    if (o is Order selected) LoadTakeAwayOrder(selected);
                }),
                new RelayCommand(_ => {
                    MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(null, null);
                    StartNewTakeAwayOrder();
                })
            );

            var view = new RestaurantPOS.Desktop.Views.Dialogs.TakeAwaySelectionDialog
            {
                DataContext = vm
            };

            // Show Dialog Immediately (Fire and wait)
            // We launch the data loading in parallel AFTER dialog opens
            var showDialogTask = MaterialDesignThemes.Wpf.DialogHost.Show(view, "RootDialog");

            // Load Data Background
            _ = Task.Run(async () => 
            {
                try
                {
                    // Artificial delay if needed for smooth animation, but here we want speed.
                    var orders = await _orderService.GetOrdersByTableAsync(TakeAwayTable.Id);
                    var activeOrders = orders.Where(o => o.Status != "Completed" && o.Status != "Cancelled").ToList();

                    Application.Current.Dispatcher.Invoke(() => 
                    {
                        vm.IsLoading = false;
                        if (activeOrders.Count == 0)
                        {
                            // No orders: Close dialog and Start New
                            MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(null, null);
                            StartNewTakeAwayOrder();
                        }
                        else
                        {
                            // Populate list
                            vm.ActiveOrders = new ObservableCollection<Order>(activeOrders);
                        }
                    });
                }
                catch(Exception ex)
                {
                    Application.Current.Dispatcher.Invoke(() => 
                    {
                        vm.IsLoading = false;
                        ShowNotification($"Lỗi tải đơn: {ex.Message}", NotificationType.Error);
                        MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(null, null);
                    });
                }
            });

            await showDialogTask;
        }

        private void StartNewTakeAwayOrder()
        {
            SelectedTable = TakeAwayTable;
            IsTableSelectionMode = false;
            CartItems.Clear();
            CurrentOrder = null;
            UpdateCustomerDisplay();
        }

        private async void LoadTakeAwayOrder(Order order)
        {
            // Close Dialog & Switch View
            SelectedTable = TakeAwayTable;
            IsTableSelectionMode = false;
            IsLoading = true;

            // Optional: Small delay to let the dialog close animation finish smoothly before heavy lifting
            await Task.Delay(300);

            try
            {
                CurrentOrder = order;
                CartItems.Clear();

                // Populate Cart
                if (order.OrderItems != null)
                {
                    // Run calculation in background to prevent UI freeze if many items
                    var cartItemsToAdd = await Task.Run(() => 
                    {
                        var list = new List<CartItem>();
                        foreach (var item in order.OrderItems)
                        {
                            var product = _allProducts.FirstOrDefault(p => p.Id == item.ProductId) ?? item.Product;
                            if (product != null)
                            {
                                var cartItem = new CartItem(product, item.Quantity, false, item.Id);
                                cartItem.Note = item.Note ?? string.Empty;
                                list.Add(cartItem);
                            }
                        }
                        return list;
                    });

                    // Update UI
                    foreach(var item in cartItemsToAdd)
                    {
                        CartItems.Add(item);
                    }
                }
            
                OnPropertyChanged(nameof(TotalAmount));
                UpdateCustomerDisplay();
            }
            catch (Exception ex)
            {
                ShowNotification($"Lỗi tải đơn hàng: {ex.Message}", NotificationType.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }


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
                _ = LoadTablesAsync(); // Refresh tables
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

            if (!await DialogHelper.ShowConfirm("Xác nhận tách bàn", $"Bạn có chắc chắn muốn tách bàn {SelectedTable.TableNumber} không?"))
            {
                return;
            }

            IsLoading = true;
            var success = await _tableService.SplitTablesAsync(SelectedTable.MergedGroupId.Value);
            IsLoading = false;

            if (success)
            {
                ShowNotification("Đã tách bàn thành công!", NotificationType.Success);
                _ = LoadTablesAsync(); // Refresh tables to clear merge status
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

                // OPTIMISTIC UI: Switch view immediately
                SelectedTable = table;
                IsTableSelectionMode = false;
                CartItems.Clear();
                CurrentOrder = null;
                IsLoading = true;

                // Load Data in Background
                try 
                {
                    // Always try to load existing order, regardless of table status (backend sync safety)
                    var orders = await _orderService.GetOrdersByTableAsync(table.Id);
                    var activeOrder = orders.FirstOrDefault(o => o.Status != "Completed" && o.Status != "Cancelled");
                    
                    if (activeOrder != null)
                    {
                        CurrentOrder = activeOrder;
                        foreach (var item in activeOrder.OrderItems)
                        {
                            // Map OrderItem to CartItem
                            var product = _allProducts.FirstOrDefault(p => p.Id == item.ProductId) ?? item.Product;
                            
                            if (product != null)
                            {
                                var cartItem = new CartItem(product, item.Quantity, false, item.Id);
                                cartItem.Note = item.Note ?? string.Empty; // Restore Note, handle potential null
                                CartItems.Add(cartItem);
                            }
                        }
                        OnPropertyChanged(nameof(TotalAmount));
                        
                        if (SelectedTable != null && SelectedTable.IsAvailable)
                        {
                            SelectedTable.IsAvailable = false;
                            OnPropertyChanged(nameof(SelectedTable));
                        }
                    }
                    // Show Empty Cart or Loaded Cart on Display
                    UpdateCustomerDisplay();
                }
                catch (Exception ex)
                {
                    ShowNotification($"Lỗi tải đơn hàng: {ex.Message}", NotificationType.Error);
                }
                finally
                {
                    IsLoading = false;
                }
            }
        }

        private void ExecuteBackToTables(object? parameter)
        {
            IsTableSelectionMode = true;
            SelectedTable = null;
            CartItems.Clear();
            CurrentOrder = null;
            CustomerDisplayService.Instance.ShowIdle(); // Reset display
            _ = LoadTablesAsync(); // Refresh table status
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
                    CurrentOrder = newOrder;
                    ShowNotification("Đã lưu đơn hàng thành công!", NotificationType.Success);
                    
                    // Mark all as not new
                    foreach(var item in CartItems) item.IsNew = false;
                    
                    // Optimistic Update for UI responsiveness
                    if (SelectedTable != null)
                    {
                        SelectedTable.IsAvailable = false;
                        SelectedTable.OccupiedAt = DateTime.Now;
                        SelectedTable.UpdateDuration();
                    }

                    // Small delay to allow backend/DB to propagate changes before LoadData refreshes
                    await Task.Delay(500);

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
                // 2. Handle Updated Items (Quantity or Note)
                var existingItems = CartItems.Where(c => !c.IsNew).ToList();
                foreach (var item in existingItems)
                {
                    if (item.OrderItemId.HasValue)
                    {
                        // Check Quantity Change
                        if (item.Quantity != item.OriginalQuantity && _currentOrder != null)
                        {
                            var updatedOrder = await _orderService.UpdateItemQuantityAsync(_currentOrder.Id, item.OrderItemId.Value, item.Quantity);
                            if (updatedOrder == null) allSuccess = false;
                            else updatesCount++;
                        }

                        // Check Note Change
                        var originalItem = _currentOrder?.OrderItems.FirstOrDefault(oi => oi.Id == item.OrderItemId);
                        if (originalItem != null && originalItem.Note != item.Note && _currentOrder != null)
                        {
                             var updatedOrder = await _orderService.UpdateItemNoteAsync(_currentOrder.Id, item.OrderItemId.Value, item.Note ?? "");
                             if (updatedOrder == null) allSuccess = false;
                             else updatesCount++;
                        }
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
                        
                        // Print Receipt Prompt - Custom View needed or simple confirm? 
                        bool print = await DialogHelper.ShowConfirm("In hóa đơn", "Thanh toán thành công! Bạn có muốn in hóa đơn không?");
                        if (print)
                        {
                            var printingService = new ReceiptPrintingService();
                            printingService.PrintReceipt(_currentOrder, amountPaid, paymentVm.Change, method, CurrentUserName);
                        }

                        CartItems.Clear();
                        CurrentOrder = null;
                        OnPropertyChanged(nameof(TotalAmount));
                        
                        // Optimistic Update: Free the table immediately
                        if (SelectedTable != null)
                        {
                            SelectedTable.IsAvailable = true;
                            SelectedTable.OccupiedAt = null;
                        }

                        // Delay slightly to allow backend sync
                        await Task.Delay(500);

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
                await DialogHelper.ShowAlert("Lỗi thanh toán", $"Chi tiết: {ex.Message}", "Error");
            }
        }

        private async void ExecuteLogout(object? parameter)
        {
             if (!await DialogHelper.ShowConfirm("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?")) return;

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

        private async void ExecuteCloseApplication(object? parameter)
        {
            if (await DialogHelper.ShowConfirm("Thoát ứng dụng", "Bạn có chắc chắn muốn thoát ứng dụng?"))
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
                var result = await _orderService.GetOrdersAsync(CurrentPage, _pageSize);
                
                // Update Pagination
                TotalPages = result.TotalPages;
                
                // Bulk Update
                Orders = new ObservableCollection<Order>(result.Items);
            }
            catch (Exception)
            {
                // Optionally log
                ShowNotification("Lỗi tải danh sách đơn hàng", NotificationType.Error);
            }
            finally
            {
                IsLoading = false;
                // Force command refresh
                System.Windows.Input.CommandManager.InvalidateRequerySuggested();
            }
        }

        private void ExecuteNextPage(object? parameter)
        {
            if (CanGoNext)
            {
                CurrentPage++;
                LoadOrders();
            }
        }

        private void ExecutePreviousPage(object? parameter)
        {
            if (CanGoPrevious)
            {
                CurrentPage--;
                LoadOrders();
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

        private async void ExecuteExportOrders(object? parameter)
        {
            if (Orders == null || Orders.Count == 0)
            {
                ShowNotification("Không có đơn hàng nào để xuất!", NotificationType.Warning);
                return;
            }

            try
            {
                var exportService = new ReportExportService();
                await exportService.ExportOrdersToCsvAsync(Orders);
                ShowNotification("Xuất danh sách đơn hàng thành công!", NotificationType.Success);
            }
            catch (Exception ex)
            {
                ShowNotification($"Lỗi khi xuất file: {ex.Message}", NotificationType.Error);
            }
        }

        private void ExecutePrintKitchen(object? parameter)
        {
            if (CurrentOrder != null) // Use Current Active Order
            {
                var printingService = new ReceiptPrintingService();
                printingService.PrintKitchenTicket(CurrentOrder, "Yêu cầu mới");
                ShowNotification("Đã gửi in báo bếp!", NotificationType.Success);
            }
            else
            {
                ShowNotification("Chưa chọn đơn hàng!", NotificationType.Warning);
            }
        }

        private async void ExecutePrintOrder(object? parameter)
        {
             if (parameter is Order order)
            {
                var dialog = new Views.Dialogs.PrintOptionDialog($"Bạn muốn in loại phiếu nào cho đơn #{order.Id}?");
                var result = await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "RootDialog");

                if (result is string option && option != "Cancel")
                {
                    var printingService = new ReceiptPrintingService();

                    if (option == "Receipt")
                    {
                        // Print Receipt
                        printingService.PrintReceipt(order, order.TotalAmount, 0, "Reprint", CurrentUserName);
                    }
                    else if (option == "Kitchen")
                    {
                        // Print Kitchen Ticket
                        printingService.PrintKitchenTicket(order, "In lại bởi quản lý");
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
}
