using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models;

namespace RestaurantPOS.API.Services;

public class TableService : ITableService
{
    private readonly ApplicationDbContext _context;

    public TableService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Table>> GetAllTablesAsync()
    {
        return await _context.Tables.AsNoTracking().ToListAsync();
    }

    public async Task<Table?> GetTableByIdAsync(int id)
    {
        return await _context.Tables.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<IEnumerable<Table>> GetAvailableTablesAsync()
    {
        return await _context.Tables.AsNoTracking().Where(t => t.IsAvailable).ToListAsync();
    }

    public async Task<IEnumerable<Table>> GetTablesByFloorAsync(string floor)
    {
        return await _context.Tables.AsNoTracking().Where(t => t.Floor == floor).ToListAsync();
    }

    public async Task<Table> CreateTableAsync(Table table)
    {
        _context.Tables.Add(table);
        await _context.SaveChangesAsync();
        return table;
    }

    public async Task<Table?> UpdateTableAsync(int id, Table table)
    {
        var existing = await _context.Tables.FindAsync(id);
        if (existing == null) return null;

        existing.TableNumber = table.TableNumber;
        existing.Capacity = table.Capacity;
        existing.Floor = table.Floor;
        existing.IsAvailable = table.IsAvailable;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> UpdateTableAvailabilityAsync(int id, bool isAvailable)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null) return false;

        table.IsAvailable = isAvailable;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ReturnTableAsync(int id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null) return false;

        var hasPendingOrders = await _context.Orders
            .AnyAsync(o => o.TableId == id && (o.Status == "Pending" || o.Status == "Processing"));

        if (hasPendingOrders)
            throw new InvalidOperationException("Không thể trả bàn khi còn đơn hàng chưa hoàn thành");

        table.IsAvailable = true;
        table.OccupiedAt = null;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteTableAsync(int id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null) return false;

        _context.Tables.Remove(table);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<MergeTablesResponse> MergeTablesAsync(List<int> tableIds)
    {
        if (tableIds.Count < 2)
            throw new ArgumentException("Cần ít nhất 2 bàn để ghép");

        var tables = await _context.Tables
            .Where(t => tableIds.Contains(t.Id))
            .ToListAsync();

        if (tables.Count != tableIds.Count)
            throw new KeyNotFoundException("Một số bàn không tồn tại");

        if (tables.Any(t => !t.IsAvailable))
            throw new InvalidOperationException("Tất cả bàn phải trống để ghép");

        var groupId = DateTime.UtcNow.Ticks.GetHashCode();
        var tableNumbers = string.Join(",", tables.Select(t => t.TableNumber));

        foreach (var table in tables)
        {
            table.IsMerged = true;
            table.MergedGroupId = groupId;
            table.MergedTableNumbers = tableNumbers;
            table.IsAvailable = false;
        }

        await _context.SaveChangesAsync();

        return new MergeTablesResponse
        {
            GroupId = groupId,
            TableNumbers = tableNumbers,
            TotalCapacity = tables.Sum(t => t.Capacity),
            TableCount = tables.Count
        };
    }

    public async Task<bool> SplitTablesAsync(int groupId)
    {
        var tables = await _context.Tables
            .Where(t => t.MergedGroupId == groupId)
            .ToListAsync();

        if (tables.Count == 0) return false;

        var hasPendingOrders = await _context.Orders
            .AnyAsync(o => o.OrderGroupId == groupId && o.Status == "Pending");

        if (hasPendingOrders)
            throw new InvalidOperationException("Không thể tách bàn khi còn đơn hàng đang xử lý");

        foreach (var table in tables)
        {
            table.IsMerged = false;
            table.MergedGroupId = null;
            table.MergedTableNumbers = null;
            table.IsAvailable = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<MergedTableGroup>> GetMergedTablesAsync()
    {
        return await _context.Tables
            .Where(t => t.IsMerged)
            .GroupBy(t => t.MergedGroupId)
            .Select(g => new MergedTableGroup
            {
                GroupId = g.Key ?? 0,
                TableNumbers = g.First().MergedTableNumbers,
                TotalCapacity = g.Sum(t => t.Capacity),
                TableCount = g.Count(),
                IsOccupied = !g.First().IsAvailable
            })
            .ToListAsync();
    }
}
