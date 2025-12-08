using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Input;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class LoginViewModel : INotifyPropertyChanged
    {
        private readonly AuthService _authService;
        private string _username = "";
        private string _password = "";
        private bool _isLoading;
        private string _errorMessage = "";

        public LoginViewModel()
        {
            _authService = new AuthService();
            LoginCommand = new RelayCommand(ExecuteLogin, CanExecuteLogin);
        }

        public string Username
        {
            get => _username;
            set
            {
                _username = value;
                OnPropertyChanged();
                ErrorMessage = ""; // Clear error when typing
            }
        }

        public string Password
        {
            get => _password;
            set
            {
                _password = value;
                OnPropertyChanged();
                ErrorMessage = "";
            }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set
            {
                _isLoading = value;
                OnPropertyChanged();
            }
        }

        public string ErrorMessage
        {
            get => _errorMessage;
            set
            {
                _errorMessage = value;
                OnPropertyChanged();
            }
        }

        public ICommand LoginCommand { get; }

        private bool CanExecuteLogin(object? parameter)
        {
            return !string.IsNullOrWhiteSpace(Username) && !string.IsNullOrWhiteSpace(Password) && !IsLoading;
        }

        private async void ExecuteLogin(object? parameter)
        {
            IsLoading = true;
            ErrorMessage = "";

            // Pass PasswordBox as parameter if using PasswordBox, but for simplicity binding to string here (not secure for production but okay for prototype)
            // Ideally use PasswordBox with attached property or pass PasswordBox as parameter.
            // For this step, I'll assume the password is bound (which requires a helper for PasswordBox).
            // To keep it simple and working quickly, I will use the bound Password property.
            
            // Note: In a real app, use SecureString or PasswordBox directly.
            
            var response = await _authService.LoginAsync(Username, Password);

            IsLoading = false;

            if (response != null)
            {
                // Store session
                UserSession.Instance.SetSession(response.Token, response.Username, response.Role);

                // Navigate to MainWindow
                var mainWindow = new MainWindow();
                Application.Current.MainWindow = mainWindow;
                mainWindow.Show();
                
                // Close Login Window
                if (parameter is Window loginWindow)
                {
                    loginWindow.Close();
                }
            }
            else
            {
                ErrorMessage = "Tên đăng nhập hoặc mật khẩu không đúng!";
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
