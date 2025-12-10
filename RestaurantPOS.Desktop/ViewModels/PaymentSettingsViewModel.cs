using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class PaymentSettingsViewModel : INotifyPropertyChanged
    {
        private readonly VietQRService _vietQrService;
        private readonly PaymentSettingsService _settingsService;
        
        private List<Bank> _banks = new List<Bank>();
        private Bank? _selectedBank;
        private string _accountNumber = string.Empty;
        private string _accountName = string.Empty;
        private string _password = string.Empty;
        private bool _isLoading;
        private bool _isConfigured;
        private string _statusMessage = string.Empty;

        public PaymentSettingsViewModel()
        {
            _vietQrService = new VietQRService();
            _settingsService = new PaymentSettingsService();
            
            SaveCommand = new RelayCommand(ExecuteSave, CanExecuteSave);
            
            LoadDataAsync();
        }

        public List<Bank> Banks
        {
            get => _banks;
            set { _banks = value; OnPropertyChanged(); }
        }

        public Bank? SelectedBank
        {
            get => _selectedBank;
            set { _selectedBank = value; OnPropertyChanged(); OnPropertyChanged(nameof(CanSave)); }
        }

        public string AccountNumber
        {
            get => _accountNumber;
            set { _accountNumber = value; OnPropertyChanged(); OnPropertyChanged(nameof(CanSave)); }
        }

        public string AccountName
        {
            get => _accountName;
            set { _accountName = value; OnPropertyChanged(); OnPropertyChanged(nameof(CanSave)); }
        }

        public string Password
        {
            get => _password;
            set { _password = value; OnPropertyChanged(); OnPropertyChanged(nameof(CanSave)); }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); }
        }

        public bool IsConfigured
        {
            get => _isConfigured;
            set { _isConfigured = value; OnPropertyChanged(); }
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set { _statusMessage = value; OnPropertyChanged(); }
        }

        public bool CanSave => SelectedBank != null && 
                               !string.IsNullOrWhiteSpace(AccountNumber) && 
                               !string.IsNullOrWhiteSpace(AccountName) && 
                               !string.IsNullOrWhiteSpace(Password) && 
                               !IsLoading;

        public ICommand SaveCommand { get; }

        private async void LoadDataAsync()
        {
            IsLoading = true;
            StatusMessage = "Đang tải dữ liệu...";

            try
            {
                // Load banks
                var banks = await _vietQrService.GetBanksAsync();
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    Banks = banks;
                });

                // Load current settings
                var settings = await _settingsService.GetSettingsAsync();
                
                Application.Current.Dispatcher.Invoke(() =>
                {
                    if (settings?.IsConfigured == true)
                    {
                        IsConfigured = true;
                        AccountNumber = settings.AccountNumber ?? string.Empty;
                        AccountName = settings.AccountName ?? string.Empty;
                        
                        // Find and select the bank
                        if (!string.IsNullOrEmpty(settings.BankBin))
                        {
                            SelectedBank = Banks.FirstOrDefault(b => b.Bin == settings.BankBin);
                        }
                        
                        StatusMessage = "Đã có cấu hình thanh toán. Nhập mật khẩu để cập nhật.";
                    }
                    else
                    {
                        IsConfigured = false;
                        StatusMessage = "Chưa có cấu hình. Vui lòng thiết lập thông tin thanh toán.";
                    }
                });
            }
            catch (Exception ex)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    StatusMessage = $"Lỗi: {ex.Message}";
                });
            }
            finally
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    IsLoading = false;
                });
            }
        }

        private bool CanExecuteSave(object? parameter) => CanSave;

        private async void ExecuteSave(object? parameter)
        {
            if (SelectedBank == null) return;

            IsLoading = true;
            StatusMessage = "Đang lưu...";

            try
            {
                var result = await _settingsService.UpdateSettingsAsync(
                    SelectedBank.DisplayName,
                    SelectedBank.Bin,
                    AccountNumber,
                    AccountName,
                    Password
                );

                if (result.Success)
                {
                    StatusMessage = "✓ " + result.Message;
                    Password = string.Empty; // Clear password for security
                    IsConfigured = true;
                    
                    await Utilities.DialogHelper.ShowAlert(
                        "Thành công",
                        "Cập nhật thông tin thanh toán thành công!\n\nThông tin sẽ được tự động điền khi thanh toán.",
                        "Success");
                }
                else
                {
                    StatusMessage = "✗ " + result.Message;
                    await Utilities.DialogHelper.ShowAlert(
                        "Lỗi",
                        result.Message,
                        "Error");
                }
            }
            catch (Exception ex)
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    StatusMessage = $"Lỗi: {ex.Message}";
                });
            }
            finally
            {
                Application.Current.Dispatcher.Invoke(() =>
                {
                    IsLoading = false;
                });
            }
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    // Simple RelayCommand implementation
    public class RelayCommand : ICommand
    {
        private readonly Action<object?> _execute;
        private readonly Func<object?, bool>? _canExecute;

        public RelayCommand(Action<object?> execute, Func<object?, bool>? canExecute = null)
        {
            _execute = execute;
            _canExecute = canExecute;
        }

        public event EventHandler? CanExecuteChanged
        {
            add => CommandManager.RequerySuggested += value;
            remove => CommandManager.RequerySuggested -= value;
        }

        public bool CanExecute(object? parameter) => _canExecute?.Invoke(parameter) ?? true;
        public void Execute(object? parameter) => _execute(parameter);
    }
}
