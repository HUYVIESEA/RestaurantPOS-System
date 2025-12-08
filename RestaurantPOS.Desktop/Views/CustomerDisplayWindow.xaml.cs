using System.Windows;
using RestaurantPOS.Desktop.ViewModels;

namespace RestaurantPOS.Desktop.Views
{
    public partial class CustomerDisplayWindow : Window
    {
        public CustomerDisplayWindow()
        {
            InitializeComponent();
            // The ViewModel should be set by the Controller/Service
        }

        public void SetViewModel(CustomerDisplayViewModel vm)
        {
            DataContext = vm;
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            // Optional: Auto maximize if needed
            // WindowState = WindowState.Maximized;
        }
    }
}
