namespace RestaurantPOS.API.Services;

public interface IPaymentSettingsService
{
    Task<object> GetSettingsAsync();
    Task<object> UpdateSettingsAsync(string bankName, string bankBin, string accountNumber, string accountName, string password, int userId);
}
