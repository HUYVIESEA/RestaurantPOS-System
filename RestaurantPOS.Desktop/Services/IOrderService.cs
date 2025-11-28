using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public interface IOrderService
{
    Task<List<OrderDto>> GetOrdersAsync();
    Task<OrderDto?> GetOrderByIdAsync(int id);
    Task<OrderDto?> CreateOrderAsync(CreateOrderRequest request);
    Task<bool> UpdateOrderStatusAsync(int id, string status);
    Task<List<OrderDto>> GetOrdersByTableAsync(int tableId);
    Task<OrderDto?> AddItemsToOrderAsync(int orderId, List<CreateOrderItemRequest> items);
    Task<OrderDto?> CompleteOrderAsync(int orderId, decimal receivedAmount, string paymentMethod);
}
