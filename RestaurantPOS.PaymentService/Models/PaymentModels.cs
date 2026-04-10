namespace RestaurantPOS.PaymentService.Models;

public class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = "Cash";
    public string Status { get; set; } = "Pending";
    public string? TransactionId { get; set; }
    public string? BankName { get; set; }
    public string? AccountNumber { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}

public class PaymentSettings
{
    public int Id { get; set; }
    public string BankName { get; set; } = string.Empty;
    public string BankBin { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int UpdatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class VietQRRequest
{
    public string AccountNo { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public string AcqId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string AddInfo { get; set; } = string.Empty;
    public string Template { get; set; } = "compact2";
}

public class VietQRResponse
{
    public string QrDataURL { get; set; } = string.Empty;
    public string QrEncodeDataURL { get; set; } = string.Empty;
}
