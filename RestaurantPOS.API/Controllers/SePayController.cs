using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.API.Models.SePay;
using RestaurantPOS.API.Services.SePay;

namespace RestaurantPOS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SePayController : ControllerBase
    {
        private readonly ISePayService _sePayService;

        public SePayController(ISePayService sePayService)
        {
            _sePayService = sePayService;
        }

        [HttpPost("webhook")]
        [AllowAnonymous] // SePay needs to access this without user auth token
        public async Task<IActionResult> Webhook([FromBody] SePayWebhookModel model)
        {
            try
            {
                await _sePayService.ProcessWebhook(model);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                // Log error
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
