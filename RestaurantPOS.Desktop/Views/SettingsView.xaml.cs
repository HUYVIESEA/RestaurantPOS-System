using System.Windows;
using System.Windows.Controls;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop.Views
{
    public partial class SettingsView : UserControl
    {
        public SettingsView()
        {
            InitializeComponent();
        }

        private async void OpenPaymentSettings_Click(object sender, RoutedEventArgs e)
        {
            // Check if user has Admin or Manager role
            var userRole = UserSession.Instance.Role;
            if (userRole != "Admin" && userRole != "Manager")
            {
                MessageBox.Show(
                    "Bạn không có quyền truy cập chức năng này.\nVui lòng đăng nhập với tài khoản Admin hoặc Manager.",
                    "Không có quyền",
                    MessageBoxButton.OK,
                    MessageBoxImage.Warning);
                return;
            }

            // Open PaymentSettings dialog
            var dialog = new PaymentSettingsDialog();
            await MaterialDesignThemes.Wpf.DialogHost.Show(dialog, "RootDialog");
        }
    }
}
