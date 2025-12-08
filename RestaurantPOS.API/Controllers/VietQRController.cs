using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.API.Services.VietQR;

namespace RestaurantPOS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VietQRController : ControllerBase
    {
        private readonly IVietQRService _vietQRService;

        public VietQRController(IVietQRService vietQRService)
        {
            _vietQRService = vietQRService;
        }

        /// <summary>
        /// Get list of supported banks from VietQR
        /// </summary>
        [HttpGet("banks")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBanks()
        {
            var banks = await _vietQRService.GetBanksAsync();
            return Ok(banks);
        }

        /// <summary>
        /// Generate QR payment URL
        /// </summary>
        [HttpPost("generate")]
        [Authorize]
        public IActionResult GenerateQR([FromBody] GenerateQRRequest request)
        {
            if (string.IsNullOrEmpty(request.BankBin) || string.IsNullOrEmpty(request.AccountNumber))
            {
                return BadRequest(new { message = "BankBin and AccountNumber are required" });
            }

            if (request.Amount <= 0)
            {
                return BadRequest(new { message = "Amount must be greater than 0" });
            }

            var qrUrl = _vietQRService.GenerateQRUrl(
                request.BankBin,
                request.AccountNumber,
                request.Amount,
                request.Description ?? "",
                request.AccountName ?? ""
            );

            return Ok(new { qrUrl });
        }
    }

    public class GenerateQRRequest
    {
        public string BankBin { get; set; } = string.Empty;
        public string AccountNumber { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public string? AccountName { get; set; }
    }
}
