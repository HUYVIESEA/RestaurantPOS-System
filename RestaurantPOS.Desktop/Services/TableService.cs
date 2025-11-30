using System.Net.Http;
using System.Net.Http.Json;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Services;

public class TableService : ITableService
{
    private readonly HttpClient _httpClient;
    private readonly IAuthenticationService _authService;

    public TableService(HttpClient httpClient, IAuthenticationService authService)
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

    public async Task<List<TableDto>> GetTablesAsync()
    {
        try
        {
            AddAuthorizationHeader();
            var tables = await _httpClient.GetFromJsonAsync<List<TableDto>>("api/Tables");
            return tables ?? new List<TableDto>();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TableService: Error getting tables - {ex.Message}");
            return new List<TableDto>();
        }
    }

    public async Task<TableDto?> GetTableByIdAsync(int id)
    {
        try
        {
            AddAuthorizationHeader();
            var table = await _httpClient.GetFromJsonAsync<TableDto>($"api/Tables/{id}");
            return table;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TableService: Error getting table {id} - {ex.Message}");
            return null;
        }
    }

    public async Task<bool> UpdateTableStatusAsync(int id, string status)
    {
        try
        {
            AddAuthorizationHeader();
            var request = new UpdateTableStatusRequest { Status = status };
            var response = await _httpClient.PutAsJsonAsync($"api/Tables/{id}/status", request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TableService: Error updating table status - {ex.Message}");
            return false;
        }
    }

    public async Task<bool> AssignOrderToTableAsync(int tableId, int orderId)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PutAsJsonAsync($"api/Tables/{tableId}/assign-order", new { orderId });
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TableService: Error assigning order to table - {ex.Message}");
            return false;
        }
    }

    public async Task<bool> MergeTablesAsync(List<int> tableIds)
    {
        try
        {
            AddAuthorizationHeader();
            var request = new MergeTablesRequest { TableIds = tableIds };
            var response = await _httpClient.PostAsJsonAsync("api/Tables/Merge", request);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TableService: Error merging tables - {ex.Message}");
            return false;
        }
    }

    public async Task<bool> SplitTablesAsync(int groupId)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PostAsync($"api/Tables/Split/{groupId}", null);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TableService: Error splitting tables - {ex.Message}");
            return false;
        }
    }

    public async Task<TableDto?> CreateTableAsync(TableDto table)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PostAsJsonAsync("api/Tables", table);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadFromJsonAsync<TableDto>();
            }
            return null;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TableService: Error creating table - {ex.Message}");
            return null;
        }
    }

    public async Task<bool> UpdateTableAsync(TableDto table)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.PutAsJsonAsync($"api/Tables/{table.Id}", table);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TableService: Error updating table {table.Id} - {ex.Message}");
            return false;
        }
    }

    public async Task<bool> DeleteTableAsync(int id)
    {
        try
        {
            AddAuthorizationHeader();
            var response = await _httpClient.DeleteAsync($"api/Tables/{id}");
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"TableService: Error deleting table {id} - {ex.Message}");
            return false;
        }
    }
}
