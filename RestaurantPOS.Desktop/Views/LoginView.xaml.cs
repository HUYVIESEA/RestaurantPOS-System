using System.Windows.Controls;
using RestaurantPOS.Desktop.ViewModels;

namespace RestaurantPOS.Desktop.Views;

public partial class LoginView : UserControl
{
    public LoginView()
    {
        InitializeComponent();
        DataContextChanged += LoginView_DataContextChanged;
    }

    private void LoginView_DataContextChanged(object sender, System.Windows.DependencyPropertyChangedEventArgs e)
    {
        System.Diagnostics.Debug.WriteLine($"LoginView: DataContextChanged, new DataContext type: {e.NewValue?.GetType().Name ?? "null"}");
        
        if (e.NewValue is LoginViewModel viewModel)
        {
            System.Diagnostics.Debug.WriteLine("LoginView: DataContext is LoginViewModel, setting up password sync");
            
            // Remove old handler if exists
            PasswordBox.PasswordChanged -= OnPasswordChanged;
            
            // Add new handler
            PasswordBox.PasswordChanged += OnPasswordChanged;
        }
    }

    private void OnPasswordChanged(object sender, System.Windows.RoutedEventArgs e)
    {
        if (DataContext is LoginViewModel viewModel)
        {
            viewModel.Password = PasswordBox.Password;
            System.Diagnostics.Debug.WriteLine($"LoginView: Password changed, length: {PasswordBox.Password.Length}");
        }
    }
}
