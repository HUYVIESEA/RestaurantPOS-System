using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Views;
using RestaurantPOS.Shared.Models;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;

namespace RestaurantPOS.Desktop.ViewModels
{
    public partial class ProductsViewModel : ObservableObject
    {
        private readonly ApiService _apiService;

        [ObservableProperty]
        private ObservableCollection<Product> products = new();

        [ObservableProperty]
        private ObservableCollection<Product> filteredProducts = new();

        [ObservableProperty]
        private string searchText = string.Empty;

        [ObservableProperty]
        private string selectedCategory = "Tất cả";

        [ObservableProperty]
        private bool isLoading = false;

        [ObservableProperty]
        private ObservableCollection<string> categories = new() { "Tất cả" };

        public ProductsViewModel(ApiService apiService)
        {
            _apiService = apiService;
            _ = LoadProductsAsync();
            _ = LoadCategoriesAsync();
        }

        [RelayCommand]
        private async Task LoadProductsAsync()
        {
            IsLoading = true;

            try
            {
                var productsList = await _apiService.GetProductsAsync();
                
                Products.Clear();
                foreach (var product in productsList)
                {
                    Products.Add(product);
                }

                ApplyFilters();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải thực đơn: {ex.Message}", "Lỗi",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }

        private async Task LoadCategoriesAsync()
        {
            try
            {
                var categoriesList = await _apiService.GetCategoriesAsync();
                
                Categories.Clear();
                Categories.Add("Tất cả");
                
                foreach (var category in categoriesList)
                {
                    Categories.Add(category.Name);
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Error loading categories: {ex.Message}");
            }
        }

        [RelayCommand]
        private void AddProduct()
        {
            var dialog = new ProductDialog(_apiService);
            if (dialog.ShowDialog() == true && dialog.Result != null)
            {
                _ = SaveNewProductAsync(dialog.Result);
            }
        }

        private async Task SaveNewProductAsync(Product product)
        {
            IsLoading = true;

            try
            {
                var created = await _apiService.CreateProductAsync(product);
                Products.Add(created);
                ApplyFilters();
                
                MessageBox.Show($"Đã thêm thực đơn '{created.Name}'", "Thành công",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi thêm thực đơn: {ex.Message}", "Lỗi",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }

        [RelayCommand]
        private void EditProduct(int productId)
        {
            var product = Products.FirstOrDefault(p => p.Id == productId);
            if (product == null) return;

            var dialog = new ProductDialog(_apiService, product);
            if (dialog.ShowDialog() == true && dialog.Result != null)
            {
                _ = SaveEditedProductAsync(dialog.Result);
            }
        }

        private async Task SaveEditedProductAsync(Product product)
        {
            IsLoading = true;

            try
            {
                var updated = await _apiService.UpdateProductAsync(product);
                
                // Update in collection
                var index = Products.IndexOf(Products.FirstOrDefault(p => p.Id == updated.Id));
                if (index >= 0)
                {
                    Products[index] = updated;
                }
                
                ApplyFilters();
                
                MessageBox.Show($"Đã cập nhật thực đơn '{updated.Name}'", "Thành công",
                    MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi cập nhật thực đơn: {ex.Message}", "Lỗi",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
            finally
            {
                IsLoading = false;
            }
        }

        [RelayCommand]
        private async Task DeleteProductAsync(int productId)
        {
            var product = Products.FirstOrDefault(p => p.Id == productId);
            if (product == null) return;

            var result = MessageBox.Show(
                $"Xóa thực đơn '{product.Name}'?\n\nThao tác này không thể hoàn tác.",
                "Xác nhận xóa",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning);

            if (result == MessageBoxResult.Yes)
            {
                IsLoading = true;

                try
                {
                    await _apiService.DeleteProductAsync(productId);
                    Products.Remove(product);
                    ApplyFilters();
                    
                    MessageBox.Show($"Đã xóa thực đơn '{product.Name}'", "Thành công",
                        MessageBoxButton.OK, MessageBoxImage.Information);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Lỗi xóa thực đơn: {ex.Message}", "Lỗi",
                        MessageBoxButton.OK, MessageBoxImage.Error);
                }
                finally
                {
                    IsLoading = false;
                }
            }
        }

        [RelayCommand]
        private async Task ToggleAvailabilityAsync(int productId)
        {
            var product = Products.FirstOrDefault(p => p.Id == productId);
            if (product == null) return;

            product.IsAvailable = !product.IsAvailable;
            
            try
            {
                await _apiService.UpdateProductAsync(product);
                ApplyFilters();
                
                MessageBox.Show(
                    $"Đã {(product.IsAvailable ? "bật" : "tắt")} thực đơn '{product.Name}'",
                    "Cập nhật",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                // Revert on error
                product.IsAvailable = !product.IsAvailable;
                MessageBox.Show($"Lỗi cập nhật: {ex.Message}", "Lỗi",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        partial void OnSearchTextChanged(string value)
        {
            ApplyFilters();
        }

        partial void OnSelectedCategoryChanged(string value)
        {
            ApplyFilters();
        }

        private void ApplyFilters()
        {
            var filtered = Products.AsEnumerable();

            if (SelectedCategory != "Tất cả")
            {
                filtered = filtered.Where(p => p.Category?.Name == SelectedCategory);
            }

            if (!string.IsNullOrWhiteSpace(SearchText))
            {
                filtered = filtered.Where(p =>
                    p.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
            }

            FilteredProducts = new ObservableCollection<Product>(filtered);
        }
    }
}
