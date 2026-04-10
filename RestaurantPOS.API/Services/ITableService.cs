using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Services;

public interface ITableService
{
    Task<IEnumerable<Table>> GetAllTablesAsync();
    Task<Table?> GetTableByIdAsync(int id);
    Task<IEnumerable<Table>> GetAvailableTablesAsync();
    Task<IEnumerable<Table>> GetTablesByFloorAsync(string floor);
    Task<Table> CreateTableAsync(Table table);
    Task<Table?> UpdateTableAsync(int id, Table table);
    Task<bool> UpdateTableAvailabilityAsync(int id, bool isAvailable);
    Task<bool> ReturnTableAsync(int id);
    Task<bool> DeleteTableAsync(int id);
    Task<MergeTablesResponse> MergeTablesAsync(List<int> tableIds);
    Task<bool> SplitTablesAsync(int groupId);
    Task<IEnumerable<MergedTableGroup>> GetMergedTablesAsync();
}
