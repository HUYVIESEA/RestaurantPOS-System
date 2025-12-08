using System.Windows;
using System.Windows.Controls;
using RestaurantPOS.Desktop.ViewModels;

namespace RestaurantPOS.Desktop.Views
{
    public partial class PaymentSettingsDialog : UserControl
    {
        public PaymentSettingsDialog()
        {
            InitializeComponent();
            DataContext = new PaymentSettingsViewModel();
        }

        private void PasswordBox_PasswordChanged(object sender, RoutedEventArgs e)
        {
            if (DataContext is PaymentSettingsViewModel vm)
            {
                vm.Password = PasswordBox.Password;
            }
        }
    }
}
