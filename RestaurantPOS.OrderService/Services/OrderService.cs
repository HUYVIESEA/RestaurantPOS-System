using Microsoft.EntityFrameworkCore;
using RestaurantPOS.OrderService.Clients;
using RestaurantPOS.OrderService.Data;
using RestaurantPOS.OrderService.Models;
using RestaurantPOS.OrderService.Saga;
using RestaurantPOS.Shared.EventBus;
using RestaurantPOS.Shared.Events;
using RestaurantPOS.Shared.Saga;

namespace RestaurantPOS.OrderService.Services;

public interface IOrderService
{
    Task<List<Order>> GetAllOrdersAsync();
    Task<Order?> GetOrderByIdAsync(int id);
    Task<Order> CreateOrderAsync(Order order, string? correlationId = null);
    Task<Order?> UpdateOrderAsync(int id, Order order);
    Task<bool> DeleteOrderAsync(int id);
    Task<Order> CompleteOrderAsync(int orderId, decimal paidAmount, string paymentMethod);
    Task<Order?> CancelOrderAsync(int orderId);
    Task<List<Order>> GetRecentOrdersAsync(int days = 7);
}

public class OrderServiceImpl : IOrderService
{
    private readonly OrderDbContext _context;
    private readonly SagaOrchestrator<CreateOrderSagaContext> _saga;
    private readonly ILogger<OrderServiceImpl> _logger;

    public OrderServiceImpl(
        OrderDbContext context,
        SagaOrchestrator<CreateOrderSagaContext> saga,
        ILogger<OrderServiceImpl> logger)
    {
        _context = context;
        _saga = saga;
        _logger = logger;
    }

    public async Task<List<Order>> GetAllOrdersAsync()
    {
        return await _context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderByIdAsync(int id)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Order> CreateOrderAsync(Order order, string? correlationId = null)
    {
        order.OrderDate = DateTime.UtcNow;
        order.Status = "Pending";
        order.PaymentStatus = "Unpaid";
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        var sagaContext = new CreateOrderSagaContext
        {
            Order = order,
            CorrelationId = correlationId
        };

        try
        {
            await _saga.ExecuteAsync(sagaContext);
            _logger.LogInformation("Saga completed successfully for order {OrderId}", order.Id);
        }
        catch (SagaExecutionException ex)
        {
            order.Status = "Failed";
            await _context.SaveChangesAsync();
            _logger.LogError(ex, "Saga failed for order {OrderId}: {Message}", order.Id, ex.Message);
            throw new InvalidOperationException($"Order creation failed: {ex.Message}", ex);
        }

        return order;
    }

    public async Task<Order?> UpdateOrderAsync(int id, Order order)
    {
        var existing = await _context.Orders.FindAsync(id);
        if (existing == null) return null;

        existing.CustomerName = order.CustomerName;
        existing.Notes = order.Notes;
        existing.TotalAmount = order.TotalAmount;
        existing.PaidAmount = order.PaidAmount;
        existing.PaymentMethod = order.PaymentMethod;
        existing.PaymentStatus = order.PaymentStatus;
        existing.Status = order.Status;
        existing.TableId = order.TableId;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteOrderAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return false;

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Order> CompleteOrderAsync(int orderId, decimal paidAmount, string paymentMethod)
    {
        var order = await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw new KeyNotFoundException("Order not found");

        order.Status = "Completed";
        order.PaymentMethod = paymentMethod;
        order.PaidAmount = paidAmount;
        order.PaymentStatus = paidAmount >= order.TotalAmount ? "Paid" : "Partial";
        order.CompletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order?> CancelOrderAsync(int orderId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return null;

        order.Status = "Cancelled";
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<List<Order>> GetRecentOrdersAsync(int days = 7)
    {
        var since = DateTime.UtcNow.AddDays(-days);
        return await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.OrderDate >= since)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }
}
