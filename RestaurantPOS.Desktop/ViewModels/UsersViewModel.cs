using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Data;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Utilities;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class UsersViewModel : INotifyPropertyChanged
    {
        private readonly UserService _userService;
        private ObservableCollection<User> _users = new ObservableCollection<User>();
        private bool _isLoading;
        private string _searchQuery = "";

        public UsersViewModel()
        {
            _userService = new UserService();
            Users = new ObservableCollection<User>();
            // Initialize with empty view to avoid null reference if LoadUsers fails initially or runs async
            var view = CollectionViewSource.GetDefaultView(Users);
            view.Filter = FilterUser;
            UsersView = view;

            LoadUsersCommand = new RelayCommand(async _ => await LoadUsersAsync());
            AddUserCommand = new RelayCommand(ExecuteAddUser);
            EditUserCommand = new RelayCommand(ExecuteEditUser);
            DeleteUserCommand = new RelayCommand(ExecuteDeleteUser);
            
            // Allow loading to be triggered by Navigation or explicit Refresh
        }

        private ICollectionView? _usersView;
        public ICollectionView? UsersView
        {
            get => _usersView;
            set { _usersView = value; OnPropertyChanged(); }
        }

        public ObservableCollection<User> Users
        {
            get => _users;
            set 
            { 
                _users = value; 
                OnPropertyChanged();
                
                // Refresh View Source
                var view = CollectionViewSource.GetDefaultView(_users);
                view.Filter = FilterUser;
                UsersView = view;
            }
        }

        public string SearchQuery
        {
            get => _searchQuery;
            set 
            { 
                _searchQuery = value; 
                OnPropertyChanged();
                UsersView?.Refresh();
            }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); }
        }

        public ICommand LoadUsersCommand { get; }
        public ICommand AddUserCommand { get; }
        public ICommand EditUserCommand { get; }
        public ICommand DeleteUserCommand { get; }

        public async Task LoadUsersAsync()
        {
            IsLoading = true;
            try
            {
                var users = await _userService.GetAllUsersAsync();
                Users = new ObservableCollection<User>(users);
                
                if (Users.Count == 0)
                {
                    // Optional: Show a subtle message or toast if list is genuinely empty
                    // DialogHelper.ShowAlert("Thông báo", "Danh sách người dùng trống (0 bản ghi)."); 
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                await DialogHelper.ShowAlert("Lỗi Quyền Truy Cập", ex.Message, "Warning");
            }
            catch (Exception ex)
            {
                await DialogHelper.ShowAlert("Lỗi Hệ Thống", $"Lỗi: {ex.Message}", "Error");
            }
            finally
            {
                IsLoading = false;
            }
        }

        private bool FilterUser(object item)
        {
            if (string.IsNullOrEmpty(SearchQuery)) return true;
            if (item is User user)
            {
                return (user.Username?.Contains(SearchQuery, StringComparison.OrdinalIgnoreCase) ?? false) ||
                       (user.FullName?.Contains(SearchQuery, StringComparison.OrdinalIgnoreCase) ?? false) ||
                       (user.Role?.Contains(SearchQuery, StringComparison.OrdinalIgnoreCase) ?? false);
            }
            return true;
        }

        private async void ExecuteAddUser(object? parameter)
        {
            // We use standard Wpf DialogHost from MaterialDesign
            var view = new Views.UserDialog(); // Default constructor for Add
            
            // Show Dialog
            var result = await MaterialDesignThemes.Wpf.DialogHost.Show(view, "RootDialog");

            // Handle Result
            if (result is CreateUserRequest request)
            {
                IsLoading = true;
                bool success = await _userService.CreateUserAsync(request);
                IsLoading = false;

                if (success)
                {
                    await LoadUsersAsync();
                    await DialogHelper.ShowAlert("Thông báo", "Thêm người dùng thành công!", "Success");
                }
                else
                {
                    await DialogHelper.ShowAlert("Lỗi", "Thêm thất bại. Có thể tên đăng nhập đã tồn tại.", "Error");
                }
            }
        }

        private async void ExecuteEditUser(object? parameter)
        {
             if (parameter is User user)
            {
                var view = new Views.UserDialog(user); // Constructor for Edit
                var result = await MaterialDesignThemes.Wpf.DialogHost.Show(view, "RootDialog");

                if (result is UpdateUserRequest request)
                {
                    IsLoading = true;
                    // Note: UpdateUserRequest doesn't have ID, assuming service takes ID separately
                    bool success = await _userService.UpdateUserAsync(user.Id, request);
                    IsLoading = false;

                    if (success)
                    {
                        await LoadUsersAsync();
                        await DialogHelper.ShowAlert("Thông báo", "Cập nhật thành công!", "Success");
                    }
                    else
                    {
                        await DialogHelper.ShowAlert("Lỗi", "Cập nhật thất bại!", "Error");
                    }
                }
            }
        }

        private async void ExecuteDeleteUser(object? parameter)
        {
            if (parameter is User user)
            {
                if (user.Username.ToLower() == "admin") 
                {
                    await DialogHelper.ShowAlert("Cảnh báo", "Không thể xóa tài khoản Admin hệ thống!", "Warning");
                    return;
                }

                if (user.Username == UserSession.Instance.Username)
                {
                    await DialogHelper.ShowAlert("Cảnh báo", "Không thể tự xóa tài khoản của chính mình!", "Warning");
                    return;
                }

                if (await DialogHelper.ShowConfirm("Xác nhận xóa", $"Bạn có chắc chắn muốn xóa user '{user.Username}'?"))
                {
                    IsLoading = true;
                    bool success = await _userService.DeleteUserAsync(user.Id);
                    IsLoading = false;

                    if (success)
                    {
                        await LoadUsersAsync(); 
                        await DialogHelper.ShowAlert("Thông báo", "Đã xóa người dùng thành công!", "Success");
                    }
                    else
                    {
                        await DialogHelper.ShowAlert("Lỗi", "Xóa thất bại!", "Error");
                    }
                }
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
