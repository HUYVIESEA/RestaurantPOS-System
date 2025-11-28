using System.Windows;
using System.Windows.Threading;
using RestaurantPOS.Desktop.Controls;

namespace RestaurantPOS.Desktop.Services;

public class ToastService : IToastService
{
    public void ShowSuccess(string message, int durationMs = 3000)
    {
        Application.Current.Dispatcher.Invoke(() =>
        {
            var toast = new ToastNotification
            {
                Message = message,
                ToastType = ToastType.Success,
                Duration = durationMs
            };
            toast.Show();
        });
    }

    public void ShowError(string message, int durationMs = 4000)
    {
        Application.Current.Dispatcher.Invoke(() =>
        {
            var toast = new ToastNotification
            {
                Message = message,
                ToastType = ToastType.Error,
                Duration = durationMs
            };
            toast.Show();
        });
    }

    public void ShowWarning(string message, int durationMs = 3500)
    {
        Application.Current.Dispatcher.Invoke(() =>
        {
            var toast = new ToastNotification
            {
                Message = message,
                ToastType = ToastType.Warning,
                Duration = durationMs
            };
            toast.Show();
        });
    }

    public void ShowInfo(string message, int durationMs = 3000)
    {
        Application.Current.Dispatcher.Invoke(() =>
        {
            var toast = new ToastNotification
            {
                Message = message,
                ToastType = ToastType.Info,
                Duration = durationMs
            };
            toast.Show();
        });
    }
}

public enum ToastType
{
    Success,
    Error,
    Warning,
    Info
}
