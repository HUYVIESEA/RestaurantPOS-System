using Microsoft.EntityFrameworkCore;
using RestaurantPOS.PaymentService.Data;
using RestaurantPOS.PaymentService.Models;

namespace RestaurantPOS.PaymentService.Services;

public interface IPaymentService
{
    Task<Payment> CreatePaymentAsync(Payment payment);
    Task<Payment?> GetPaymentByIdAsync(int id);
    Task<List<Payment>> GetPaymentsByOrderIdAsync(int orderId);
    Task<Payment> UpdatePaymentStatusAsync(int id, string status, string? transactionId = null);
    Task<object> GetPaymentSettingsAsync();
    Task<object> UpdatePaymentSettingsAsync(string bankName, string bankBin, string accountNumber, string accountName, int userId);
    Task<VietQRResponse> GenerateVietQRAsync(VietQRRequest request);
}

public class PaymentServiceImpl : IPaymentService
{
    private readonly PaymentDbContext _context;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public PaymentServiceImpl(PaymentDbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    public async Task<Payment> CreatePaymentAsync(Payment payment)
    {
        payment.CreatedAt = DateTime.UtcNow;
        payment.Status = "Pending";
        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task<Payment?> GetPaymentByIdAsync(int id)
    {
        return await _context.Payments.FindAsync(id);
    }

    public async Task<List<Payment>> GetPaymentsByOrderIdAsync(int orderId)
    {
        return await _context.Payments
            .Where(p => p.OrderId == orderId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<Payment> UpdatePaymentStatusAsync(int id, string status, string? transactionId = null)
    {
        var payment = await _context.Payments.FindAsync(id)
            ?? throw new KeyNotFoundException("Payment not found");

        payment.Status = status;
        payment.TransactionId = transactionId;
        if (status == "Completed")
            payment.CompletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return payment;
    }

    public async Task<object> GetPaymentSettingsAsync()
    {
        var settings = await _context.PaymentSettings
            .Where(s => s.IsActive)
            .OrderByDescending(s => s.Id)
            .FirstOrDefaultAsync();

        if (settings == null)
            return new { isConfigured = false, message = "Chưa cấu hình thông tin thanh toán" };

        return new
        {
            isConfigured = true,
            settings.BankName,
            settings.BankBin,
            settings.AccountNumber,
            settings.AccountName
        };
    }

    public async Task<object> UpdatePaymentSettingsAsync(string bankName, string bankBin, string accountNumber, string accountName, int userId)
    {
        var oldSettings = await _context.PaymentSettings.Where(s => s.IsActive).ToListAsync();
        foreach (var old in oldSettings) old.IsActive = false;

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

    public async Task<VietQRResponse> GenerateVietQRAsync(VietQRRequest request)
    {
        var client = _httpClientFactory.CreateClient();
        var apiUrl = _configuration["VietQR:ApiUrl"] ?? "https://api.vietqr.io/v2/generate";

        var payload = new
        {
            accountNo = request.AccountNo,
            accountName = request.AccountName,
            acqId = request.AcqId,
            amount = request.Amount,
            addInfo = request.AddInfo,
            template = request.Template
        };

        var response = await client.PostAsJsonAsync(apiUrl, payload);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<VietQRResponse>()
            ?? throw new InvalidOperationException("Failed to parse VietQR response");

        return result;
    }
}
