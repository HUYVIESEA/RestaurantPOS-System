using System;
using System.Windows;

namespace RestaurantPOS.Desktop.Views;

public partial class PaymentWindow : Window
{
    public PaymentWindow()
    {
        try
        {
            InitializeComponent();
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Lỗi khởi tạo cửa sổ thanh toán: {ex.Message}\n\n{ex.InnerException?.Message}", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Error);
            this.Close();
        }
    }
}
