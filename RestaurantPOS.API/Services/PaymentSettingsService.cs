using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Services;

public class PaymentSettingsService : IPaymentSettingsService
{
    private readonly ApplicationDbContext _context;

    public PaymentSettingsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetSettingsAsync()
    {
        var settings = await _context.PaymentSettings
            .Where(s => s.IsActive)
            .OrderByDescending(s => s.Id)
            .FirstOrDefaultAsync();

        if (settings == null)
        {
            return new { isConfigured = false, message = "Chưa cấu hình thông tin thanh toán" };
        }

        return new
        {
            isConfigured = true,
            bankName = settings.BankName,
            bankBin = settings.BankBin,
            accountNumber = settings.AccountNumber,
            accountName = settings.AccountName
        };
    }

    public async Task<object> UpdateSettingsAsync(string bankName, string bankBin, string accountNumber, string accountName, string password, int userId)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Không tìm thấy người dùng");

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            throw new UnauthorizedAccessException("Mật khẩu không chính xác");

        var oldSettings = await _context.PaymentSettings.Where(s => s.IsActive).ToListAsync();
        foreach (var old in oldSettings)
        {
            old.IsActive = false;
        }

        var newSettings = new PaymentSettings
        {
            BankName = bankName,
            BankBin = bankBin,
            AccountNumber = accountNumber,
            AccountName = accountName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedByUserId = userId
        };

        _context.PaymentSettings.Add(newSettings);
        await _context.SaveChangesAsync();

        return new { success = true, message = "Cập nhật thông tin thanh toán thành công" };
    }
}
