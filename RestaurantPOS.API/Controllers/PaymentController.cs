using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.API.Services.VnPay;

namespace RestaurantPOS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IVnPayService _vnPayService;

        public PaymentController(IVnPayService vnPayService)
        {
            _vnPayService = vnPayService;
        }

        [HttpPost("create-payment-url")]
        [Authorize] // Chỉ user đã đăng nhập mới được thanh toán
        public IActionResult CreatePaymentUrl([FromBody] PaymentInformationModel model)
        {
            var url = _vnPayService.CreatePaymentUrl(HttpContext, model);
            return Ok(new { url });
        }

        [HttpGet("payment-callback")]
        public IActionResult PaymentCallback()
        {
            var response = _vnPayService.PaymentExecute(Request.Query);

            if (response == null || response.VnPayResponseCode != "00")
            {
                return Ok(new
                {
                    Success = false,
                    Message = "Lỗi thanh toán VNPay: " + response?.VnPayResponseCode
                });
            }

            // TODO: Lưu thông tin thanh toán vào database tại đây (cập nhật trạng thái Order)

            return Ok(new
            {
                Success = true,
                Message = "Thanh toán thành công",
                Data = response
            });
        }
    }
}
