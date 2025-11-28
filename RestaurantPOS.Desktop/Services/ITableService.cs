using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public interface ITableService
{
    Task<List<TableDto>> GetTablesAsync();
    Task<TableDto?> GetTableByIdAsync(int id);
    Task<bool> UpdateTableStatusAsync(int id, string status);
    Task<bool> AssignOrderToTableAsync(int tableId, int orderId);
}
