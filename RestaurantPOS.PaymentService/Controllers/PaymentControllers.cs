using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.PaymentService.Models;
using RestaurantPOS.PaymentService.Services;

namespace RestaurantPOS.PaymentService.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost]
    public async Task<ActionResult<Payment>> CreatePayment(Payment payment)
    {
        var result = await _paymentService.CreatePaymentAsync(payment);
        return CreatedAtAction(nameof(GetPayment), new { id = result.Id }, result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Payment>> GetPayment(int id)
    {
        var payment = await _paymentService.GetPaymentByIdAsync(id);
        if (payment == null) return NotFound();
        return Ok(payment);
    }

    [HttpGet("order/{orderId}")]
    public async Task<ActionResult<List<Payment>>> GetPaymentsByOrder(int orderId)
    {
        var payments = await _paymentService.GetPaymentsByOrderIdAsync(orderId);
        return Ok(payments);
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<Payment>> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        try
        {
            var result = await _paymentService.UpdatePaymentStatusAsync(id, request.Status, request.TransactionId);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("vietqr")]
    public async Task<ActionResult<VietQRResponse>> GenerateVietQR([FromBody] VietQRRequest request)
    {
        var result = await _paymentService.GenerateVietQRAsync(request);
        return Ok(result);
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", service = "payment-service", timestamp = DateTime.UtcNow });
    }
}

[Route("api/[controller]")]
[ApiController]
public class PaymentSettingsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentSettingsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSettings()
    {
        var result = await _paymentService.GetPaymentSettingsAsync();
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateSettingsRequest request)
    {
        var result = await _paymentService.UpdatePaymentSettingsAsync(
            request.BankName, request.BankBin, request.AccountNumber, request.AccountName, request.UserId);
        return Ok(result);
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
}

public class UpdateSettingsRequest
{
    public string BankName { get; set; } = string.Empty;
    public string BankBin { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string AccountName { get; set; } = string.Empty;
    public int UserId { get; set; }
}
