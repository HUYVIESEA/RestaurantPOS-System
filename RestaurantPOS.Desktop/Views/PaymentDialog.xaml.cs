using System.Text.RegularExpressions;
using System.Globalization;
using System.Windows;
using System.Windows.Input;

namespace RestaurantPOS.Desktop.Views
{
    public partial class PaymentDialog : Window
    {
        private decimal _totalAmount;
        private decimal _receivedAmount;

        public string PaymentMethod { get; private set; } = "Cash";
        public decimal ReceivedAmount { get; private set; }
        public decimal ChangeAmount { get; private set; }

        public PaymentDialog(string tableName, decimal totalAmount)
        {
            System.Diagnostics.Debug.WriteLine($"PaymentDialog: Constructor called with table={tableName}, total={totalAmount}");
            
            try
            {
                System.Diagnostics.Debug.WriteLine("PaymentDialog: Calling InitializeComponent...");
                InitializeComponent();
                System.Diagnostics.Debug.WriteLine("PaymentDialog: InitializeComponent completed");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentDialog: InitializeComponent FAILED: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"PaymentDialog: Stack trace: {ex.StackTrace}");
                throw new InvalidOperationException($"Lỗi khởi tạo PaymentDialog: {ex.Message}", ex);
            }
            
            _totalAmount = totalAmount;
            
            System.Diagnostics.Debug.WriteLine("PaymentDialog: Setting UI elements...");
            
            if (TableNameText != null)
            {
                TableNameText.Text = tableName ?? "Unknown";
                System.Diagnostics.Debug.WriteLine($"PaymentDialog: TableNameText set to '{tableName}'");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("PaymentDialog: WARNING - TableNameText is NULL");
            }
            
            if (TotalAmountText != null)
            {
                TotalAmountText.Text = $"{totalAmount:N0} đ";
                System.Diagnostics.Debug.WriteLine($"PaymentDialog: TotalAmountText set to '{totalAmount:N0} đ'");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("PaymentDialog: WARNING - TotalAmountText is NULL");
            }
            
            // Set default received amount to total (exact)
            if (ReceivedAmountTextBox != null)
            {
                ReceivedAmountTextBox.Text = totalAmount.ToString("N0");
                CalculateChange();
                System.Diagnostics.Debug.WriteLine($"PaymentDialog: ReceivedAmountTextBox set to '{totalAmount:N0}'");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("PaymentDialog: WARNING - ReceivedAmountTextBox is NULL");
            }
            
            System.Diagnostics.Debug.WriteLine("PaymentDialog: Constructor completed successfully");
        }

        private void PaymentMethod_Changed(object sender, RoutedEventArgs e)
        {
            if (CashRadio.IsChecked == true)
            {
                PaymentMethod = "Cash";
                CashPaymentPanel.Visibility = Visibility.Visible;
                ComingSoonText.Visibility = Visibility.Collapsed;
                ConfirmButton.Content = "💵 Xác Nhận Thanh Toán";
                ConfirmButton.IsEnabled = true;
            }
            else if (OtherRadio.IsChecked == true)
            {
                PaymentMethod = "Other";
                CashPaymentPanel.Visibility = Visibility.Collapsed;
                ComingSoonText.Visibility = Visibility.Visible;
                ConfirmButton.Content = "🚧 Coming Soon";
                ConfirmButton.IsEnabled = false;
            }
        }

        private void ReceivedAmount_TextChanged(object sender, System.Windows.Controls.TextChangedEventArgs e)
        {
            CalculateChange();
        }

        private void NumberOnly_PreviewTextInput(object sender, TextCompositionEventArgs e)
        {
            // Only allow numbers and commas
            Regex regex = new Regex("[^0-9,]+");
            e.Handled = regex.IsMatch(e.Text);
        }

        private void CalculateChange()
        {
            if (ReceivedAmountTextBox == null || ChangeAmountText == null)
                return;
                
            var sanitized = SanitizeToNumber(ReceivedAmountTextBox.Text);
            if (decimal.TryParse(sanitized, NumberStyles.Integer, CultureInfo.InvariantCulture, out decimal received))
            {
                _receivedAmount = received;
                var change = received - _totalAmount;
                ChangeAmount = change;
                
                ChangeAmountText.Text = $"{change:N0} đ";
                ChangeAmountText.Foreground = change >= 0 
                    ? new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(76, 175, 80))
                    : new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromRgb(244, 67, 54));
            }
        }

        private static string SanitizeToNumber(string? input)
        {
            if (string.IsNullOrWhiteSpace(input)) return "0";
            // keep digits only
            var digits = Regex.Replace(input, "[^0-9]", "");
            return string.IsNullOrEmpty(digits) ? "0" : digits;
        }

        private void QuickAmount_Click(object sender, RoutedEventArgs e)
        {
            if (sender is System.Windows.Controls.Button button && ReceivedAmountTextBox != null)
            {
                var amountText = SanitizeToNumber(button.Content.ToString());
                if (decimal.TryParse(amountText, NumberStyles.Integer, CultureInfo.InvariantCulture, out decimal amount))
                {
                    ReceivedAmountTextBox.Text = amount.ToString("N0", new CultureInfo("vi-VN"));
                }
            }
        }

        private void ExactAmount_Click(object sender, RoutedEventArgs e)
        {
            if (ReceivedAmountTextBox != null)
            {
                ReceivedAmountTextBox.Text = _totalAmount.ToString("N0", new CultureInfo("vi-VN"));
            }
        }

        private void Confirm_Click(object sender, RoutedEventArgs e)
        {
            if (PaymentMethod == "Cash")
            {
                if (_receivedAmount < _totalAmount)
                {
                    MessageBox.Show("Số tiền nhận không đủ!", "Cảnh báo", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }
                
                ReceivedAmount = _receivedAmount;
                DialogResult = true;
            }
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
        }
    }
}
