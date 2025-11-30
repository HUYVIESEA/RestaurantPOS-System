using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Views
{
    public partial class ProductFormDialog : Window
    {
        public int CategoryId => (int)(cboCategory.SelectedValue ?? 0);
        public string ProductName => txtProductName.Text;
        public decimal Price => decimal.TryParse(txtPrice.Text, out decimal val) ? val : 0;
        public string Description => txtDescription.Text;
        public string ImageUrl => txtImageUrl.Text;
        public bool IsAvailable => chkIsAvailable.IsChecked ?? false;

        public ProductFormDialog(List<CategoryDto> categories, ProductDto? product = null)
        {
            InitializeComponent();
            
            cboCategory.ItemsSource = categories;

            if (product != null)
            {
                cboCategory.SelectedValue = product.CategoryId;
                txtProductName.Text = product.Name;
                txtPrice.Text = product.Price.ToString("F0");
                txtDescription.Text = product.Description;
                txtImageUrl.Text = product.ImageUrl;
                chkIsAvailable.IsChecked = product.IsAvailable;
            }
            else if (categories.Any())
            {
                cboCategory.SelectedIndex = 0;
            }
        }

        private void SaveButton_Click(object sender, RoutedEventArgs e)
        {
            if (cboCategory.SelectedValue == null)
            {
                MessageBox.Show("Vui lòng chọn danh mục", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (string.IsNullOrWhiteSpace(ProductName))
            {
                MessageBox.Show("Vui lòng nhập tên món ăn", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (string.IsNullOrWhiteSpace(txtPrice.Text))
            {
                MessageBox.Show("Vui lòng nhập giá bán", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            DialogResult = true;
            Close();
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
        {
            Regex regex = new Regex("[^0-9]+");
            e.Handled = regex.IsMatch(e.Text);
        }
    }
}
