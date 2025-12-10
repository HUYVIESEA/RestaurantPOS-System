using System;
using System.Windows;
using System.Windows.Threading;

namespace RestaurantPOS.Desktop
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        public App()
        {
            // Catch all unhandled exceptions
            this.DispatcherUnhandledException += App_DispatcherUnhandledException;
            AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;
            TaskScheduler.UnobservedTaskException += TaskScheduler_UnobservedTaskException;
        }

        protected override async void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            
            // Tự động cấu hình URL (Ngrok hoặc Localhost) - Giờ chỉ là Localhost
            await Utilities.ConfigurationService.InitializeAsync();
        }

        private void App_DispatcherUnhandledException(object sender, DispatcherUnhandledExceptionEventArgs e)
        {
            MessageBox.Show(
                $"Lỗi ứng dụng (UI Thread):\n\n{e.Exception.Message}\n\nStack Trace:\n{e.Exception.StackTrace}",
                "Lỗi",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            e.Handled = true; // Prevent app from crashing
        }

        private void CurrentDomain_UnhandledException(object sender, UnhandledExceptionEventArgs e)
        {
            if (e.ExceptionObject is Exception ex)
            {
                MessageBox.Show(
                    $"Lỗi nghiêm trọng (Domain):\n\n{ex.Message}\n\nStack Trace:\n{ex.StackTrace}",
                    "Lỗi nghiêm trọng",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error);
            }
        }

        private void TaskScheduler_UnobservedTaskException(object? sender, UnobservedTaskExceptionEventArgs e)
        {
            MessageBox.Show(
                $"Lỗi Task (Background):\n\n{e.Exception.Message}\n\nStack Trace:\n{e.Exception.StackTrace}",
                "Lỗi Background",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            e.SetObserved(); // Prevent app from crashing
        }
    }
}
