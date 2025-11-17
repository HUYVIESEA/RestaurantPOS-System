using Microsoft.EntityFrameworkCore;
using RestaurantPOS.API.Data;
using RestaurantPOS.API.Models.DTOs;

namespace RestaurantPOS.API.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Revenue Reports
        public async Task<RevenueReportDto> GetRevenueReportAsync(DateTime startDate, DateTime endDate)
        {
            var orders = await _context.Orders
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status == "Completed")
                .ToListAsync();

            var dailyRevenue = orders
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key,
                    Revenue = g.Sum(o => o.TotalAmount),
                    OrderCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            var totalRevenue = orders.Sum(o => o.TotalAmount);
            var totalOrders = orders.Count;

            return new RevenueReportDto
            {
                StartDate = startDate,
                EndDate = endDate,
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                AverageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0,
                DailyRevenue = dailyRevenue
            };
        }

        public async Task<List<DailyRevenueDto>> GetDailyRevenueAsync(DateTime startDate, DateTime endDate)
        {
            var orders = await _context.Orders
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status == "Completed")
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new DailyRevenueDto
                {
                    Date = g.Key,
                    Revenue = g.Sum(o => o.TotalAmount),
                    OrderCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToListAsync();

            return orders;
        }

        public async Task<List<MonthlyReportDto>> GetMonthlyRevenueAsync(int year)
        {
            var orders = await _context.Orders
                .Where(o => o.OrderDate.Year == year && o.Status == "Completed")
                .GroupBy(o => o.OrderDate.Month)
                .Select(g => new MonthlyReportDto
                {
                    Month = g.Key,
                    Year = year,
                    OrderCount = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(m => m.Month)
                .ToListAsync();

            return orders;
        }

        // Product Reports
        public async Task<List<ProductReportDto>> GetTopSellingProductsAsync(DateTime startDate, DateTime endDate, int topCount = 10)
        {
            var productStats = await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Product)
                    .ThenInclude(p => p.Category)
                .Where(oi => oi.Order.OrderDate >= startDate && 
                            oi.Order.OrderDate <= endDate && 
                            oi.Order.Status == "Completed")
                .GroupBy(oi => new { oi.ProductId, ProductName = oi.Product.Name, CategoryName = oi.Product.Category.Name })
                .Select(g => new ProductReportDto
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    CategoryName = g.Key.CategoryName,
                    TotalQuantitySold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                    AveragePrice = g.Average(oi => oi.UnitPrice),
                    OrderCount = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .OrderByDescending(p => p.TotalQuantitySold)
                .Take(topCount)
                .ToListAsync();

            return productStats;
        }

        public async Task<List<ProductReportDto>> GetProductPerformanceAsync(DateTime startDate, DateTime endDate)
        {
            var productStats = await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Product)
                    .ThenInclude(p => p.Category)
                .Where(oi => oi.Order.OrderDate >= startDate && 
                            oi.Order.OrderDate <= endDate && 
                            oi.Order.Status == "Completed")
                .GroupBy(oi => new { oi.ProductId, ProductName = oi.Product.Name, CategoryName = oi.Product.Category.Name })
                .Select(g => new ProductReportDto
                {
                    ProductId = g.Key.ProductId,
                    ProductName = g.Key.ProductName,
                    CategoryName = g.Key.CategoryName,
                    TotalQuantitySold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                    AveragePrice = g.Average(oi => oi.UnitPrice),
                    OrderCount = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .OrderByDescending(p => p.TotalRevenue)
                .ToListAsync();

            return productStats;
        }

        public async Task<ProductReportDto> GetProductReportByIdAsync(int productId, DateTime startDate, DateTime endDate)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                throw new Exception("Product not found");

            var stats = await _context.OrderItems
                .Include(oi => oi.Order)
                .Where(oi => oi.ProductId == productId &&
                            oi.Order.OrderDate >= startDate &&
                            oi.Order.OrderDate <= endDate &&
                            oi.Order.Status == "Completed")
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    TotalQuantitySold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                    AveragePrice = g.Average(oi => oi.UnitPrice),
                    OrderCount = g.Select(oi => oi.OrderId).Distinct().Count()
                })
                .FirstOrDefaultAsync();

            return new ProductReportDto
            {
                ProductId = productId,
                ProductName = product.Name,
                CategoryName = product.Category?.Name ?? "N/A",
                TotalQuantitySold = stats?.TotalQuantitySold ?? 0,
                TotalRevenue = stats?.TotalRevenue ?? 0,
                AveragePrice = stats?.AveragePrice ?? 0,
                OrderCount = stats?.OrderCount ?? 0
            };
        }

        // Order Statistics
        public async Task<OrderStatisticsDto> GetOrderStatisticsAsync(DateTime startDate, DateTime endDate)
        {
            var orders = await _context.Orders
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .ToListAsync();

            var totalOrders = orders.Count;
            var completedOrders = orders.Count(o => o.Status == "Completed");
            var pendingOrders = orders.Count(o => o.Status == "Pending");
            var cancelledOrders = orders.Count(o => o.Status == "Cancelled");

            var completedOrdersData = orders.Where(o => o.Status == "Completed").ToList();
            var totalRevenue = completedOrdersData.Sum(o => o.TotalAmount);

            return new OrderStatisticsDto
            {
                TotalOrders = totalOrders,
                CompletedOrders = completedOrders,
                PendingOrders = pendingOrders,
                CancelledOrders = cancelledOrders,
                CompletionRate = totalOrders > 0 ? (decimal)completedOrders / totalOrders * 100 : 0,
                CancellationRate = totalOrders > 0 ? (decimal)cancelledOrders / totalOrders * 100 : 0,
                AverageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0,
                AveragePreparationTime = TimeSpan.FromMinutes(15) // TODO: Calculate from actual data
            };
        }

        public async Task<List<HourlyReportDto>> GetHourlyOrdersAsync(DateTime date)
        {
            var startOfDay = date.Date;
            var endOfDay = date.Date.AddDays(1);

            var hourlyData = await _context.Orders
                .Where(o => o.OrderDate >= startOfDay && o.OrderDate < endOfDay && o.Status == "Completed")
                .GroupBy(o => o.OrderDate.Hour)
                .Select(g => new HourlyReportDto
                {
                    Hour = g.Key,
                    OrderCount = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .OrderBy(h => h.Hour)
                .ToListAsync();

            return hourlyData;
        }

        public async Task<List<WeeklyReportDto>> GetWeeklyOrdersAsync(DateTime startDate)
        {
            var endDate = startDate.AddDays(7);

            var weeklyData = await _context.Orders
                .Where(o => o.OrderDate >= startDate && o.OrderDate < endDate && o.Status == "Completed")
                .GroupBy(o => o.OrderDate.DayOfWeek)
                .Select(g => new WeeklyReportDto
                {
                    DayOfWeek = g.Key.ToString(),
                    OrderCount = g.Count(),
                    Revenue = g.Sum(o => o.TotalAmount)
                })
                .ToListAsync();

            return weeklyData;
        }

        // Table Reports
        public async Task<List<TablePerformanceDto>> GetTablePerformanceAsync(DateTime startDate, DateTime endDate)
        {
            var tableStats = await _context.Orders
                .Include(o => o.Table)
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate && o.Status == "Completed")
                .GroupBy(o => new { o.TableId, o.Table.TableNumber })
                .Select(g => new TablePerformanceDto
                {
                    TableId = g.Key.TableId ?? 0,
                    TableNumber = g.Key.TableNumber ?? "N/A",
                    TotalOrders = g.Count(),
                    TotalRevenue = g.Sum(o => o.TotalAmount),
                    AverageOrderValue = g.Average(o => o.TotalAmount),
                    UtilizationRate = 0 // TODO: Calculate based on available hours
                })
                .OrderByDescending(t => t.TotalRevenue)
                .ToListAsync();

            return tableStats;
        }

        // Category Reports
        public async Task<List<CategoryReportDto>> GetCategoryReportAsync(DateTime startDate, DateTime endDate)
        {
            var categoryStats = await _context.OrderItems
                .Include(oi => oi.Order)
                .Include(oi => oi.Product)
                    .ThenInclude(p => p.Category)
                .Where(oi => oi.Order.OrderDate >= startDate && 
                            oi.Order.OrderDate <= endDate && 
                            oi.Order.Status == "Completed")
                .GroupBy(oi => new { oi.Product.CategoryId, CategoryName = oi.Product.Category.Name })
                .Select(g => new CategoryReportDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.CategoryName,
                    ProductCount = g.Select(oi => oi.ProductId).Distinct().Count(),
                    TotalQuantitySold = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                    RevenuePercentage = 0 // Calculate below
                })
                .ToListAsync();

            var totalRevenue = categoryStats.Sum(c => c.TotalRevenue);
            foreach (var category in categoryStats)
            {
                category.RevenuePercentage = totalRevenue > 0 ? category.TotalRevenue / totalRevenue * 100 : 0;
            }

            return categoryStats.OrderByDescending(c => c.TotalRevenue).ToList();
        }

        // Sales Summary
        public async Task<SalesSummaryDto> GetSalesSummaryAsync()
        {
            var today = DateTime.Today;
            var yesterday = today.AddDays(-1);
            var weekStart = today.AddDays(-(int)today.DayOfWeek);
            var monthStart = new DateTime(today.Year, today.Month, 1);
            var yearStart = new DateTime(today.Year, 1, 1);

            var todayRevenue = await GetRevenueForPeriodAsync(today, today.AddDays(1));
            var yesterdayRevenue = await GetRevenueForPeriodAsync(yesterday, today);
            var weekRevenue = await GetRevenueForPeriodAsync(weekStart, today.AddDays(1));
            var monthRevenue = await GetRevenueForPeriodAsync(monthStart, today.AddDays(1));
            var yearRevenue = await GetRevenueForPeriodAsync(yearStart, today.AddDays(1));

            var todayOrders = await GetOrderCountForPeriodAsync(today, today.AddDays(1));
            var weekOrders = await GetOrderCountForPeriodAsync(weekStart, today.AddDays(1));
            var monthOrders = await GetOrderCountForPeriodAsync(monthStart, today.AddDays(1));

            var topProducts = await GetTopSellingProductsAsync(monthStart, today.AddDays(1), 5);
            var categoryBreakdown = await GetCategoryReportAsync(monthStart, today.AddDays(1));

            return new SalesSummaryDto
            {
                ReportDate = today,
                TodayRevenue = todayRevenue,
                YesterdayRevenue = yesterdayRevenue,
                WeekRevenue = weekRevenue,
                MonthRevenue = monthRevenue,
                YearRevenue = yearRevenue,
                TodayOrders = todayOrders,
                WeekOrders = weekOrders,
                MonthOrders = monthOrders,
                TopProducts = topProducts,
                CategoryBreakdown = categoryBreakdown
            };
        }

        // Helper Methods
        private async Task<decimal> GetRevenueForPeriodAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Orders
                .Where(o => o.OrderDate >= startDate && o.OrderDate < endDate && o.Status == "Completed")
                .SumAsync(o => o.TotalAmount);
        }

        private async Task<int> GetOrderCountForPeriodAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Orders
                .Where(o => o.OrderDate >= startDate && o.OrderDate < endDate && o.Status == "Completed")
                .CountAsync();
        }

        // Export Functions (Placeholder - implement with libraries like iTextSharp for PDF, EPPlus for Excel)
        public async Task<byte[]> ExportToPdfAsync(string reportType, DateTime startDate, DateTime endDate)
        {
            // TODO: Implement PDF export using iTextSharp or similar library
            await Task.CompletedTask;
            throw new NotImplementedException("PDF export will be implemented in future version");
        }

        public async Task<byte[]> ExportToExcelAsync(string reportType, DateTime startDate, DateTime endDate)
        {
            // TODO: Implement Excel export using EPPlus or similar library
            await Task.CompletedTask;
            throw new NotImplementedException("Excel export will be implemented in future version");
        }
    }
}
