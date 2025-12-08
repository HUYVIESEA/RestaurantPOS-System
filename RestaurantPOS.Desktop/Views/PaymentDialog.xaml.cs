using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using RestaurantPOS.Desktop.ViewModels;

namespace RestaurantPOS.Desktop.Views
{
    public partial class PaymentDialog : UserControl
    {
        public PaymentDialog()
        {
            InitializeComponent();
        }

        private void NumberValidationTextBox(object sender, TextCompositionEventArgs e)
        {
            System.Text.RegularExpressions.Regex regex = new System.Text.RegularExpressions.Regex("[^0-9]+");
            e.Handled = regex.IsMatch(e.Text);
        }

        private void ExactAmount_Click(object sender, RoutedEventArgs e)
        {
            if (DataContext is PaymentViewModel vm)
            {
                vm.ReceivedAmount = vm.FinalAmount;
            }
        }

        private void Suggestion_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button btn && btn.Tag is string amountStr && decimal.TryParse(amountStr, out decimal amount))
            {
                if (DataContext is PaymentViewModel vm)
                {
                    vm.ReceivedAmount = amount;
                }
            }
        }
    }
}
