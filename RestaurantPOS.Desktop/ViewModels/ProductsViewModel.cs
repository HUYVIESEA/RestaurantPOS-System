using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Data;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Utilities;
using RestaurantPOS.Desktop.Views;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class ProductsViewModel : INotifyPropertyChanged
    {
        private readonly ProductService _productService;
        private ObservableCollection<Product> _products;
        private ICollectionView _productsView; // Use ICollectionView for filtering
        private ObservableCollection<Category> _categories;
        private Category? _selectedCategory;
        private string _searchQuery;
        private bool _isLoading;
        private int _currentPage = 1;
        private int _pageSize = 15;
        private int _totalPages;
        private bool _canGoNext;
        private bool _canGoPrevious;

        public ProductsViewModel()
        {
            _productService = new ProductService();
            Products = new ObservableCollection<Product>();
            ProductsView = CollectionViewSource.GetDefaultView(Products);
            ProductsView.Filter = FilterProduct;
            Categories = new ObservableCollection<Category>();

            LoadProductsCommand = new RelayCommand(ExecuteLoadProducts);
            AddProductCommand = new RelayCommand(ExecuteAddProduct);
            EditProductCommand = new RelayCommand(ExecuteEditProduct);
            DeleteProductCommand = new RelayCommand(ExecuteDeleteProduct);
            
            ManageCategoriesCommand = new RelayCommand(ExecuteManageCategories);
            AddCategoryCommand = new RelayCommand(ExecuteAddCategory);
            EditCategoryCommand = new RelayCommand(ExecuteEditCategory);
            DeleteCategoryCommand = new RelayCommand(ExecuteDeleteCategory);
            
            NextPageCommand = new RelayCommand(ExecuteNextPage, _ => CanGoNext);
            PreviousPageCommand = new RelayCommand(ExecutePreviousPage, _ => CanGoPrevious);
            
            LoadData();
        }

        public ObservableCollection<Product> Products
        {
            get => _products;
            set { _products = value; OnPropertyChanged(); }
        }

        public ICollectionView ProductsView
        {
            get => _productsView;
            set { _productsView = value; OnPropertyChanged(); }
        }

        public ObservableCollection<Category> Categories
        {
            get => _categories;
            set { _categories = value; OnPropertyChanged(); }
        }

        public Category? SelectedCategory
        {
            get => _selectedCategory;
            set 
            {
                _selectedCategory = value; 
                OnPropertyChanged();
                UpdatePagination();
            }
        }

        public string SearchQuery
        {
            get => _searchQuery;
            set 
            {
                _searchQuery = value; 
                OnPropertyChanged();
                UpdatePagination();
            }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); }
        }

        public int CurrentPage
        {
            get => _currentPage;
            set { _currentPage = value; OnPropertyChanged(); }
        }

        public int TotalPages
        {
            get => _totalPages;
            set { _totalPages = value; OnPropertyChanged(); }
        }

        public bool CanGoNext
        {
            get => _canGoNext;
            set { _canGoNext = value; OnPropertyChanged(); }
        }

        public bool CanGoPrevious
        {
            get => _canGoPrevious;
            set { _canGoPrevious = value; OnPropertyChanged(); }
        }

        public ICommand LoadProductsCommand { get; }
        public ICommand AddProductCommand { get; }
        public ICommand EditProductCommand { get; }
        public ICommand DeleteProductCommand { get; }
        
        public ICommand ManageCategoriesCommand { get; }
        public ICommand AddCategoryCommand { get; }
        public ICommand EditCategoryCommand { get; }
        public ICommand DeleteCategoryCommand { get; }
        
        public ICommand NextPageCommand { get; }
        public ICommand PreviousPageCommand { get; }

        private async void LoadData()
        {
            IsLoading = true;
            await LoadProducts();
            IsLoading = false;
        }

        private async void ExecuteLoadProducts(object? parameter)
        {
            await LoadDataAsync();
        }

        private async Task LoadDataAsync()
        {
            IsLoading = true;
            await LoadProducts();
            IsLoading = false;
        }

        private async Task LoadProducts()
        {
            var productsTask = _productService.GetProductsAsync();
            var categoriesTask = _productService.GetCategoriesAsync();

            await Task.WhenAll(productsTask, categoriesTask);

            var products = productsTask.Result;
            var categories = categoriesTask.Result;

            Products = new ObservableCollection<Product>(products);
            
            categories.Insert(0, new Category { Id = 0, Name = "Tất cả" });
            Categories = new ObservableCollection<Category>(categories);
            
            // Only reset if null, otherwise try to keep selection
            if (SelectedCategory == null)
            {
               SelectedCategory = Categories.FirstOrDefault();
            }

            UpdatePagination();
        }

        private void UpdatePagination()
        {
            if (Products == null) return;

            // Calculate pagination based on filtered results
            var filtered = Products.Where(p => FilterProduct(p)).ToList();
            TotalPages = (int)Math.Ceiling((double)filtered.Count / _pageSize);
            if (TotalPages == 0) TotalPages = 1;
            
            if (CurrentPage > TotalPages) CurrentPage = TotalPages;
            if (CurrentPage < 1) CurrentPage = 1;

            CanGoNext = CurrentPage < TotalPages;
            CanGoPrevious = CurrentPage > 1;

            var paged = filtered.Skip((CurrentPage - 1) * _pageSize).Take(_pageSize).ToList();
            
            // Update the view with paged results
            // We can reuse ProductsView but point it to a new collection or just update ProductsView source?
            // Since we bound DataGrid to ProductsView, let's update ProductsView to be a view of the paged list.
            
            ProductsView = CollectionViewSource.GetDefaultView(new ObservableCollection<Product>(paged));
            OnPropertyChanged(nameof(ProductsView));
        }

        private void ExecuteNextPage(object? parameter)
        {
            if (CanGoNext)
            {
                CurrentPage++;
                UpdatePagination();
            }
        }

        private void ExecutePreviousPage(object? parameter)
        {
            if (CanGoPrevious)
            {
                CurrentPage--;
                UpdatePagination();
            }
        }

        private bool FilterProduct(object obj)
        {
            if (obj is Product p)
            {
                bool matchesSearch = string.IsNullOrWhiteSpace(SearchQuery) || 
                                     p.Name.ToLower().Contains(SearchQuery.ToLower()) || 
                                     p.Id.ToString().Contains(SearchQuery);
                                     
                bool matchesCategory = SelectedCategory == null || SelectedCategory.Id == 0 || p.CategoryId == SelectedCategory.Id;

                return matchesSearch && matchesCategory;
            }
            return false;
        }

        private async void ExecuteAddProduct(object? parameter)
        {
            var newProduct = new Product();
            var editCategories = new ObservableCollection<Category>(Categories.Where(c => c.Id != 0));
            var dialog = new ProductDialog
            {
                DataContext = new ProductDialogViewModel(newProduct, "Thêm sản phẩm mới", editCategories)
            };

            var result = await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "RootDialog");
            if ((result is bool confirmed && confirmed) || (result is string strConfirmed && bool.TryParse(strConfirmed, out var b) && b))
            {
                IsLoading = true;
                var success = await _productService.AddProductAsync(newProduct);
                IsLoading = false;

                if (success)
                {
                    MessageBox.Show("Thêm sản phẩm thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    await LoadDataAsync();
                }
                else
                {
                    MessageBox.Show("Lỗi khi thêm sản phẩm!", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private async void ExecuteEditProduct(object? parameter)
        {
            if (parameter is Product product)
            {
                // Clone product to avoid modifying the list directly before saving
                var clone = new Product
                {
                    Id = product.Id,
                    Name = product.Name,
                    Price = product.Price,
                    CategoryId = product.CategoryId,
                    Category = product.Category,
                    ImageUrl = product.ImageUrl,
                    Unit = product.Unit,
                    Description = product.Description
                };

                var editCategories = new ObservableCollection<Category>(Categories.Where(c => c.Id != 0));
                var dialog = new ProductDialog
                {
                    DataContext = new ProductDialogViewModel(clone, "Chỉnh sửa sản phẩm", editCategories)
                };

                var result = await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "RootDialog");
                // var result = await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "RootDialog");
                if ((result is bool confirmed && confirmed) || (result is string strConfirmed && bool.TryParse(strConfirmed, out var b) && b))
                {
                    IsLoading = true;
                    var success = await _productService.UpdateProductAsync(clone);
                    IsLoading = false;

                    if (success)
                    {
                        MessageBox.Show("Cập nhật sản phẩm thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                        await LoadDataAsync();
                    }
                    else
                    {
                        MessageBox.Show("Lỗi khi cập nhật sản phẩm!", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
        }

        private async void ExecuteDeleteProduct(object? parameter)
        {
            if (parameter is Product product)
            {
                if (MessageBox.Show($"Bạn có chắc chắn muốn xóa sản phẩm '{product.Name}'?", "Xác nhận xóa", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
                {
                    IsLoading = true;
                    var success = await _productService.DeleteProductAsync(product.Id);
                    IsLoading = false;

                    if (success)
                    {
                        MessageBox.Show("Đã xóa sản phẩm!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                        await LoadDataAsync();
                    }
                    else
                    {
                        MessageBox.Show("Lỗi khi xóa sản phẩm!", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
        }

        private async void ExecuteManageCategories(object? parameter)
        {
            var dialog = new CategoriesManagementDialog
            {
                DataContext = this // Use same VM to share commands and Categories list
            };
            await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "RootDialog");
        }

        private async void ExecuteAddCategory(object? parameter)
        {
            var newCategory = new Category();
            var dialog = new CategoryEditDialog
            {
                DataContext = new CategoryDialogViewModel(newCategory, "Thêm nhóm hàng mới")
            };

            var result = await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "CategoryDialogHost");
            if ((result is bool confirmed && confirmed) || (result is string strConfirmed && bool.TryParse(strConfirmed, out var b) && b))
            {
                IsLoading = true;
                var success = await _productService.AddCategoryAsync(newCategory);
                IsLoading = false;

                if (success)
                {
                    MessageBox.Show("Thêm nhóm hàng thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                    await LoadCategories();
                }
                else
                {
                    MessageBox.Show("Lỗi khi thêm nhóm hàng!", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }

        private async void ExecuteEditCategory(object? parameter)
        {
            if (parameter is Category category)
            {
                var clone = new Category
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description
                };

                var dialog = new CategoryEditDialog
                {
                    DataContext = new CategoryDialogViewModel(clone, "Chỉnh sửa nhóm hàng")
                };

                var result = await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "CategoryDialogHost");
                if ((result is bool confirmed && confirmed) || (result is string strConfirmed && bool.TryParse(strConfirmed, out var b) && b))
                {
                    IsLoading = true;
                    var success = await _productService.UpdateCategoryAsync(clone);
                    IsLoading = false;

                    if (success)
                    {
                        MessageBox.Show("Cập nhật nhóm hàng thành công!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                        await LoadCategories();
                    }
                    else
                    {
                        MessageBox.Show("Lỗi khi cập nhật nhóm hàng!", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
        }

        private async void ExecuteDeleteCategory(object? parameter)
        {
            if (parameter is Category category)
            {
                if (MessageBox.Show($"Bạn có chắc chắn muốn xóa nhóm hàng '{category.Name}'?", "Xác nhận xóa", MessageBoxButton.YesNo, MessageBoxImage.Warning) == MessageBoxResult.Yes)
                {
                    IsLoading = true;
                    var success = await _productService.DeleteCategoryAsync(category.Id);
                    IsLoading = false;

                    if (success)
                    {
                        MessageBox.Show("Đã xóa nhóm hàng!", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
                        await LoadCategories();
                    }
                    else
                    {
                        MessageBox.Show("Lỗi khi xóa nhóm hàng!", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
        }

        private async Task LoadCategories()
        {
            var categories = await _productService.GetCategoriesAsync();
            categories.Insert(0, new Category { Id = 0, Name = "Tất cả" });
            Categories = new ObservableCollection<Category>(categories);
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class ProductDialogViewModel
    {
        public Product Product { get; }
        public string Title { get; }
        
        // In a real app, you'd load categories from API
        public ObservableCollection<Category> Categories { get; }

        public ProductDialogViewModel(Product product, string title, ObservableCollection<Category> categories)
        {
            Product = product;
            Title = title;
            Categories = categories;
        }
    }
    public class CategoryDialogViewModel
    {
        public Category Category { get; }
        public string Title { get; }

        public CategoryDialogViewModel(Category category, string title)
        {
            Category = category;
            Title = title;
        }
    }
}
