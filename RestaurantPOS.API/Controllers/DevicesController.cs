using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RestaurantPOS.API.Hubs;
using RestaurantPOS.API.Models;
using RestaurantPOS.API.Services;

namespace RestaurantPOS.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DevicesController : ControllerBase
{
    private readonly IDeviceService _deviceService;
    private readonly IHubContext<RestaurantHub, IRestaurantClient> _hubContext;

    public DevicesController(IDeviceService deviceService, IHubContext<RestaurantHub, IRestaurantClient> hubContext)
    {
        _deviceService = deviceService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PosDevice>>> GetDevices()
    {
        var devices = await _deviceService.GetAllDevicesAsync();
        return Ok(devices);
    }

    [HttpGet("store-code")]
    public ActionResult<object> GetStoreCode()
    {
        return Ok(_deviceService.GetStoreCode());
    }

    [HttpPost("refresh-code")]
    [Authorize(Roles = "Admin")]
    public ActionResult<object> RefreshStoreCode()
    {
        return Ok(_deviceService.RefreshStoreCode());
    }

    [HttpPost("request")]
    public async Task<ActionResult<PosDevice>> RequestConnection(PosDevice device)
    {
        if (string.IsNullOrEmpty(device.DeviceIdentifier))
            return BadRequest("Device Identifier is required.");

        var result = await _deviceService.RequestConnectionAsync(device);
        await _hubContext.Clients.All.DevicesUpdated();
        return CreatedAtAction(nameof(GetDevices), new { id = result.Id }, result);
    }

    [HttpPost("link-internet")]
    public async Task<ActionResult<PosDevice>> LinkInternet([FromBody] LinkInternetRequest request)
    {
        try
        {
            var result = await _deviceService.LinkInternetAsync(request.Device, request.StoreCode);
            await _hubContext.Clients.All.DevicesUpdated();
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("approve/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveDevice(Guid id)
    {
        try
        {
            var result = await _deviceService.ApproveDeviceAsync(id);
            await _hubContext.Clients.All.DevicesUpdated();
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("reject/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RejectDevice(Guid id)
    {
        var result = await _deviceService.RejectDeviceAsync(id);
        if (!result) return NotFound();

        await _hubContext.Clients.All.DevicesUpdated();
        return Ok();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RevokeDevice(Guid id)
    {
        var result = await _deviceService.RevokeDeviceAsync(id);
        if (!result) return NotFound();

        await _hubContext.Clients.All.DevicesUpdated();
        return NoContent();
    }
}

public class LinkInternetRequest
{
    public string StoreCode { get; set; } = string.Empty;
    public PosDevice Device { get; set; } = new();
}
