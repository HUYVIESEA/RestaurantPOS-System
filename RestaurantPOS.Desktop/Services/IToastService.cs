namespace RestaurantPOS.Desktop.Services;

public interface IToastService
{
    void ShowSuccess(string message, int durationMs = 3000);
    void ShowError(string message, int durationMs = 4000);
    void ShowWarning(string message, int durationMs = 3500);
    void ShowInfo(string message, int durationMs = 3000);
}
