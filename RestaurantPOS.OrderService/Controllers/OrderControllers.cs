using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RestaurantPOS.OrderService.Data;
using RestaurantPOS.OrderService.Models;
using RestaurantPOS.OrderService.Services;
using RestaurantPOS.Shared.Middleware;

namespace RestaurantPOS.OrderService.Controllers;

[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Order>>> GetOrders()
    {
        var orders = await _orderService.GetAllOrdersAsync();
        return Ok(orders);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpGet("recent")]
    public async Task<ActionResult<List<Order>>> GetRecentOrders([FromQuery] int days = 7)
    {
        var orders = await _orderService.GetRecentOrdersAsync(days);
        return Ok(orders);
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(Order order)
    {
        try
        {
            var correlationId = CorrelationIdMiddleware.GetCorrelationId(HttpContext);
            var result = await _orderService.CreateOrderAsync(order, correlationId);
            return CreatedAtAction(nameof(GetOrder), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrder(int id, Order order)
    {
        if (id != order.Id) return BadRequest();
        var result = await _orderService.UpdateOrderAsync(id, order);
        if (result == null) return NotFound();
        return NoContent();
    }

    [HttpPost("{id}/complete")]
    public async Task<ActionResult<Order>> CompleteOrder(int id, [FromBody] CompleteOrderRequest request)
    {
        try
        {
            var result = await _orderService.CompleteOrderAsync(id, request.PaidAmount, request.PaymentMethod);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id)
    {
        var result = await _orderService.CancelOrderAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        var result = await _orderService.DeleteOrderAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", service = "order-service", timestamp = DateTime.UtcNow });
    }
}

[Route("api/[controller]")]
[ApiController]
public class TablesController : ControllerBase
{
    private readonly OrderDbContext _context;

    public TablesController(OrderDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Table>>> GetTables()
    {
        var tables = await _context.Tables.ToListAsync();
        return Ok(tables);
    }

    [HttpGet("available")]
    public async Task<ActionResult<List<Table>>> GetAvailableTables()
    {
        var tables = await _context.Tables.Where(t => t.IsAvailable).ToListAsync();
        return Ok(tables);
    }

    [HttpPost("{id}/return")]
    public async Task<IActionResult> ReturnTable(int id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null) return NotFound();

        table.IsAvailable = true;
        table.OccupiedAt = null;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("devices")]
    public async Task<ActionResult<List<PosDevice>>> GetDevices()
    {
        var devices = await _context.PosDevices.OrderByDescending(d => d.RequestTime).ToListAsync();
        return Ok(devices);
    }
}

public class CompleteOrderRequest
{
    public decimal PaidAmount { get; set; }
    public string PaymentMethod { get; set; } = "Cash";
}
