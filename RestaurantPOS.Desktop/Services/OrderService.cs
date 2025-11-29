using System.Net.Http;
using System.Net.Http.Json;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public class OrderService : IOrderService
{
    private readonly HttpClient _httpClient;
    private readonly IAuthenticationService _authService;

    public OrderService(HttpClient httpClient, IAuthenticationService authService)
    {
        _httpClient = httpClient;
        _authService = authService;
    }

    private void AddAuthorizationHeader()
    {
        if (_authService.CurrentUser != null && !string.IsNullOrEmpty(_authService.CurrentUser.Token))
        {
            _httpClient.DefaultRequestHeaders.Authorization = 
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _authService.CurrentUser.Token);
        }
    }

    public async Task<List<OrderDto>> GetOrdersAsync()
    {
        try
        {
            AddAuthorizationHeader();
            var orders = await _httpClient.GetFromJsonAsync<List<OrderDto>>("api/Orders");
            return orders ?? new List<OrderDto>();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OrderService: Error getting orders - {ex.Message}");
            return new List<OrderDto>();
        }
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        try
        {
            AddAuthorizationHeader();
            var order = await _httpClient.GetFromJsonAsync<OrderDto>($"api/Orders/{id}");
            return order;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OrderService: Error getting order {id} - {ex.Message}");
            return null;
        }
    }

    public async Task<OrderDto?> CreateOrderAsync(CreateOrderRequest request)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PostAsJsonAsync("api/Orders", request);
            
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<OrderDto>();
            }
            
            var error = await response.Content.ReadAsStringAsync();
            System.Diagnostics.Debug.WriteLine($"OrderService: Error creating order - {error}");
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OrderService: Error creating order - {ex.Message}");
            return null;
        }
    }

    public async Task<bool> UpdateOrderStatusAsync(int id, string status)
    {
        try
        {
            AddAuthorizationHeader();
            // Fix: API expects PATCH and [FromBody] string status.
            // PatchAsJsonAsync serializes the string "status" to JSON string "status".
            // This matches API expectation.
            var response = await _httpClient.PatchAsJsonAsync($"api/Orders/{id}/status", status);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OrderService: Error updating order status - {ex.Message}");
            return false;
        }
    }
    public async Task<List<OrderDto>> GetOrdersByTableAsync(int tableId)
    {
        try
        {
            AddAuthorizationHeader();
            System.Diagnostics.Debug.WriteLine($"OrderService: Calling API GET api/Orders/Table/{tableId}");
            
            var response = await _httpClient.GetAsync($"api/Orders/Table/{tableId}");
            response.EnsureSuccessStatusCode();
            
            var jsonString = await response.Content.ReadAsStringAsync();
            System.Diagnostics.Debug.WriteLine($"OrderService: Raw JSON Response: {jsonString}");
            
            var orders = System.Text.Json.JsonSerializer.Deserialize<List<OrderDto>>(jsonString, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            
            System.Diagnostics.Debug.WriteLine($"OrderService: Deserialized {orders?.Count ?? 0} orders");
            if (orders != null && orders.Count > 0)
            {
                System.Diagnostics.Debug.WriteLine($"OrderService: First order items count: {orders[0].Items.Count}");
                if (orders[0].Items.Count > 0)
                {
                    System.Diagnostics.Debug.WriteLine($"OrderService: First item product: {orders[0].Items[0].ProductName}, Qty: {orders[0].Items[0].Quantity}");
                }
            }
            
            return orders ?? new List<OrderDto>();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OrderService: Error getting orders for table {tableId} - {ex.Message}");
            return new List<OrderDto>();
        }
    }

    public async Task<OrderDto?> AddItemsToOrderAsync(int orderId, List<CreateOrderItemRequest> items)
    {
        try
        {
            AddAuthorizationHeader();
            System.Diagnostics.Debug.WriteLine($"OrderService: Adding {items.Count} items to order {orderId}");
            
            // API expects adding items one by one via POST /api/Orders/{id}/Items
            // We'll call it for each item
            foreach (var item in items)
            {
                var orderItem = new OrderItemDto
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Notes = item.Notes
                };
                
                var response = await _httpClient.PostAsJsonAsync($"api/Orders/{orderId}/Items", orderItem);
                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    System.Diagnostics.Debug.WriteLine($"OrderService: Error adding item - {error}");
                    return null;
                }
            }
            
            // Return the updated order
            return await GetOrderByIdAsync(orderId);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OrderService: Error adding items to order {orderId} - {ex.Message}");
            return null;
        }
    }

    public async Task<OrderDto?> CompleteOrderAsync(int orderId, decimal receivedAmount, string paymentMethod)
    {
        try
        {
            AddAuthorizationHeader();
            System.Diagnostics.Debug.WriteLine($"OrderService: Completing order {orderId} with {paymentMethod}, received: {receivedAmount}");
            
            var request = new
            {
                ReceivedAmount = receivedAmount,
                PaymentMethod = paymentMethod
            };
            
            var response = await _httpClient.PutAsJsonAsync($"api/Orders/{orderId}/Complete", request);
            
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<OrderDto>();
            }
            
            var error = await response.Content.ReadAsStringAsync();
            System.Diagnostics.Debug.WriteLine($"OrderService: Error completing order - {error}");
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OrderService: Error completing order {orderId} - {ex.Message}");
            return null;
        }
    }

    public async Task<OrderDto?> UpdateItemQuantityAsync(int orderId, int itemId, int quantity)
    {
        try
        {
            AddAuthorizationHeader();
            // Using PatchAsJsonAsync extension method
            var response = await _httpClient.PatchAsJsonAsync($"api/Orders/{orderId}/Items/{itemId}", quantity);
            
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<OrderDto>();
            }
            
            var error = await response.Content.ReadAsStringAsync();
            System.Diagnostics.Debug.WriteLine($"OrderService: Error updating item quantity - {error}");
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OrderService: Error updating item quantity - {ex.Message}");
            return null;
        }
    }

    public async Task<OrderDto?> RemoveItemFromOrderAsync(int orderId, int itemId)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.DeleteAsync($"api/Orders/{orderId}/Items/{itemId}");
            
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<OrderDto>();
            }
            
            var error = await response.Content.ReadAsStringAsync();
            System.Diagnostics.Debug.WriteLine($"OrderService: Error removing item - {error}");
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"OrderService: Error removing item - {ex.Message}");
            return null;
        }
    }
}
