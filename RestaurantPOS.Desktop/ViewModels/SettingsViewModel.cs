using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using RestaurantPOS.Desktop.Utilities;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class SettingsViewModel : INotifyPropertyChanged
    {
        private string _storeName = "Nhà hàng Tuấn Tú"; // Default
        private string _storeAddress = "123 Đường ABC, Quận XYZ, TP.HCM";
        private string _storePhone = "0909123456";
        private string _printerName = "Microsoft Print to PDF";
        private bool _autoPrint = true;

        public string StoreName
        {
            get => _storeName;
            set { _storeName = value; OnPropertyChanged(); }
        }

        public string StoreAddress
        {
            get => _storeAddress;
            set { _storeAddress = value; OnPropertyChanged(); }
        }

        public string StorePhone
        {
            get => _storePhone;
            set { _storePhone = value; OnPropertyChanged(); }
        }

        public string PrinterName
        {
            get => _printerName;
            set { _printerName = value; OnPropertyChanged(); }
        }

        public bool AutoPrint
        {
            get => _autoPrint;
            set { _autoPrint = value; OnPropertyChanged(); }
        }

        private bool _startWithWindows;
        public bool StartWithWindows
        {
            get => _startWithWindows;
            set { _startWithWindows = value; OnPropertyChanged(); }
        }

        private bool _startInFullScreen = true;
        public bool StartInFullScreen
        {
            get => _startInFullScreen;
            set { _startInFullScreen = value; OnPropertyChanged(); }
        }

        // Display Settings
        private System.Collections.ObjectModel.ObservableCollection<string> _availableScreens = new();
        public System.Collections.ObjectModel.ObservableCollection<string> AvailableScreens
        {
            get => _availableScreens;
            set { _availableScreens = value; OnPropertyChanged(); }
        }

        private string _selectedCustomerScreen;
        public string SelectedCustomerScreen
        {
            get => _selectedCustomerScreen;
            set 
            { 
                _selectedCustomerScreen = value; 
                OnPropertyChanged();
                // In a real app, save this to persistent config
            }
        }

        public RelayCommand SaveSettingsCommand { get; }
        public RelayCommand RefreshScreensCommand { get; }
        public RelayCommand IdentifyScreensCommand { get; }

        // Linked Devices
        private System.Collections.ObjectModel.ObservableCollection<LinkedDevice> _pendingDevices = new();
        public System.Collections.ObjectModel.ObservableCollection<LinkedDevice> PendingDevices
        {
            get => _pendingDevices;
            set { _pendingDevices = value; OnPropertyChanged(); }
        }

        private System.Collections.ObjectModel.ObservableCollection<LinkedDevice> _activeDevices = new();
        public System.Collections.ObjectModel.ObservableCollection<LinkedDevice> ActiveDevices
        {
            get => _activeDevices;
            set { _activeDevices = value; OnPropertyChanged(); }
        }

        public RelayCommand ApproveDeviceCommand { get; }
        public RelayCommand RejectDeviceCommand { get; }
        public RelayCommand RevokeDeviceCommand { get; }

        public SettingsViewModel()
        {
            _selectedCustomerScreen = string.Empty;
            LoadFromService();

            SaveSettingsCommand = new RelayCommand(ExecuteSaveSettings);
            RefreshScreensCommand = new RelayCommand(ExecuteRefreshScreens);
            IdentifyScreensCommand = new RelayCommand(ExecuteIdentifyScreens);

            // Device Linking Commands
            ApproveDeviceCommand = new RelayCommand(ExecuteApproveDevice);
            RejectDeviceCommand = new RelayCommand(ExecuteRejectDevice);
            RevokeDeviceCommand = new RelayCommand(ExecuteRevokeDevice);
            
            GenerateQrCodeCommand = new RelayCommand(ExecuteGenerateQrCode);
            RefreshStoreCodeCommand = new RelayCommand(ExecuteRefreshStoreCode);

            ExecuteRefreshScreens(null);
            InitializeNetworkInfo();
            ExecuteRefreshScreens(null);
            InitializeNetworkInfo();
            InitializeSignalR();
            LoadDevices();
        }


        // Connection Settings
        private bool _isLocalConnection = true;
        public bool IsLocalConnection
        {
            get => _isLocalConnection;
            set
            {
                _isLocalConnection = value;
                OnPropertyChanged();
                OnPropertyChanged(nameof(IsInternetConnection));
            }
        }

        public bool IsInternetConnection
        {
            get => !_isLocalConnection;
            set
            {
                IsLocalConnection = !value;
            }
        }

        private string _localIpAddress = "127.0.0.1";
        public string LocalIpAddress
        {
            get => _localIpAddress;
            set { _localIpAddress = value; OnPropertyChanged(); }
        }

        private string _storeCode = "886622";
        public string StoreCode
        {
            get => _storeCode;
            set { _storeCode = value; OnPropertyChanged(); }
        }

        public RelayCommand GenerateQrCodeCommand { get; }
        public RelayCommand RefreshStoreCodeCommand { get; }

        private string _qrCodeSource;
        public string QrCodeSource
        {
            get => _qrCodeSource;
            set { _qrCodeSource = value; OnPropertyChanged(); }
        }

        private string _qrText;
        public string QrText
        {
            get => _qrText;
            set { _qrText = value; OnPropertyChanged(); }
        }

        private bool _isQrVisible;
        public bool IsQrVisible
        {
            get => _isQrVisible;
            set { _isQrVisible = value; OnPropertyChanged(); }
        }
        
        private void InitializeNetworkInfo()
        {
            // Get Local IP
            try
            {
                var host = System.Net.Dns.GetHostEntry(System.Net.Dns.GetHostName());
                foreach (var ip in host.AddressList)
                {
                    if (ip.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
                    {
                        LocalIpAddress = ip.ToString();
                        break;
                    }
                }
            }
            catch
            {
                LocalIpAddress = "Could not determine IP";
            }
        }

        private async void ExecuteGenerateQrCode(object? parameter)
        {
             if (IsQrVisible)
            {
                IsQrVisible = false;
                return;
            }

            string content = "";

            if (IsLocalConnection)
            {
                content = $"http://{LocalIpAddress}:5000";
            }
            else
            {
                var codeInfo = await DeviceService.Instance.GetStoreCodeAsync();
                if (codeInfo != null)
                {
                    StoreCode = codeInfo.Code;
                    content = $"STORE:{StoreCode}";
                }
                else
                {
                    await DialogHelper.ShowAlert("Lỗi", "Không thể lấy mã cửa hàng", "Error");
                    return;
                }
            }
            
            QrText = content;
            // Use API to generate QR
            QrCodeSource = $"https://api.qrserver.com/v1/create-qr-code/?size=200x200&data={System.Uri.EscapeDataString(content)}";
            IsQrVisible = true;
        }

        private async void InitializeSignalR()
        {
             await Services.SignalRService.Instance.ConnectAsync();
             Services.SignalRService.Instance.OnDevicesUpdated += async () => 
             {
                 await System.Windows.Application.Current.Dispatcher.InvokeAsync(async () => 
                 {
                     await LoadDevicesSilent();
                 });
             };
        }

        private async void ExecuteRefreshStoreCode(object? parameter)
        {
            var result = await DeviceService.Instance.RefreshStoreCodeAsync();
            if (result != null)
            {
                StoreCode = result.Code;
            }
        }

        private async void LoadDevices()
        {
            var devices = await DeviceService.Instance.GetDevicesAsync();
            
            // Clear lists respecting UI thread if needed (ObservableCollection usually handles this but good to be safe if async)
            // But since we are replacing all, let's just clear and add.
            
            PendingDevices.Clear();
            ActiveDevices.Clear();

            foreach (var dev in devices)
            {
                if (dev.Status == "Pending")
                {
                    PendingDevices.Add(dev);
                }
                else if (dev.Status == "Active")
                {
                    ActiveDevices.Add(dev);
                }
            }
        }

        private async void ExecuteApproveDevice(object? parameter)
        {
            if (parameter is LinkedDevice device)
            {
                bool success = await DeviceService.Instance.ApproveDeviceAsync(device.Id);
                if (success)
                {
                    PendingDevices.Remove(device);
                    device.Status = "Active";
                    device.ConnectedTime = DateTime.Now;
                    ActiveDevices.Add(device);
                    await DialogHelper.ShowAlert("Thành công", $"Đã cấp quyền cho thiết bị {device.Name} ({device.ConnectionType})", "Success");
                }
                else
                {
                    await DialogHelper.ShowAlert("Lỗi", "Không thể phê duyệt thiết bị. Vui lòng thử lại.", "Error");
                }
            }
        }

        private async void ExecuteRejectDevice(object? parameter)
        {
            if (parameter is LinkedDevice device)
            {
                bool success = await DeviceService.Instance.RejectDeviceAsync(device.Id);
                if (success)
                {
                    PendingDevices.Remove(device);
                }
                else 
                {
                     await DialogHelper.ShowAlert("Lỗi", "Không thể từ chối thiết bị.", "Error");
                }
            }
        }

        private async void ExecuteRevokeDevice(object? parameter)
        {
            if (parameter is LinkedDevice device)
            {
                var result = await DialogHelper.ShowConfirm("Xác nhận", $"Bạn có chắc muốn hủy kết nối thiết bị {device.Name}?");
                if (result)
                {
                    bool success = await DeviceService.Instance.RevokeDeviceAsync(device.Id);
                    if (success)
                    {
                        ActiveDevices.Remove(device);
                    }
                    else
                    {
                        await DialogHelper.ShowAlert("Lỗi", "Không thể hủy kết nối thiết bị.", "Error");
                    }
                }
            }
        }




        private void LoadFromService()
        {
            var settings = LocalSettingsService.Instance.Settings;
            StoreName = settings.StoreName;
            StoreAddress = settings.StoreAddress;
            StorePhone = settings.StorePhone;
            PrinterName = settings.PrinterName;
            AutoPrint = settings.AutoPrint;
        }

        private void ExecuteRefreshScreens(object? parameter)
        {
            AvailableScreens.Clear();
            AvailableScreens.Add("Không sử dụng (Mặc định)");
            
            foreach (var screen in WpfScreenHelper.Screen.AllScreens)
            {
                // Format: DISPLAY1 (1920x1080)
                AvailableScreens.Add($"{screen.DeviceName} ({screen.Bounds.Width}x{screen.Bounds.Height}) " + (screen.Primary ? "[Chính]" : ""));
            }

            if (string.IsNullOrEmpty(SelectedCustomerScreen))
            {
                SelectedCustomerScreen = AvailableScreens[0];
            }
        }

        private void ExecuteIdentifyScreens(object? parameter)
        {
             // Show a number on each screen to identify them
            foreach (var screen in WpfScreenHelper.Screen.AllScreens)
            {
                var window = new Window
                {
                    WindowStyle = WindowStyle.None,
                    AllowsTransparency = true,
                    Background = new System.Windows.Media.SolidColorBrush(System.Windows.Media.Color.FromArgb(200, 33, 150, 243)), // Blue semi-transparent
                    Topmost = true,
                    ShowInTaskbar = false,
                    Left = screen.Bounds.Left,
                    Top = screen.Bounds.Top,
                    Width = screen.Bounds.Width,
                    Height = screen.Bounds.Height
                };

                var label = new System.Windows.Controls.TextBlock
                {
                    Text = screen.DeviceName.Replace(@"\\.\DISPLAY", ""),
                    Foreground = System.Windows.Media.Brushes.White,
                    FontSize = 100,
                    FontWeight = FontWeights.Bold,
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center
                };
                
                window.Content = new System.Windows.Controls.Grid { Children = { label } };
                window.Show();

                // Close after 2 seconds
                System.Threading.Tasks.Task.Delay(2000).ContinueWith(_ => 
                {
                    Application.Current.Dispatcher.Invoke(() => window.Close());
                });
            }
        }

        private async void ExecuteSaveSettings(object? parameter)
        {
            // Update Service
            var settings = LocalSettingsService.Instance.Settings;
            settings.StoreName = StoreName;
            settings.StoreAddress = StoreAddress;
            settings.StorePhone = StorePhone;
            settings.PrinterName = PrinterName;
            settings.AutoPrint = AutoPrint;
            
            LocalSettingsService.Instance.SaveSettings();

            // Apply Display Settings
            if (!string.IsNullOrEmpty(SelectedCustomerScreen) && !SelectedCustomerScreen.StartsWith("Không sử dụng"))
            {
                // Parse Device Name from string "DISPLAY1 (1920x1080)..."
                var deviceName = SelectedCustomerScreen.Split(' ')[0];
                CustomerDisplayService.Instance.Initialize(deviceName);
            }
            else
            {
                CustomerDisplayService.Instance.Close();
            }

            await DialogHelper.ShowAlert("Thông báo", "Đã lưu cài đặt!", "Success");
        }

        private async Task LoadDevicesSilent()
        {
            var devices = await DeviceService.Instance.GetDevicesAsync();
            
            // Pending
            var newPending = devices.Where(d => d.Status == "Pending").ToList();
            UpdateCollection(PendingDevices, newPending);

            // Active
            var newActive = devices.Where(d => d.Status == "Active").ToList();
            UpdateCollection(ActiveDevices, newActive);
        }

        private void UpdateCollection(System.Collections.ObjectModel.ObservableCollection<LinkedDevice> current, List<LinkedDevice> updated)
        {
            // Simple sync: add missing, remove extra
            // Remove
            var toRemove = current.Where(c => !updated.Any(u => u.Id == c.Id)).ToList();
            foreach (var r in toRemove) current.Remove(r);
            
            // Add
            var toAdd = updated.Where(u => !current.Any(c => c.Id == u.Id)).ToList();
            foreach (var a in toAdd) current.Add(a);
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }

    public class LinkedDevice
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Mobile, Tablet, Display
        public string ConnectionType { get; set; } = "Local"; // Local, Internet
        public DateTime RequestTime { get; set; }
        public DateTime? ConnectedTime { get; set; }
        public string Status { get; set; } = string.Empty; // Pending, Active
        
        public string Icon
        {
            get
            {
                return Type switch
                {
                    "Mobile" => "MobileAlt",
                    "Tablet" => "TabletAlt",
                    "Display" => "Desktop",
                    _ => "QuestionCircle"
                };
            }
        }
    }
}
