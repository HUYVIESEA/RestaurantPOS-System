using System.Windows;
using RestaurantPOS.Desktop.Views;

namespace RestaurantPOS.Desktop.Services;

public class DialogService : IDialogService
{
    public Task<bool> ShowConfirmationAsync(string message, string title = "Xác nhận")
    {
        var tcs = new TaskCompletionSource<bool>();
        
        Application.Current.Dispatcher.Invoke(() =>
        {
            var dialog = new ModernDialog
            {
                Title = title,
                Message = message,
                DialogType = DialogType.Confirmation,
                Owner = Application.Current.MainWindow,
                WindowStartupLocation = WindowStartupLocation.CenterOwner
            };
            
            var result = dialog.ShowDialog() == true;
            tcs.SetResult(result);
        });
        
        return tcs.Task;
    }

    public Task ShowSuccessAsync(string message, string title = "Thành công")
    {
        var tcs = new TaskCompletionSource();
        
        Application.Current.Dispatcher.Invoke(() =>
        {
            var dialog = new ModernDialog
            {
                Title = title,
                Message = message,
                DialogType = DialogType.Success,
                Owner = Application.Current.MainWindow,
                WindowStartupLocation = WindowStartupLocation.CenterOwner
            };
            
            dialog.ShowDialog();
            tcs.SetResult();
        });
        
        return tcs.Task;
    }

    public Task ShowErrorAsync(string message, string title = "Lỗi")
    {
        var tcs = new TaskCompletionSource();
        
        Application.Current.Dispatcher.Invoke(() =>
        {
            var dialog = new ModernDialog
            {
                Title = title,
                Message = message,
                DialogType = DialogType.Error,
                Owner = Application.Current.MainWindow,
                WindowStartupLocation = WindowStartupLocation.CenterOwner
            };
            
            dialog.ShowDialog();
            tcs.SetResult();
        });
        
        return tcs.Task;
    }

    public Task ShowWarningAsync(string message, string title = "Cảnh báo")
    {
        var tcs = new TaskCompletionSource();
        
        Application.Current.Dispatcher.Invoke(() =>
        {
            var dialog = new ModernDialog
            {
                Title = title,
                Message = message,
                DialogType = DialogType.Warning,
                Owner = Application.Current.MainWindow,
                WindowStartupLocation = WindowStartupLocation.CenterOwner
            };
            
            dialog.ShowDialog();
            tcs.SetResult();
        });
        
        return tcs.Task;
    }

    public Task ShowInfoAsync(string message, string title = "Thông báo")
    {
        var tcs = new TaskCompletionSource();
        
        Application.Current.Dispatcher.Invoke(() =>
        {
            var dialog = new ModernDialog
            {
                Title = title,
                Message = message,
                DialogType = DialogType.Info,
                Owner = Application.Current.MainWindow,
                WindowStartupLocation = WindowStartupLocation.CenterOwner
            };
            
            dialog.ShowDialog();
            tcs.SetResult();
        });
        
        return tcs.Task;
    }
}

public enum DialogType
{
    Info,
    Success,
    Warning,
    Error,
    Confirmation
}
