using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.API.Models.DTOs;
using RestaurantPOS.API.Services;
using System.Security.Claims;

namespace RestaurantPOS.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ShiftsController : ControllerBase
    {
        private readonly IShiftService _shiftService;

        public ShiftsController(IShiftService shiftService)
        {
            _shiftService = shiftService;
        }

        // GET: api/shifts/active
        [HttpGet("active")]
        public async Task<ActionResult<ShiftDto>> GetActiveShift()
        {
            var userIdStr = User.FindFirstValue("UserId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            var shift = await _shiftService.GetActiveShiftAsync(userId);
            if (shift == null) return NotFound("No active shift found");

            return Ok(shift);
        }

        // POST: api/shifts/start
        [HttpPost("start")]
        public async Task<ActionResult<ShiftDto>> StartShift([FromBody] CreateShiftDto dto)
        {
            var userIdStr = User.FindFirstValue("UserId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            try
            {
                var shift = await _shiftService.StartShiftAsync(userId, dto);
                return CreatedAtAction(nameof(GetActiveShift), new { id = shift.Id }, shift);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST: api/shifts/close
        [HttpPost("close")]
        public async Task<ActionResult<ShiftDto>> CloseShift([FromBody] CloseShiftDto dto)
        {
            var userIdStr = User.FindFirstValue("UserId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized();

            try
            {
                var shift = await _shiftService.CloseShiftAsync(userId, dto);
                return Ok(shift);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET: api/shifts
        [HttpGet]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<ActionResult<IEnumerable<ShiftDto>>> GetShifts([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var shifts = await _shiftService.GetShiftsAsync(startDate, endDate);
            return Ok(shifts);
        }
    }
}