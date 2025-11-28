using System.Windows;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Views
{
    public partial class UserFormDialog : Window
    {
        private readonly UserDto? _existingUser;
        private readonly bool _isEditMode;

        public string Username { get; private set; } = string.Empty;
        public string FullName { get; private set; } = string.Empty;
        public string Email { get; private set; } = string.Empty;
        public string Password { get; private set; } = string.Empty;
        public string Role { get; private set; } = "Staff";

        // Constructor for CREATE mode
        public UserFormDialog()
        {
            InitializeComponent();
            _isEditMode = false;
            TitleText.Text = "➕ Thêm Người Dùng Mới";
            PasswordPanel.Visibility = Visibility.Visible;
        }

        // Constructor for EDIT mode
        public UserFormDialog(UserDto user)
        {
            InitializeComponent();
            _existingUser = user;
            _isEditMode = true;
            
            TitleText.Text = "✏️ Chỉnh Sửa Người Dùng";
            PasswordPanel.Visibility = Visibility.Collapsed;

            // Populate fields
            UsernameTextBox.Text = user.Username;
            FullNameTextBox.Text = user.FullName;
            EmailTextBox.Text = user.Email;

            // Set role
            foreach (System.Windows.Controls.ComboBoxItem item in RoleComboBox.Items)
            {
                if (item.Tag.ToString() == user.Role)
                {
                    item.IsSelected = true;
                    break;
                }
            }
        }

        private void Save_Click(object sender, RoutedEventArgs e)
        {
            ErrorMessageText.Visibility = Visibility.Collapsed;

            // Validation
            if (string.IsNullOrWhiteSpace(UsernameTextBox.Text))
            {
                ShowError("Vui lòng nhập Username");
                return;
            }

            if (string.IsNullOrWhiteSpace(FullNameTextBox.Text))
            {
                ShowError("Vui lòng nhập Họ và Tên");
                return;
            }

            if (string.IsNullOrWhiteSpace(EmailTextBox.Text))
            {
                ShowError("Vui lòng nhập Email");
                return;
            }

            if (!IsValidEmail(EmailTextBox.Text))
            {
                ShowError("Email không hợp lệ");
                return;
            }

            if (!_isEditMode && string.IsNullOrWhiteSpace(PasswordBox.Password))
            {
                ShowError("Vui lòng nhập Mật khẩu");
                return;
            }

            if (!_isEditMode && PasswordBox.Password.Length < 6)
            {
                ShowError("Mật khẩu phải có ít nhất 6 ký tự");
                return;
            }

            // Get values
            Username = UsernameTextBox.Text.Trim();
            FullName = FullNameTextBox.Text.Trim();
            Email = EmailTextBox.Text.Trim();
            Password = PasswordBox.Password;
            
            if (RoleComboBox.SelectedItem is System.Windows.Controls.ComboBoxItem selectedItem)
            {
                Role = selectedItem.Tag.ToString() ?? "Staff";
            }

            DialogResult = true;
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
        }

        private void ShowError(string message)
        {
            ErrorMessageText.Text = message;
            ErrorMessageText.Visibility = Visibility.Visible;
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}
