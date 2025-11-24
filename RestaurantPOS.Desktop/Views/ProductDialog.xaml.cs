using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;

namespace RestaurantPOS.Desktop.Views
{
    public partial class ProductDialog : Window
    {
        private readonly ApiService _apiService;
        private readonly Product? _existingProduct;
        private List<Category> _categories = new();

        public Product? Result { get; private set; }

        // Constructor for Add
        public ProductDialog(ApiService apiService)
        {
            InitializeComponent();
            _apiService = apiService;
            DialogTitle.Text = "Thêm thực đơn mới";
            _ = LoadCategoriesAsync();
        }

        // Constructor for Edit
        public ProductDialog(ApiService apiService, Product product)
        {
            InitializeComponent();
            _apiService = apiService;
            _existingProduct = product;
            DialogTitle.Text = "Sửa thực đơn";
            _ = LoadCategoriesAsync();
            LoadProductData();
        }

        private async System.Threading.Tasks.Task LoadCategoriesAsync()
        {
            try
            {
                _categories = await _apiService.GetCategoriesAsync();
                CategoryComboBox.ItemsSource = _categories;

                if (_existingProduct != null && _existingProduct.CategoryId > 0)
                {
                    CategoryComboBox.SelectedValue = _existingProduct.CategoryId;
                }
                else if (_categories.Any())
                {
                    CategoryComboBox.SelectedIndex = 0;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Lỗi tải danh mục: {ex.Message}", "Lỗi",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void LoadProductData()
        {
            if (_existingProduct == null) return;

            NameTextBox.Text = _existingProduct.Name;
            DescriptionTextBox.Text = _existingProduct.Description;
            PriceTextBox.Text = _existingProduct.Price.ToString("0");
            ImageUrlTextBox.Text = _existingProduct.ImageUrl;
            IsAvailableCheckBox.IsChecked = _existingProduct.IsAvailable;
        }

        private void SaveButton_Click(object sender, RoutedEventArgs e)
        {
            if (!ValidateForm())
                return;

            try
            {
                var product = _existingProduct ?? new Product();

                product.Name = NameTextBox.Text.Trim();
                product.Description = DescriptionTextBox.Text.Trim();
                product.Price = decimal.Parse(PriceTextBox.Text.Trim());
                product.CategoryId = (int)CategoryComboBox.SelectedValue;
                product.ImageUrl = string.IsNullOrWhiteSpace(ImageUrlTextBox.Text) 
                    ? null 
                    : ImageUrlTextBox.Text.Trim();
                product.IsAvailable = IsAvailableCheckBox.IsChecked ?? true;

                // Set category for display
                product.Category = _categories.FirstOrDefault(c => c.Id == product.CategoryId);

                Result = product;
                DialogResult = true;
                Close();
            }
            catch (Exception ex)
            {
                ShowValidationMessage($"Lỗi: {ex.Message}");
            }
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private bool ValidateForm()
        {
            // Name validation
            if (string.IsNullOrWhiteSpace(NameTextBox.Text))
            {
                ShowValidationMessage("Vui lòng nhập tên thực đơn");
                NameTextBox.Focus();
                return false;
            }

            // Price validation
            if (string.IsNullOrWhiteSpace(PriceTextBox.Text))
            {
                ShowValidationMessage("Vui lòng nhập giá thực đơn");
                PriceTextBox.Focus();
                return false;
            }

            if (!decimal.TryParse(PriceTextBox.Text, out decimal price) || price <= 0)
            {
                ShowValidationMessage("Giá thực đơn phải là số dương");
                PriceTextBox.Focus();
                return false;
            }

            // Category validation
            if (CategoryComboBox.SelectedValue == null)
            {
                ShowValidationMessage("Vui lòng chọn danh mục");
                CategoryComboBox.Focus();
                return false;
            }

            HideValidationMessage();
            return true;
        }

        private void ShowValidationMessage(string message)
        {
            ValidationMessage.Text = message;
            ValidationMessage.Visibility = Visibility.Visible;
        }

        private void HideValidationMessage()
        {
            ValidationMessage.Visibility = Visibility.Collapsed;
        }

        private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
        {
            Regex regex = new Regex("[^0-9]+");
            e.Handled = regex.IsMatch(e.Text);
        }
    }
}
