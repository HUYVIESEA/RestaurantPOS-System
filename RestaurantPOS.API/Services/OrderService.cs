using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;
using Microsoft.AspNetCore.SignalR;
using RestaurantPOS.API.Hubs;

namespace RestaurantPOS.API.Services
{
    /// <summary>
    /// Order Service with Hybrid Caching for enterprise performance
    /// </summary>
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<RestaurantHub, IRestaurantClient> _hubContext;
        private readonly ILogger<OrderService> _logger;
        private readonly ICacheService _cache;
        
        private const string CACHE_KEY_ORDER_PREFIX = "order:";
        private const string CACHE_KEY_ORDERS_PREFIX = "orders:page:"; // For paginated lists
        private const string CACHE_KEY_RECENT_ORDERS = "orders:recent:";
        private const string CACHE_KEY_TABLE_ORDERS = "orders:table:";
        private static readonly TimeSpan CacheExpiration = TimeSpan.FromMinutes(10);

        public OrderService(
            ApplicationDbContext context, 
            IHubContext<RestaurantHub, IRestaurantClient> hubContext, 
            ILogger<OrderService> logger,
            ICacheService cache)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
            _cache = cache;
        }

        public async Task<IEnumerable<Order>> GetAllOrdersAsync()
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.Table)
                .Include(o => o.OrderItems!)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<PagedResult<Order>> GetOrdersAsync(int pageNumber, int pageSize, string? status = null)
        {
            var cacheKey = $"{CACHE_KEY_RECENT_ORDERS}{pageNumber}:{pageSize}:{status ?? "all"}";
            
            // Try cache first
            var cached = await _cache.GetAsync<PagedResult<Order>>(cacheKey);
            if (cached != null)
            {
                _logger.LogInformation("Orders page {Page} found in cache", pageNumber);
                return cached;
            }

            // Cache miss - query database
            var query = _context.Orders
                .AsNoTracking();

            if (!string.IsNullOrEmpty(status))
            {
                var statuses = status.Split(',');
                query = query.Where(o => statuses.Contains(o.Status));
            }

            var totalItems = await query.CountAsync();

            var items = await query
                .Include(o => o.Table)
                .Include(o => o.OrderItems!)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = new PagedResult<Order>
            {
                Items = items,
                TotalItems = totalItems,
                PageNumber = pageNumber,
                PageSize = pageSize
            };
            
            // Cache the result
            await _cache.SetAsync(cacheKey, result, CacheExpiration);

            return result;
        }

        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            var cacheKey = $"{CACHE_KEY_ORDER_PREFIX}{id}";
            
            // Try cache first
            var cached = await _cache.GetAsync<Order>(cacheKey);
            if (cached != null)
            {
                _logger.LogInformation("Order {OrderId} found in cache", id);
                return cached;
            }

            // Cache miss - query database
            var order = await _context.Orders
                .AsNoTracking()
                .Include(o => o.Table)
                .Include(o => o.OrderItems!)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);
            
            if (order != null)
            {
                await _cache.SetAsync(cacheKey, order, CacheExpiration);
            }
            
            return order;
        }

        public async Task<IEnumerable<Order>> GetOrdersByTableAsync(int tableId)
        {
            var cacheKey = $"{CACHE_KEY_TABLE_ORDERS}{tableId}";
            
            // Try cache first
            var cached = await _cache.GetAsync<List<Order>>(cacheKey);
            if (cached != null)
            {
                _logger.LogInformation("Orders for table {TableId} found in cache", tableId);
                return cached;
            }

            // Cache miss - query database
            var orders = await _context.Orders
                .AsNoTracking()
                .Include(o => o.Table)
                .Include(o => o.OrderItems!)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.TableId == tableId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
            
            await _cache.SetAsync(cacheKey, orders, CacheExpiration);
            
            return orders;
        }

        /// <summary>
        /// Invalidates all cache entries related to an order
        /// </summary>
        private async Task InvalidateOrderCacheAsync(int? orderId = null, int? tableId = null, CancellationToken cancellationToken = default)
        {
            var keysToRemove = new List<string>();
            
            if (orderId.HasValue)
            {
                keysToRemove.Add($"{CACHE_KEY_ORDER_PREFIX}{orderId.Value}");
            }
            
            if (tableId.HasValue)
            {
                keysToRemove.Add($"{CACHE_KEY_TABLE_ORDERS}{tableId.Value}");
            }
            
            // Always invalidate recent orders list (paginated caches)
            // We should use a wildcard or tag to invalidate all order lists, but since we use simple keys:
            // This is a naive clear for common patterns. In production, use Redis Tags.
            keysToRemove.Add($"{CACHE_KEY_RECENT_ORDERS}1:10000:all");
            keysToRemove.Add($"{CACHE_KEY_RECENT_ORDERS}1:10000:Pending,Processing");
            keysToRemove.Add($"{CACHE_KEY_RECENT_ORDERS}1:1000:all");
            keysToRemove.Add($"{CACHE_KEY_RECENT_ORDERS}1:1000:Pending,Processing");
            keysToRemove.Add($"{CACHE_KEY_RECENT_ORDERS}1:50:all");
            keysToRemove.Add($"{CACHE_KEY_RECENT_ORDERS}1:20:all");
            keysToRemove.Add($"{CACHE_KEY_RECENT_ORDERS}1:10:all");
            
            foreach (var key in keysToRemove)
            {
                await _cache.RemoveAsync(key, cancellationToken);
            }
            
            _logger.LogInformation("Invalidated {Count} cache keys for order {OrderId}", keysToRemove.Count, orderId);
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            // SECURITY: Override client-supplied server-controlled fields
            order.OrderDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
            order.Status = "Pending"; // SECURITY: Force default status
            order.PaymentStatus = "Unpaid"; // SECURITY: Force default payment status
            order.PaidAmount = 0; // SECURITY: Reset paid amount

            // Calculate total amount from DB product prices
            decimal total = 0;
            if (order.OrderItems != null && order.OrderItems.Any())
            {
                // Optimization: Fetch all products in one query instead of N queries
                var productIds = order.OrderItems.Select(i => i.ProductId).Distinct().ToList();
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.Id))
                    .ToDictionaryAsync(p => p.Id);

                foreach (var item in order.OrderItems)
                {
                    if (products.TryGetValue(item.ProductId, out var product))
                    {
                        decimal unitPrice = product.Price;
                        if (item.VariantId.HasValue && product.Variants != null)
                        {
                            var variant = product.Variants.FirstOrDefault(v => v.Id == item.VariantId.Value);
                            if (variant != null) unitPrice += variant.PriceDelta;
                        }
                        if (item.ModifierItemIds != null && item.ModifierItemIds.Any() && product.Modifiers != null)
                        {
                            var allMods = product.Modifiers.SelectMany(m => m.Items);
                            foreach (var modId in item.ModifierItemIds)
                            {
                                var mod = allMods.FirstOrDefault(m => m.Id == modId);
                                if (mod != null) unitPrice += mod.PriceDelta;
                            }
                        }

                        item.UnitPrice = unitPrice; // SECURITY: Use DB calculated price
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
            
            // Invalidate caches
            await InvalidateOrderCacheAsync(order.Id, order.TableId);
            
            // Broadcast new order via SignalR
            await _hubContext.Clients.All.OrderCreated(order.Id);
            await _hubContext.Clients.All.TableUpdated(order.TableId ?? 0);

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
            
            // Invalidate caches
            await InvalidateOrderCacheAsync(order.Id, order.TableId);

            // ✅ Auto-free table when order is Completed or Cancelled
            if ((status == "Completed" || status == "Cancelled") && order.TableId.HasValue)
            {
                // Check if there are ANY other active orders for this table
                var otherActiveOrders = await _context.Orders
                    .Where(o => o.TableId == order.TableId && 
                                o.Id != id && 
                                o.Status != "Completed" && o.Status != "Cancelled")
                    .AnyAsync();

                // Only free table if NO other active orders exist
                if (!otherActiveOrders)
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
            await _hubContext.Clients.All.OrderUpdated(order.Id);
            await _hubContext.Clients.All.TableUpdated(order.TableId ?? 0);

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
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == item.ProductId);
                
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
                decimal unitPrice = product.Price;
                if (item.VariantId.HasValue && product.Variants != null)
                {
                    var variant = product.Variants.FirstOrDefault(v => v.Id == item.VariantId.Value);
                    if (variant != null) unitPrice += variant.PriceDelta;
                }
                if (item.ModifierItemIds != null && item.ModifierItemIds.Any() && product.Modifiers != null)
                {
                    var allMods = product.Modifiers.SelectMany(m => m.Items);
                    foreach (var modId in item.ModifierItemIds)
                    {
                        var mod = allMods.FirstOrDefault(m => m.Id == modId);
                        if (mod != null) unitPrice += mod.PriceDelta;
                    }
                }

                item.OrderId = orderId;
                item.UnitPrice = unitPrice;
                _context.OrderItems.Add(item);
                order.TotalAmount += item.UnitPrice * item.Quantity;
            }

            await _context.SaveChangesAsync();
            
            // Invalidate caches
            await InvalidateOrderCacheAsync(order.Id, order.TableId);
            
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
            
            // Invalidate caches
            await InvalidateOrderCacheAsync(order.Id, order.TableId);
            
            return await GetOrderByIdAsync(orderId);
        }

        // ✅ NEW: Update item note
        public async Task<Order?> UpdateItemNoteAsync(int orderId, int itemId, string note)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
                return null;

            var item = order.OrderItems?.FirstOrDefault(oi => oi.Id == itemId);
            if (item == null)
                return null;

            // Update user note
            item.Notes = note;

            await _context.SaveChangesAsync();
            
            // Invalidate caches
            await InvalidateOrderCacheAsync(order.Id, order.TableId);
            
            return await GetOrderByIdAsync(orderId);
        }

        // ✅ NEW: Bulk update items for an order
        public async Task<Order?> UpdateOrderItemsAsync(int orderId, List<UpdateOrderItemRequest> items)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Table)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null || order.Status != "Pending")
                return null;

            // Get product prices
            var productIds = items.Select(i => i.ProductId).Distinct().ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            // Remove items not in the new list
            var currentItems = order.OrderItems?.ToList() ?? new List<OrderItem>();
            foreach (var currentItem in currentItems)
            {
                _context.OrderItems.Remove(currentItem);
            }

            decimal newTotal = 0;
            var newOrderItems = new List<OrderItem>();

            foreach (var item in items)
            {
                if (products.TryGetValue(item.ProductId, out var product))
                {
                    // Check if we can merge identical items.
                    // Wait, UpdateOrderItemRequest does not have VariantId or ModifierItemIds?
                    // Let's assume it's just basic items for now since we haven't updated UpdateOrderItemRequest to support variants in bulk update
                    var existing = newOrderItems.FirstOrDefault(oi => oi.ProductId == item.ProductId && oi.Notes == item.Note);
                    if (existing != null)
                    {
                        existing.Quantity += item.Quantity;
                        newTotal += existing.UnitPrice * item.Quantity;
                    }
                    else
                    {
                        var newItem = new OrderItem
                        {
                            OrderId = orderId,
                            ProductId = item.ProductId,
                            Quantity = item.Quantity,
                            UnitPrice = product.Price, // Bulk update doesn't support variants yet, so use base price
                            Notes = item.Note
                        };
                        newOrderItems.Add(newItem);
                        _context.OrderItems.Add(newItem);
                        newTotal += newItem.UnitPrice * newItem.Quantity;
                    }
                }
            }

            order.TotalAmount = newTotal;

            if (newOrderItems.Count == 0)
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
                                table.OccupiedAt = null;
                            }
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            
            await InvalidateOrderCacheAsync(order.Id, order.TableId);
            
            await _hubContext.Clients.All.OrderUpdated(orderId);
            await _hubContext.Clients.All.TableUpdated(order.TableId ?? 0);
            
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
         o.Status != "Completed" && o.Status != "Cancelled")
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
        
        // Invalidate caches
        await InvalidateOrderCacheAsync(order.Id, order.TableId);
        
        await _hubContext.Clients.All.OrderUpdated(orderId);
        await _hubContext.Clients.All.TableUpdated(order.TableId ?? 0);
        return await GetOrderByIdAsync(orderId);
    }

    // ✅ NEW: Split order into two orders
    public async Task<SplitOrderResponse?> SplitOrderAsync(int orderId, List<int> itemIds)
        {
     var originalOrder = await _context.Orders
           .Include(o => o.OrderItems!)
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

            // Prevent completing an already completed/cancelled order
            if (order.Status == "Completed" || order.Status == "Cancelled")
            {
                _logger.LogWarning("Attempted to complete order {OrderId} with status {Status}", orderId, order.Status);
                return null;
            }

            // Validate payment amount
            if (receivedAmount < (double)order.TotalAmount)
                return null;

            // Update order status
            order.Status = "Completed";
            order.PaymentStatus = "Paid";
            order.PaymentMethod = paymentMethod;
            order.PaidAmount = (decimal)receivedAmount;
            order.CompletedAt = DateTime.UtcNow;

            // Free table if this was the only active order
            if (order.TableId.HasValue)
            {
                var otherActiveOrders = await _context.Orders
                    .Where(o => o.TableId == order.TableId &&
                                o.Id != orderId &&
                                o.Status != "Completed" && o.Status != "Cancelled")
                    .AnyAsync();

                if (!otherActiveOrders)
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
            await _hubContext.Clients.All.OrderCompleted(order.Id);
            await _hubContext.Clients.All.TableUpdated(order.TableId ?? 0);

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
