using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using System.Windows;

namespace RestaurantPOS.Desktop.ViewModels;

public partial class CreateOrderViewModel : ObservableObject, INavigationAware
{
    private readonly IOrderService _orderService;
    private readonly IProductService _productService;
    private readonly ITableService _tableService;
    private readonly IToastService _toastService;

    [ObservableProperty]
    private ObservableCollection<CategoryDto> categories = new();

    [ObservableProperty]
    private ObservableCollection<ProductDto> products = new();

    [ObservableProperty]
    private ObservableCollection<TableDto> tables = new();

    [ObservableProperty]
    private ObservableCollection<CartItem> cartItems = new();

    [ObservableProperty]
    private CategoryDto? selectedCategory;

    [ObservableProperty]
    private TableDto? selectedTable;

    [ObservableProperty]
    private bool isLoading = false;

    [ObservableProperty]
    private decimal totalAmount = 0;

    [ObservableProperty]
    private int? existingOrderId = null;

    [ObservableProperty]
    private bool isAddingToExistingOrder = false;

    public CreateOrderViewModel(
        IOrderService orderService, 
        IProductService productService,
        ITableService tableService,
        IToastService toastService)
    {
        _orderService = orderService;
        _productService = productService;
        _tableService = tableService;
        _toastService = toastService;
    }

    public void OnNavigatedTo(object? parameter)
    {
        // Reset state
        ExistingOrderId = null;
        IsAddingToExistingOrder = false;
        CartItems.Clear();
        CalculateTotal();

        if (parameter is TableDto table)
        {
            SelectedTable = table;
            System.Diagnostics.Debug.WriteLine($"CreateOrderViewModel: Pre-selected table {table.Name}");
        }
        else if (parameter is AddToOrderParameter addParam)
        {
            SelectedTable = addParam.Table;
            ExistingOrderId = addParam.OrderId;
            IsAddingToExistingOrder = true;
            System.Diagnostics.Debug.WriteLine($"CreateOrderViewModel: Adding to existing order {ExistingOrderId} on table {SelectedTable?.Name}");
        }
    }

    [RelayCommand]
    private async Task Initialize()
    {
        IsLoading = true;
        try
        {
            // Load Categories
            var cats = await _productService.GetCategoriesAsync();
            Categories.Clear();
            foreach (var c in cats) Categories.Add(c);
            
            // Load Tables (Available only)
            var tbls = await _tableService.GetTablesAsync();
            Tables.Clear();
            foreach (var t in tbls.Where(t => t.Status == "Available")) Tables.Add(t);

            // If we have a pre-selected table, ensure it's in the list or add it
            if (SelectedTable != null)
            {
                var existing = Tables.FirstOrDefault(t => t.Id == SelectedTable.Id);
                if (existing != null)
                {
                    SelectedTable = existing;
                }
                else
                {
                    Tables.Add(SelectedTable);
                }
            }

            // Load All Products initially
            await LoadProducts();
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task LoadProducts()
    {
        IsLoading = true;
        try
        {
            List<ProductDto> prods;
            if (SelectedCategory != null)
            {
                prods = await _productService.GetProductsByCategoryAsync(SelectedCategory.Id);
            }
            else
            {
                prods = await _productService.GetProductsAsync();
            }

            Products.Clear();
            foreach (var p in prods) Products.Add(p);
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void AddToCart(ProductDto product)
    {
        var existingItem = CartItems.FirstOrDefault(i => i.ProductId == product.Id);
        if (existingItem != null)
        {
            existingItem.Quantity++;
            existingItem.UpdateSubtotal();
        }
        else
        {
            CartItems.Add(new CartItem 
            { 
                ProductId = product.Id,
                ProductName = product.Name,
                UnitPrice = product.Price,
                Quantity = 1
            });
        }
        CalculateTotal();
    }

    [RelayCommand]
    private void RemoveFromCart(CartItem item)
    {
        CartItems.Remove(item);
        CalculateTotal();
    }

    [RelayCommand]
    private void IncreaseQuantity(CartItem item)
    {
        item.Quantity++;
        item.UpdateSubtotal();
        CalculateTotal();
    }

    [RelayCommand]
    private void DecreaseQuantity(CartItem item)
    {
        if (item.Quantity > 1)
        {
            item.Quantity--;
            item.UpdateSubtotal();
            CalculateTotal();
        }
        else
        {
            RemoveFromCart(item);
        }
    }

    private void CalculateTotal()
    {
        TotalAmount = CartItems.Sum(i => i.Subtotal);
    }

    [RelayCommand]
    private async Task SubmitOrder()
    {
        if (SelectedTable == null)
        {
            _toastService.ShowWarning("Vui lòng chọn bàn");
            return;
        }

        if (CartItems.Count == 0)
        {
            _toastService.ShowWarning("Giỏ hàng trống");
            return;
        }

        IsLoading = true;
        try
        {
            var items = CartItems.Select(i => new CreateOrderItemRequest
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                Notes = i.Notes
            }).ToList();

            OrderDto? result = null;

            if (IsAddingToExistingOrder && ExistingOrderId.HasValue)
            {
                // Thêm món vào đơn hiện có
                System.Diagnostics.Debug.WriteLine($"Adding {items.Count} items to order {ExistingOrderId.Value}");
                result = await _orderService.AddItemsToOrderAsync(ExistingOrderId.Value, items);
                
                if (result != null)
                {
                    _toastService.ShowSuccess("Đã thêm món vào đơn hàng thành công!");
                }
            }
            else
            {
                // Tạo đơn hàng mới
                var request = new CreateOrderRequest
                {
                    TableId = SelectedTable.Id,
                    Items = items
                };

                result = await _orderService.CreateOrderAsync(request);
                
                if (result != null)
                {
                    _toastService.ShowSuccess($"Đã tạo đơn hàng {result.OrderNumber} thành công!");
                }
            }

            if (result != null)
            {
                // Success! Clear form and navigate back
                CartItems.Clear();
                SelectedTable = null;
                ExistingOrderId = null;
                IsAddingToExistingOrder = false;
                CalculateTotal();
                
                // Navigate back to Table Management
                WeakReferenceMessenger.Default.Send(new Messages.NavigateToMessage("TableManagement"));
            }
            else
            {
                _toastService.ShowError("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        WeakReferenceMessenger.Default.Send(new Messages.NavigateToMessage("Dashboard"));
    }

    [RelayCommand]
    private void NavigateToDashboard()
    {
        WeakReferenceMessenger.Default.Send(new Messages.NavigateToMessage("Dashboard"));
    }

    partial void OnSelectedCategoryChanged(CategoryDto? value)
    {
        _ = LoadProducts();
    }
}

public partial class CartItem : ObservableObject
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    
    [ObservableProperty]
    private int quantity;

    [ObservableProperty]
    private string notes = string.Empty;

    [ObservableProperty]
    private decimal subtotal;

    public void UpdateSubtotal()
    {
        Subtotal = Quantity * UnitPrice;
    }

    partial void OnQuantityChanged(int value)
    {
        UpdateSubtotal();
    }
}

public class AddToOrderParameter
{
    public TableDto Table { get; set; } = null!;
    public int OrderId { get; set; }
}
