using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class PaymentViewModel : INotifyPropertyChanged
    {
        private decimal _originalTotalAmount;
        private decimal _receivedAmount;
        private string _tableName;
        private int _discountPercent;
        private decimal _discountAmount;
        
        // QR Payment Fields
        private bool _isCashPayment = true;
        private List<Bank> _banks = new List<Bank>();
        private Bank? _selectedBank;
        private string _bankAccountNumber = string.Empty;
        private string _bankAccountName = string.Empty;
        private string _qrImageUrl = string.Empty;
        private readonly VietQRService _vietQrService;

        // Static fields to remember selection during session
        private static Bank? _lastSelectedBank;
        private static string _lastAccountNumber = string.Empty;
        private static string _lastAccountName = string.Empty;

        public PaymentViewModel(decimal totalAmount, string tableName)
        {
            try
            {
                _originalTotalAmount = totalAmount;
                _tableName = tableName ?? "Unknown";
                _receivedAmount = totalAmount; // Default to exact amount
                _vietQrService = new VietQRService();
                
                // Restore last used settings (from static cache)
                _selectedBank = _lastSelectedBank;
                _bankAccountNumber = _lastAccountNumber;
                _bankAccountName = _lastAccountName;
                
                // Delay loading data to avoid constructor crash
                Task.Run(async () =>
                {
                    // await Task.Delay(300); // Removed unnecessary delay
                    await LoadSavedSettingsAsync(); // Load from API first
                    LoadBanks(); // Then load bank list
                });
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"PaymentViewModel Constructor Error: {ex.Message}");
            }
        }

        private async Task LoadSavedSettingsAsync()
        {
            try
            {
                var settingsService = new PaymentSettingsService();
                var settings = await settingsService.GetSettingsAsync();
                
                if (settings?.IsConfigured == true)
                {
                    System.Windows.Application.Current.Dispatcher.Invoke(() =>
                    {
                        // Settings are loaded, will be used when banks are loaded
                        _lastAccountNumber = settings.AccountNumber ?? string.Empty;
                        _lastAccountName = settings.AccountName ?? string.Empty;
                        
                        BankAccountNumber = settings.AccountNumber ?? string.Empty;
                        BankAccountName = settings.AccountName ?? string.Empty;
                        
                        // Store bankBin to find correct bank after loading
                        _savedBankBin = settings.BankBin;
                    });
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"LoadSavedSettings Error: {ex.Message}");
            }
        }

        private string? _savedBankBin;

        public string TableName
        {
            get => _tableName;
            set { _tableName = value; OnPropertyChanged(); }
        }

        public decimal OriginalTotalAmount
        {
            get => _originalTotalAmount;
            set
            {
                _originalTotalAmount = value;
                OnPropertyChanged();
                RecalculateAmount();
            }
        }

        public int DiscountPercent
        {
            get => _discountPercent;
            set
            {
                if (_discountPercent != value)
                {
                    _discountPercent = value;
                    OnPropertyChanged();
                    // Update Discount Amount based on Percent
                    _discountAmount = (_originalTotalAmount * _discountPercent) / 100;
                    OnPropertyChanged(nameof(DiscountAmount));
                    RecalculateAmount();
                }
            }
        }

        public decimal DiscountAmount
        {
            get => _discountAmount;
            set
            {
                if (_discountAmount != value)
                {
                    _discountAmount = value;
                    OnPropertyChanged();
                    if (_originalTotalAmount > 0)
                        _discountPercent = (int)((_discountAmount / _originalTotalAmount) * 100);
                    else
                        _discountPercent = 0;
                        
                    OnPropertyChanged(nameof(DiscountPercent));
                    RecalculateAmount();
                }
            }
        }
        
        public decimal FinalAmount => _originalTotalAmount - _discountAmount;

        public decimal ReceivedAmount
        {
            get => _receivedAmount;
            set 
            { 
                _receivedAmount = value; 
                OnPropertyChanged(); 
                OnPropertyChanged(nameof(Change)); 
                OnPropertyChanged(nameof(CanPay));
            }
        }

        public decimal Change => ReceivedAmount - FinalAmount;

        public bool CanPay => ReceivedAmount >= FinalAmount;

        // QR Payment Properties
        public bool IsCashPayment
        {
            get => _isCashPayment;
            set
            {
                _isCashPayment = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(IsTransferPayment));
                
                // Always generate QR code and update customer display
                // The customer display should show QR even in cash mode per user request
                GenerateQr();
            }
        }

        public bool IsTransferPayment => !IsCashPayment;

        public List<Bank> Banks
        {
            get => _banks;
            set { _banks = value; OnPropertyChanged(); }
        }

        public Bank? SelectedBank
        {
            get => _selectedBank;
            set
            {
                _selectedBank = value;
                _lastSelectedBank = value;
                OnPropertyChanged();
                GenerateQr();
            }
        }

        public string BankAccountNumber
        {
            get => _bankAccountNumber;
            set
            {
                _bankAccountNumber = value;
                _lastAccountNumber = value;
                OnPropertyChanged();
                GenerateQr();
            }
        }

        public string BankAccountName
        {
            get => _bankAccountName;
            set
            {
                _bankAccountName = value;
                _lastAccountName = value;
                OnPropertyChanged();
                GenerateQr();
            }
        }

        public string QrImageUrl
        {
            get => _qrImageUrl;
            set { _qrImageUrl = value; OnPropertyChanged(); }
        }

        private void RecalculateAmount()
        {
            OnPropertyChanged(nameof(FinalAmount));
            OnPropertyChanged(nameof(Change)); 
            OnPropertyChanged(nameof(CanPay));
            OnPropertyChanged(nameof(CanPay));
            GenerateQr();
        }

        private async void LoadBanks()
        {
            var banks = await _vietQrService.GetBanksAsync();
            
            System.Windows.Application.Current.Dispatcher.Invoke(() => 
            {
                Banks = banks;
                
                // Priority: 1. Saved BIN from API settings, 2. Last selected bank, 3. First bank
                if (!string.IsNullOrEmpty(_savedBankBin) && Banks.Any())
                {
                    SelectedBank = Banks.FirstOrDefault(b => b.Bin == _savedBankBin) ?? Banks.FirstOrDefault();
                }
                else if (_selectedBank != null && Banks.Any())
                {
                    SelectedBank = Banks.FirstOrDefault(b => b.Id == _selectedBank.Id) ?? Banks.FirstOrDefault();
                }
            });
        }

        private void GenerateQr()
        {
            if (SelectedBank == null || string.IsNullOrWhiteSpace(BankAccountNumber) || FinalAmount <= 0)
            {
                QrImageUrl = string.Empty;
                // Even without QR, update display with amount
                CustomerDisplayService.Instance.ShowPayment(string.Empty, FinalAmount);
                return;
            }

            var description = $"Thanh toan ban {TableName}";
            QrImageUrl = _vietQrService.GenerateQRUrl(SelectedBank.Bin, BankAccountNumber, FinalAmount, description, BankAccountName);
            
            // Push to Customer Display
            CustomerDisplayService.Instance.ShowPayment(QrImageUrl, FinalAmount);
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
