using System.Windows;
using System.Windows.Controls;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Views
{
    public partial class UserDialog : UserControl
    {
        public bool IsEditMode { get; set; }
        public string Title => IsEditMode ? "Cập nhật người dùng" : "Thêm người dùng mới";
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = "Staff";
        public bool IsActive { get; set; } = true;

        public UserDialog(User? user = null)
        {
            InitializeComponent();
            
            if (user != null)
            {
                IsEditMode = true;
                Username = user.Username;
                FullName = user.FullName;
                Email = user.Email;
                Phone = user.Phone;
                Role = user.Role;
                IsActive = user.IsActive;
            }
            else
            {
                IsEditMode = false;
            }
            
            DataContext = this;
        }

        private void SaveButton_Click(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(Username))
            {
                MessageBox.Show("Vui lòng nhập tên đăng nhập", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            if (string.IsNullOrWhiteSpace(FullName))
            {
                MessageBox.Show("Vui lòng nhập họ tên", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (IsEditMode)
            {
                var request = new UpdateUserRequest
                {
                    FullName = FullName,
                    Email = Email,
                    Phone = Phone,
                    Role = Role,
                    IsActive = IsActive
                };
                MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(request, null);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(PasswordBox.Password))
                {
                    MessageBox.Show("Vui lòng nhập mật khẩu", "Lỗi", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                var request = new CreateUserRequest
                {
                    Username = Username,
                    Password = PasswordBox.Password,
                    FullName = FullName,
                    Email = Email,
                    Phone = Phone,
                    Role = Role
                };
                MaterialDesignThemes.Wpf.DialogHost.CloseDialogCommand.Execute(request, null);
            }
        }
    }
}
