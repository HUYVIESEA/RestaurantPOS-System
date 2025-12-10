using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using Microsoft.AspNetCore.SignalR;
using RestaurantPOS.API.Hubs;

namespace RestaurantPOS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DevicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<RestaurantHub> _hubContext;
        private static string _currentStoreCode = "886622"; // In-memory store code for simplicity
        private static DateTime _codeExpiry = DateTime.UtcNow.AddMinutes(10);

        public DevicesController(ApplicationDbContext context, IHubContext<RestaurantHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET: api/devices
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PosDevice>>> GetDevices()
        {
            return await _context.PosDevices.OrderByDescending(d => d.RequestTime).ToListAsync();
        }

        // GET: api/devices/store-code
        [HttpGet("store-code")]
        public ActionResult<object> GetStoreCode()
        {
            if (DateTime.UtcNow > _codeExpiry)
            {
                var random = new Random();
                _currentStoreCode = random.Next(100000, 999999).ToString();
                _codeExpiry = DateTime.UtcNow.AddMinutes(10);
            }

            return new { Code = _currentStoreCode, ExpiresAt = _codeExpiry };
        }

        // POST: api/devices/refresh-code
        [HttpPost("refresh-code")]
        public ActionResult<object> RefreshStoreCode()
        {
            var random = new Random();
            _currentStoreCode = random.Next(100000, 999999).ToString();
            _codeExpiry = DateTime.UtcNow.AddMinutes(10);
            
            return new { Code = _currentStoreCode, ExpiresAt = _codeExpiry };
        }

        // POST: api/devices/request
        [HttpPost("request")]
        public async Task<ActionResult<PosDevice>> RequestConnection(PosDevice device)
        {
            if (string.IsNullOrEmpty(device.DeviceIdentifier))
            {
                return BadRequest("Device Identifier is required.");
            }

            var existing = await _context.PosDevices.FirstOrDefaultAsync(d => d.DeviceIdentifier == device.DeviceIdentifier);
            if (existing != null)
            {
                existing.Name = device.Name;
                existing.IpAddress = device.IpAddress;
                existing.LastConnected = DateTime.UtcNow;
                existing.ConnectionType = device.ConnectionType;
                // If it was blocked, keep blocked. If active, keep active.
                
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("DevicesUpdated");
                return Ok(existing);
            }

            device.Id = Guid.NewGuid();
            device.RequestTime = DateTime.UtcNow;
            device.Status = "Pending";
            
            _context.PosDevices.Add(device);
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("DevicesUpdated");
            return CreatedAtAction("GetDevices", new { id = device.Id }, device);
        }

        // POST: api/devices/link-internet
        [HttpPost("link-internet")]
        public async Task<ActionResult<PosDevice>> LinkInternet([FromBody] LinkInternetRequest request)
        {
            if (request.StoreCode != _currentStoreCode || DateTime.UtcNow > _codeExpiry)
            {
                return BadRequest("Invalid or expired Store Code.");
            }

             var existing = await _context.PosDevices.FirstOrDefaultAsync(d => d.DeviceIdentifier == request.Device.DeviceIdentifier);
             if (existing != null)
             {
                 existing.Name = request.Device.Name;
                 existing.ConnectionType = "Internet";
                 existing.LastConnected = DateTime.UtcNow;
                 // If active, stays active
                 await _context.SaveChangesAsync();
                 await _hubContext.Clients.All.SendAsync("DevicesUpdated");
                 return Ok(existing);
             }

             var newDevice = request.Device;
             newDevice.Id = Guid.NewGuid();
             newDevice.RequestTime = DateTime.UtcNow;
             newDevice.Status = "Pending";
             newDevice.ConnectionType = "Internet";

             _context.PosDevices.Add(newDevice);
             await _context.SaveChangesAsync();

             await _hubContext.Clients.All.SendAsync("DevicesUpdated");
             return Ok(newDevice);
        }

        // POST: api/devices/approve/{id}
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> ApproveDevice(Guid id)
        {
            var device = await _context.PosDevices.FindAsync(id);
            if (device == null) return NotFound();

            device.Status = "Active";
            device.LastConnected = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("DevicesUpdated");
            return Ok(device);
        }

        // POST: api/devices/reject/{id}
        [HttpPost("reject/{id}")]
        public async Task<IActionResult> RejectDevice(Guid id)
        {
             var device = await _context.PosDevices.FindAsync(id);
            if (device == null) return NotFound();

            _context.PosDevices.Remove(device);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("DevicesUpdated");
            return Ok();
        }

        // DELETE: api/devices/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> RevokeDevice(Guid id)
        {
            var device = await _context.PosDevices.FindAsync(id);
            if (device == null) return NotFound();

            _context.PosDevices.Remove(device);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("DevicesUpdated");
            return NoContent();
        }
    }

    public class LinkInternetRequest
    {
        public string StoreCode { get; set; } = string.Empty;
        public PosDevice Device { get; set; } = new();
    }
}
