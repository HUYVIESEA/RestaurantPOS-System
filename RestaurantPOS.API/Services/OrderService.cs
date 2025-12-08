using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using Microsoft.AspNetCore.SignalR;
using RestaurantPOS.API.Hubs;

namespace RestaurantPOS.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<RestaurantHub> _hubContext;
        private readonly IFirebaseService _firebaseService;
        private readonly ILogger<OrderService> _logger;

        public OrderService(ApplicationDbContext context, IHubContext<RestaurantHub> hubContext, IFirebaseService firebaseService, ILogger<OrderService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _firebaseService = firebaseService;
            _logger = logger;
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            return await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<Order>> GetOrdersByTableAsync(int tableId)
        {
            return await _context.Orders
                .Include(o => o.Table)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.TableId == tableId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            // ✅ Ensure OrderDate is UTC
            order.OrderDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);

            // Calculate total amount
            decimal total = 0;
            if (order.OrderItems != null)
            {
                foreach (var item in order.OrderItems)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product != null)
                    {
                        item.UnitPrice = product.Price;
                        total += item.UnitPrice * item.Quantity;
                    }
                }
            }
            order.TotalAmount = total;

            // ✅ Mark table as occupied when order is created
            if (order.TableId.HasValue)
            {
                var table = await _context.Tables.FindAsync(order.TableId.Value);
                if (table != null && table.IsAvailable)
                {
                    table.IsAvailable = false;
                    table.OccupiedAt = DateTime.UtcNow;
                }
            }

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            
            // Broadcast new order via SignalR
            await _hubContext.Clients.All.SendAsync("OrderCreated", order.Id);
            await _hubContext.Clients.All.SendAsync("TableUpdated");

            // ✅ Send Firebase Notification to Kitchen
            try 
            {
                string title = $"New Order #{order.Id}";
                string body = order.TableId.HasValue ? $"Table {order.TableId}" : "Takeaway";
                if (order.OrderItems != null && order.OrderItems.Any())
                {
                    body += $" - {order.OrderItems.Count} items";
                }
                
                await _firebaseService.SendTopicNotificationAsync(title, body, "Kitchen", new Dictionary<string, string>
                {
                    { "orderId", order.Id.ToString() },
                    { "type", "new_order" }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send Firebase notification for new order");
            }
            
            // Reload order with includes to return complete data
            return await GetOrderByIdAsync(order.Id) ?? order;
        }

        public async Task<Order?> UpdateOrderStatusAsync(int id, string status)
        {
            var order = await _context.Orders
                .Include(o => o.Table)
                .FirstOrDefaultAsync(o => o.Id == id);
            
            if (order == null)
                return null;

            string oldStatus = order.Status;
            order.Status = status;

            // ✅ NEW: Auto-free table when order is Completed or Cancelled
            if ((status == "Completed" || status == "Cancelled") && order.TableId.HasValue)
            {
                // Check if there are any other pending orders for this table
                var otherPendingOrders = await _context.Orders
                    .Where(o => o.TableId == order.TableId && 
                                o.Id != id && 
                                o.Status == "Pending")
                    .AnyAsync();

                // Only free table if no other pending orders exist
                if (!otherPendingOrders)
                {
                    var table = await _context.Tables.FindAsync(order.TableId.Value);
                    if (table != null)
                    {
                        if (table.IsMerged && table.MergedGroupId.HasValue)
                        {
                            var groupTables = await _context.Tables
                                .Where(t => t.MergedGroupId == table.MergedGroupId)
                                .ToListAsync();
                            foreach (var t in groupTables)
                            {
                                t.IsAvailable = true;
                                t.OccupiedAt = null;
                            }
                        }
                        else
                        {
                            table.IsAvailable = true;
                            table.OccupiedAt = null;
                        }
                    }
                }
            }        
            
            await _context.SaveChangesAsync();
            
            // Broadcast update via SignalR
            await _hubContext.Clients.All.SendAsync("OrderUpdated", order.Id);
            await _hubContext.Clients.All.SendAsync("TableUpdated");

            // ✅ Send Firebase Notification for Status Change
            if (oldStatus != status)
            {
                try
                {
                    string topic = "Waiters"; // Default to waiters
                    string title = $"Order #{order.Id} Updated";
                    string body = $"Status changed to {status}";
                    
                    if (status == "Ready") // Assuming we might add this status later
                    {
                        title = $"Order #{order.Id} Ready";
                        body = $"Table {order.TableId} is ready to serve";
                    }

                    await _firebaseService.SendTopicNotificationAsync(title, body, topic, new Dictionary<string, string>
                    {
                        { "orderId", order.Id.ToString() },
                        { "type", "order_update" },
                        { "status", status }
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send Firebase notification for order update");
                }
            }
            
            return order;
        }

        // ✅ Add item to existing order
        public async Task<Order?> AddItemToOrderAsync(int orderId, OrderItem item)
        {
            var order = await _context.Orders
          .Include(o => o.OrderItems)
       .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return null;

            // Get product to set unit price
            var product = await _context.Products.FindAsync(item.ProductId);
            if (product == null)
                return null;

            // ✅ NEW: Check if same product already exists in order
            var existingItem = order.OrderItems?
     .FirstOrDefault(oi => oi.ProductId == item.ProductId &&
       (string.IsNullOrEmpty(oi.Notes) && string.IsNullOrEmpty(item.Notes) ||
      oi.Notes == item.Notes));

            if (existingItem != null)
            {
                // Merge: Increase quantity of existing item
                existingItem.Quantity += item.Quantity;
                order.TotalAmount += product.Price * item.Quantity;
            }
            else
            {
                // Create new order item
                item.OrderId = orderId;
                item.UnitPrice = product.Price;
                _context.OrderItems.Add(item);
                order.TotalAmount += item.UnitPrice * item.Quantity;
            }

            await _context.SaveChangesAsync();
            return await GetOrderByIdAsync(orderId);
        }

        // ✅ NEW: Update item quantity
        public async Task<Order?> UpdateItemQuantityAsync(int orderId, int itemId, int quantity)
        {
            if (quantity < 1)
                return null;

            var order = await _context.Orders
                .Include(o => o.OrderItems)
          .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return null;

            var item = order.OrderItems?.FirstOrDefault(oi => oi.Id == itemId);
            if (item == null)
                return null;

            // Calculate difference
            var quantityDiff = quantity - item.Quantity;
            var priceDiff = item.UnitPrice * quantityDiff;

            // Update quantity and total
            item.Quantity = quantity;
            order.TotalAmount += priceDiff;

            await _context.SaveChangesAsync();
            return await GetOrderByIdAsync(orderId);
        }

        // ✅ Remove item from order
        public async Task<Order?> RemoveItemFromOrderAsync(int orderId, int itemId)
        {
            var order = await _context.Orders
 .Include(o => o.OrderItems)
        .Include(o => o.Table)
    .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order == null)
     return null;

        var item = order.OrderItems?.FirstOrDefault(oi => oi.Id == itemId);
      if (item == null)
   return null;

        // Subtract from total
        order.TotalAmount -= item.UnitPrice * item.Quantity;

    // Remove item
        _context.OrderItems.Remove(item);

      // ✅ NEW: If no items left, cancel order and free table
        if (order.OrderItems?.Count == 1) // Count is 1 because we haven't saved yet
  {
       order.Status = "Cancelled";
     
   // Free table if this was the only pending order
  if (order.TableId.HasValue)
   {
         var otherPendingOrders = await _context.Orders
         .Where(o => o.TableId == order.TableId && 
         o.Id != orderId && 
         o.Status == "Pending")
          .AnyAsync();

     if (!otherPendingOrders)
    {
       var table = await _context.Tables.FindAsync(order.TableId.Value);
      if (table != null)
   {
        if (table.IsMerged && table.MergedGroupId.HasValue)
        {
            var groupTables = await _context.Tables
                .Where(t => t.MergedGroupId == table.MergedGroupId)
                .ToListAsync();
            foreach (var t in groupTables)
            {
                t.IsAvailable = true;
                t.OccupiedAt = null;
            }
        }
        else
        {
            table.IsAvailable = true;
            table.OccupiedAt = null; // Also reset OccupiedAt
        }
       }
          }
      }
        }

        await _context.SaveChangesAsync();
        await _hubContext.Clients.All.SendAsync("OrderUpdated", orderId);
        await _hubContext.Clients.All.SendAsync("TableUpdated");
        return await GetOrderByIdAsync(orderId);
    }

    // ✅ NEW: Split order into two orders
    public async Task<SplitOrderResponse?> SplitOrderAsync(int orderId, List<int> itemIds)
        {
     var originalOrder = await _context.Orders
           .Include(o => o.OrderItems)
    .ThenInclude(oi => oi.Product)
         .Include(o => o.Table)
         .FirstOrDefaultAsync(o => o.Id == orderId);

     if (originalOrder == null)
    return null;

  if (originalOrder.OrderItems == null || originalOrder.OrderItems.Count == 0)
    return null;

      // Validate that itemIds exist in order
     var itemsToMove = originalOrder.OrderItems
          .Where(oi => itemIds.Contains(oi.Id))
    .ToList();

 if (itemsToMove.Count == 0)
      return null;

       // Can't move all items
  if (itemsToMove.Count == originalOrder.OrderItems.Count)
   return null;

   // Create new order
   var newOrder = new Order
  {
    TableId = originalOrder.TableId,
                OrderType = originalOrder.OrderType,
      OrderGroupId = originalOrder.OrderGroupId,
     ParentOrderId = orderId,
     CustomerName = originalOrder.CustomerName,
    OrderDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
  Status = "Pending",
    TotalAmount = 0
};

      _context.Orders.Add(newOrder);
      await _context.SaveChangesAsync(); // Save to get newOrder.Id

   // Move items to new order
      decimal movedTotal = 0;
   foreach (var item in itemsToMove)
  {
    movedTotal += item.UnitPrice * item.Quantity;
      item.OrderId = newOrder.Id;
            }

            // Update totals
       originalOrder.TotalAmount -= movedTotal;
    newOrder.TotalAmount = movedTotal;

     await _context.SaveChangesAsync();

 // Reload orders with all includes
 var reloadedOriginal = await GetOrderByIdAsync(orderId);
     var reloadedNew = await GetOrderByIdAsync(newOrder.Id);

         return new SplitOrderResponse
     {
                OriginalOrder = reloadedOriginal!,
      NewOrder = reloadedNew!
       };
      }

        // ✅ NEW: Complete order and process payment
        public async Task<Order?> CompleteOrderAsync(int orderId, double receivedAmount, string paymentMethod)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Table)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return null;

            // Validate payment amount
            if (receivedAmount < (double)order.TotalAmount)
                return null;

            // Update order status
            order.Status = "Completed";
            order.PaymentStatus = "Paid";
            order.PaymentMethod = paymentMethod;
            order.PaidAmount = (decimal)receivedAmount;
            order.CompletedAt = DateTime.UtcNow;

            // Free table if this was the only pending order
            if (order.TableId.HasValue)
            {
                var otherPendingOrders = await _context.Orders
                    .Where(o => o.TableId == order.TableId &&
                                o.Id != orderId &&
                                o.Status == "Pending")
                    .AnyAsync();

                if (!otherPendingOrders)
                {
                    var table = await _context.Tables.FindAsync(order.TableId.Value);
                    if (table != null)
                    {
                        if (table.IsMerged && table.MergedGroupId.HasValue)
                        {
                            var groupTables = await _context.Tables
                                .Where(t => t.MergedGroupId == table.MergedGroupId)
                                .ToListAsync();
                            foreach (var t in groupTables)
                            {
                                t.IsAvailable = true;
                                t.OccupiedAt = null;
                            }
                        }
                        else
                        {
                            table.IsAvailable = true;
                            table.OccupiedAt = null;
                        }
                    }
                }
            }

            // Create payment record
            var payment = new Payment
            {
                OrderId = order.Id,
                Amount = (decimal)receivedAmount,
                Method = paymentMethod,
                Status = "Success",
                PaymentDate = DateTime.UtcNow
            };
            _context.Payments.Add(payment);

            await _context.SaveChangesAsync();

            // Broadcast completion
            await _hubContext.Clients.All.SendAsync("OrderCompleted", order.Id);
            await _hubContext.Clients.All.SendAsync("TableUpdated");

            return await GetOrderByIdAsync(orderId);
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
       var order = await _context.Orders
   .Include(o => o.OrderItems)
 .FirstOrDefaultAsync(o => o.Id == id);

          if (order == null)
        return false;

   _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
     return true;
      }
    }
}
