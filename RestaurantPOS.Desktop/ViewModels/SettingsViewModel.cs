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

        public SettingsViewModel()
        {
            _selectedCustomerScreen = string.Empty;
            SaveSettingsCommand = new RelayCommand(ExecuteSaveSettings);
            RefreshScreensCommand = new RelayCommand(ExecuteRefreshScreens);
            IdentifyScreensCommand = new RelayCommand(ExecuteIdentifyScreens);

            ExecuteRefreshScreens(null);
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

        private void ExecuteSaveSettings(object? parameter)
        {
            // In a real app, save to Properties.Settings.Default.Save();
            
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

            MessageBox.Show($"Đã lưu cài đặt!\nMàn hình khách: {SelectedCustomerScreen}", "Thông báo", MessageBoxButton.OK, MessageBoxImage.Information);
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
