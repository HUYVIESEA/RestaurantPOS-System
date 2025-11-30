using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Views
{
    public partial class CategoryFormDialog : Window
    {
        public string CategoryName => txtCategoryName.Text;
        public string Description => txtDescription.Text;
        public int DisplayOrder => int.TryParse(txtDisplayOrder.Text, out int val) ? val : 0;

        public CategoryFormDialog(CategoryDto? category = null)
        {
            InitializeComponent();
            
            if (category != null)
            {
                txtCategoryName.Text = category.Name;
                txtDescription.Text = category.Description;
                txtDisplayOrder.Text = category.DisplayOrder.ToString();
            }
        }

        private void SaveButton_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(CategoryName))
            {
                MessageBox.Show("Vui lòng nhập tên danh mục", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Warning);
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
