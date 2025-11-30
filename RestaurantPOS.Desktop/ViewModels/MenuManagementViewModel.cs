using System.Collections.ObjectModel;
using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop.ViewModels;

public partial class MenuManagementViewModel : ObservableObject
{
    private readonly ICategoryService _categoryService;
    private readonly IProductService _productService;
    private readonly IToastService _toastService;

    [ObservableProperty]
    private ObservableCollection<CategoryDto> _categories = new();

    [ObservableProperty]
    private ObservableCollection<CategoryDto> _filterCategories = new();

    [ObservableProperty]
    private ObservableCollection<ProductDto> _products = new();

    [ObservableProperty]
    private CategoryDto? _selectedCategory;

    [ObservableProperty]
    private ProductDto? _selectedProduct;

    [ObservableProperty]
    private bool _isLoading;

    public MenuManagementViewModel(
        ICategoryService categoryService, 
        IProductService productService,
        IToastService toastService)
    {
        _categoryService = categoryService;
        _productService = productService;
        _toastService = toastService;

        LoadCategoriesCommand.Execute(null);
    }

    [ObservableProperty]
    private string _searchText = string.Empty;

    private List<ProductDto> _allProductsInCategory = new();

    async partial void OnSelectedCategoryChanged(CategoryDto? value)
    {
        if (value != null)
        {
            await LoadProducts(value.Id);
        }
        else
        {
            Products.Clear();
            _allProductsInCategory.Clear();
        }
    }

    partial void OnSearchTextChanged(string value)
    {
        FilterProducts();
    }

    [RelayCommand]
    private void ClearSearch()
    {
        SearchText = string.Empty;
    }

    private void FilterProducts()
    {
        if (string.IsNullOrWhiteSpace(SearchText))
        {
            Products = new ObservableCollection<ProductDto>(_allProductsInCategory);
        }
        else
        {
            var filtered = _allProductsInCategory
                .Where(p => p.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase) || 
                            p.Description.Contains(SearchText, StringComparison.OrdinalIgnoreCase))
                .ToList();
            Products = new ObservableCollection<ProductDto>(filtered);
        }
    }

    [RelayCommand]
    private async Task LoadCategories()
    {
        IsLoading = true;
        try
        {
            var categories = await _categoryService.GetCategoriesAsync();
            Categories = new ObservableCollection<CategoryDto>(categories);
            
            // Create Filter Categories with "All" option
            var allCategory = new CategoryDto { Id = 0, Name = "Tất cả" };
            var filterList = new List<CategoryDto> { allCategory };
            filterList.AddRange(categories);
            FilterCategories = new ObservableCollection<CategoryDto>(filterList);

            // Select "All" by default if no selection
            if (SelectedCategory == null)
            {
                SelectedCategory = allCategory;
            }
        }
        catch (Exception ex)
        {
            _toastService.ShowError($"Lỗi tải danh mục: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task LoadProducts(int categoryId)
    {
        IsLoading = true;
        try
        {
            List<ProductDto> products;
            if (categoryId == 0)
            {
                products = await _productService.GetProductsAsync();
            }
            else
            {
                products = await _productService.GetProductsByCategoryAsync(categoryId);
            }
            
            _allProductsInCategory = products;
            FilterProducts(); // Apply filter if search text exists
        }
        catch (Exception ex)
        {
            _toastService.ShowError($"Lỗi tải món ăn: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    [ObservableProperty]
    private bool _isRightPanelOpen;

    [ObservableProperty]
    private string _rightPanelTitle = string.Empty;

    [ObservableProperty]
    private bool _isEditingCategoryMode;

    [ObservableProperty]
    private CategoryDto _editableCategory = new();

    [ObservableProperty]
    private ProductDto _editableProduct = new();

    private bool _isCreatingNew;

    [RelayCommand]
    private void CloseRightPanel()
    {
        IsRightPanelOpen = false;
    }

    [RelayCommand]
    private void AddCategory()
    {
        IsRightPanelOpen = true;
        IsEditingCategoryMode = true;
        RightPanelTitle = "Thêm nhóm hàng";
        EditableCategory = new CategoryDto();
        _isCreatingNew = true;
    }

    [RelayCommand]
    private void EditCategory(CategoryDto? category)
    {
        if (category == null) return;
        IsRightPanelOpen = true;
        IsEditingCategoryMode = true;
        RightPanelTitle = "Sửa nhóm hàng";
        EditableCategory = new CategoryDto 
        { 
            Id = category.Id, 
            Name = category.Name, 
            Description = category.Description, 
            DisplayOrder = category.DisplayOrder 
        };
        _isCreatingNew = false;
    }

    [RelayCommand]
    private async Task DeleteCategory(CategoryDto? category)
    {
        if (category == null) return;

        var result = MessageBox.Show(
            $"Bạn có chắc muốn xóa danh mục '{category.Name}'?\nTất cả món ăn trong danh mục này cũng sẽ bị xóa!",
            "Xác nhận xóa",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning);

        if (result == MessageBoxResult.Yes)
        {
            IsLoading = true;
            try
            {
                var success = await _categoryService.DeleteCategoryAsync(category.Id);
                if (success)
                {
                    _toastService.ShowSuccess($"Đã xóa danh mục '{category.Name}'");
                    await LoadCategories();
                    SelectedCategory = Categories.FirstOrDefault();
                    if (IsRightPanelOpen && IsEditingCategoryMode && EditableCategory.Id == category.Id)
                    {
                        IsRightPanelOpen = false;
                    }
                }
                else
                {
                    _toastService.ShowError("Không thể xóa danh mục");
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
    private void AddProduct()
    {
        if (SelectedCategory == null)
        {
            _toastService.ShowWarning("Vui lòng chọn danh mục trước khi thêm món");
            return;
        }

        IsRightPanelOpen = true;
        IsEditingCategoryMode = false;
        RightPanelTitle = "Thêm hàng hóa";
        EditableProduct = new ProductDto
        {
            CategoryId = SelectedCategory.Id,
            IsAvailable = true
        };
        _isCreatingNew = true;
    }

    [RelayCommand]
    private void EditProduct(ProductDto? product)
    {
        if (product == null) return;
        IsRightPanelOpen = true;
        IsEditingCategoryMode = false;
        RightPanelTitle = "Sửa hàng hóa";
        EditableProduct = new ProductDto
        {
            Id = product.Id,
            CategoryId = product.CategoryId,
            Name = product.Name,
            Price = product.Price,
            Description = product.Description,
            ImageUrl = product.ImageUrl,
            IsAvailable = product.IsAvailable
        };
        _isCreatingNew = false;
    }

    [RelayCommand]
    private async Task SavePanel()
    {
        if (IsEditingCategoryMode)
        {
            if (string.IsNullOrWhiteSpace(EditableCategory.Name))
            {
                _toastService.ShowWarning("Tên nhóm hàng không được để trống");
                return;
            }

            IsLoading = true;
            try
            {
                if (_isCreatingNew)
                {
                    var result = await _categoryService.CreateCategoryAsync(EditableCategory);
                    if (result != null)
                    {
                        _toastService.ShowSuccess($"Đã thêm nhóm '{result.Name}'");
                        await LoadCategories();
                        SelectedCategory = Categories.FirstOrDefault(c => c.Id == result.Id);
                        IsRightPanelOpen = false;
                    }
                }
                else
                {
                    var success = await _categoryService.UpdateCategoryAsync(EditableCategory);
                    if (success)
                    {
                        _toastService.ShowSuccess($"Đã cập nhật nhóm '{EditableCategory.Name}'");
                        await LoadCategories();
                        SelectedCategory = Categories.FirstOrDefault(c => c.Id == EditableCategory.Id);
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
        else // Product Mode
        {
            if (string.IsNullOrWhiteSpace(EditableProduct.Name))
            {
                _toastService.ShowWarning("Tên hàng hóa không được để trống");
                return;
            }
            if (EditableProduct.Price < 0)
            {
                _toastService.ShowWarning("Giá bán không hợp lệ");
                return;
            }

            IsLoading = true;
            try
            {
                if (_isCreatingNew)
                {
                    var result = await _productService.CreateProductAsync(EditableProduct);
                    if (result != null)
                    {
                        _toastService.ShowSuccess($"Đã thêm món '{result.Name}'");
                        if (SelectedCategory != null && SelectedCategory.Id == result.CategoryId)
                        {
                            await LoadProducts(SelectedCategory.Id);
                        }
                        else
                        {
                            SelectedCategory = Categories.FirstOrDefault(c => c.Id == result.CategoryId);
                        }
                        IsRightPanelOpen = false;
                    }
                }
                else
                {
                    var success = await _productService.UpdateProductAsync(EditableProduct);
                    if (success)
                    {
                        _toastService.ShowSuccess($"Đã cập nhật món '{EditableProduct.Name}'");
                        if (SelectedCategory != null)
                        {
                            // Reload current category to refresh the list
                            await LoadProducts(SelectedCategory.Id);
                        }
                        
                        // Reset state
                        IsRightPanelOpen = false;
                        EditableProduct = new ProductDto();
                        SelectedProduct = null;
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

    [RelayCommand]
    private async Task DeleteProduct(ProductDto? product)
    {
        if (product == null) return;

        var result = MessageBox.Show(
            $"Bạn có chắc muốn xóa món '{product.Name}'?",
            "Xác nhận xóa",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning);

        if (result == MessageBoxResult.Yes)
        {
            IsLoading = true;
            try
            {
                var success = await _productService.DeleteProductAsync(product.Id);
                if (success)
                {
                    _toastService.ShowSuccess($"Đã xóa món '{product.Name}'");
                    if (SelectedCategory != null)
                    {
                        await LoadProducts(SelectedCategory.Id);
                    }
                    if (IsRightPanelOpen && !IsEditingCategoryMode && EditableProduct.Id == product.Id)
                    {
                        IsRightPanelOpen = false;
                    }
                }
                else
                {
                    _toastService.ShowError("Không thể xóa món ăn");
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
