namespace RestaurantPOS.Desktop.Services;

public interface IDialogService
{
    Task<bool> ShowConfirmationAsync(string message, string title = "Xác nhận");
    Task ShowSuccessAsync(string message, string title = "Thành công");
    Task ShowErrorAsync(string message, string title = "Lỗi");
    Task ShowWarningAsync(string message, string title = "Cảnh báo");
    Task ShowInfoAsync(string message, string title = "Thông báo");
}
