using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CommunityToolkit.Mvvm.Messaging;
using RestaurantPOS.Desktop.Messages;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace RestaurantPOS.Desktop.ViewModels
{
    public partial class UserManagementViewModel : ObservableObject
    {
        private readonly IUserService _userService;
        private readonly IToastService _toastService;

        [ObservableProperty]
        private ObservableCollection<UserDto> _users = new();

        [ObservableProperty]
        private UserDto? _selectedUser;

        [ObservableProperty]
        private bool _isLoading;

        [ObservableProperty]
        private string _searchText = string.Empty;

        public UserManagementViewModel(IUserService userService, IToastService toastService)
        {
            _userService = userService;
            _toastService = toastService;
            LoadUsersCommand.Execute(null);
        }

        [RelayCommand]
        private async Task LoadUsers()
        {
            IsLoading = true;
            try
            {
                var users = await _userService.GetUsersAsync();
                
                // Filter by search text
                if (!string.IsNullOrWhiteSpace(SearchText))
                {
                    users = users.Where(u => 
                        u.Username.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                        u.FullName.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                        u.Email.Contains(SearchText, StringComparison.OrdinalIgnoreCase)
                    ).ToList();
                }

                Users = new ObservableCollection<UserDto>(users);
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Lỗi tải danh sách người dùng: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        [RelayCommand]
        private async Task Refresh()
        {
            await LoadUsers();
        }

        [ObservableProperty]
        private bool _isRightPanelOpen;

        [ObservableProperty]
        private string _rightPanelTitle = string.Empty;

        [ObservableProperty]
        private bool _isCreatingNew;

        // Properties for binding to the Right Panel Form
        [ObservableProperty]
        private string _editUsername = string.Empty;
        [ObservableProperty]
        private string _editFullName = string.Empty;
        [ObservableProperty]
        private string _editEmail = string.Empty;
        [ObservableProperty]
        private string _editPassword = string.Empty;
        [ObservableProperty]
        private string _editRole = "Staff";

        [ObservableProperty]
        private ObservableCollection<string> _roles = new() { "Admin", "Manager", "Staff" };

        [RelayCommand]
        private void CloseRightPanel()
        {
            IsRightPanelOpen = false;
        }

        [RelayCommand]
        private void CreateUser()
        {
            IsRightPanelOpen = true;
            IsCreatingNew = true;
            RightPanelTitle = "Thêm người dùng";
            
            // Clear fields
            EditUsername = string.Empty;
            EditFullName = string.Empty;
            EditEmail = string.Empty;
            EditPassword = string.Empty;
            EditRole = "Staff";
        }

        [RelayCommand]
        private void EditUser(UserDto? user)
        {
            if (user == null) return;

            IsRightPanelOpen = true;
            IsCreatingNew = false;
            RightPanelTitle = "Sửa người dùng";

            // Fill fields
            EditUsername = user.Username;
            EditFullName = user.FullName;
            EditEmail = user.Email;
            EditPassword = string.Empty; // Password usually not shown
            EditRole = user.Role;
            
            SelectedUser = user; // Keep track of who we are editing
        }

        [RelayCommand]
        private async Task SavePanel()
        {
            if (string.IsNullOrWhiteSpace(EditUsername) || string.IsNullOrWhiteSpace(EditFullName))
            {
                _toastService.ShowWarning("Vui lòng nhập đầy đủ thông tin bắt buộc");
                return;
            }

            IsLoading = true;
            try
            {
                if (IsCreatingNew)
                {
                    if (string.IsNullOrWhiteSpace(EditPassword))
                    {
                        _toastService.ShowWarning("Mật khẩu không được để trống khi tạo mới");
                        IsLoading = false;
                        return;
                    }

                    var request = new CreateUserRequest
                    {
                        Username = EditUsername,
                        FullName = EditFullName,
                        Email = EditEmail,
                        Password = EditPassword,
                        Role = EditRole
                    };

                    var newUser = await _userService.CreateUserAsync(request);
                    if (newUser != null)
                    {
                        _toastService.ShowSuccess($"Đã tạo người dùng '{newUser.Username}' thành công!");
                        await LoadUsers();
                        IsRightPanelOpen = false;
                    }
                }
                else // Update
                {
                    if (SelectedUser == null) return;

                    var request = new UpdateUserRequest
                    {
                        Username = EditUsername,
                        FullName = EditFullName,
                        Email = EditEmail
                    };

                    var success = await _userService.UpdateUserAsync(SelectedUser.Id, request);
                    if (success)
                    {
                        // Update role if changed
                        if (EditRole != SelectedUser.Role)
                        {
                            await _userService.UpdateRoleAsync(SelectedUser.Id, EditRole);
                        }

                        _toastService.ShowSuccess($"Đã cập nhật người dùng '{SelectedUser.Username}' thành công!");
                        await LoadUsers();
                        IsRightPanelOpen = false;
                    }
                    else
                    {
                        _toastService.ShowError("Có lỗi xảy ra khi cập nhật");
                    }
                }
            }
            catch (Exception ex)
            {
                _toastService.ShowError($"Lỗi: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        [RelayCommand]
        private async Task ToggleStatus(UserDto? user)
        {
            if (user == null) return;

            var result = MessageBox.Show(
                $"Bạn có chắc muốn {(user.IsActive ? "vô hiệu hóa" : "kích hoạt")} tài khoản '{user.Username}'?",
                "Xác nhận",
                MessageBoxButton.YesNo,
                MessageBoxImage.Question
            );

            if (result == MessageBoxResult.Yes)
            {
                IsLoading = true;
                try
                {
                    var success = await _userService.UpdateStatusAsync(user.Id, !user.IsActive);
                    if (success)
                    {
                        _toastService.ShowSuccess($"Đã {(user.IsActive ? "vô hiệu hóa" : "kích hoạt")} tài khoản thành công");
                        await LoadUsers();
                    }
                    else
                    {
                        _toastService.ShowError("Có lỗi xảy ra");
                    }
                }
                finally
                {
                    IsLoading = false;
                }
            }
        }

        [RelayCommand]
        private async Task ResetPassword(UserDto? user)
        {
            if (user == null) return;

            var result = MessageBox.Show(
                $"Bạn có chắc muốn reset mật khẩu cho tài khoản '{user.Username}'?",
                "Xác nhận",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning
            );

            if (result == MessageBoxResult.Yes)
            {
                IsLoading = true;
                try
                {
                    var response = await _userService.ResetPasswordAsync(user.Id);
                    if (response != null)
                    {
                        MessageBox.Show(
                            $"Mật khẩu mới: {response.NewPassword}\n\nVui lòng lưu lại mật khẩu này!",
                            "Reset Mật Khẩu Thành Công",
                            MessageBoxButton.OK,
                            MessageBoxImage.Information
                        );
                    }
                    else
                    {
                        _toastService.ShowError("Có lỗi xảy ra");
                    }
                }
                finally
                {
                    IsLoading = false;
                }
            }
        }

        [RelayCommand]
        private async Task DeleteUser(UserDto? user)
        {
            if (user == null) return;

            var result = MessageBox.Show(
                $"Bạn có chắc muốn XÓA tài khoản '{user.Username}'?\n\nHành động này không thể hoàn tác!",
                "Xác nhận Xóa",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning
            );

            if (result == MessageBoxResult.Yes)
            {
                IsLoading = true;
                try
                {
                    var success = await _userService.DeleteUserAsync(user.Id);
                    if (success)
                    {
                        _toastService.ShowSuccess("Đã xóa tài khoản thành công");
                        await LoadUsers();
                        if (IsRightPanelOpen && SelectedUser?.Id == user.Id)
                        {
                            IsRightPanelOpen = false;
                        }
                    }
                    else
                    {
                        _toastService.ShowError("Có lỗi xảy ra");
                    }
                }
                finally
                {
                    IsLoading = false;
                }
            }
        }

        [RelayCommand]
        private void NavigateToDashboard()
        {
            WeakReferenceMessenger.Default.Send(new NavigateToMessage("Dashboard"));
        }

        partial void OnSearchTextChanged(string value)
        {
            _ = LoadUsers();
        }
    }
}
