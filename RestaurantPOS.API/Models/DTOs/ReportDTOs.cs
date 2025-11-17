namespace RestaurantPOS.API.Models.DTOs
{
    // Revenue Report DTOs
    public class RevenueReportDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public List<DailyRevenueDto> DailyRevenue { get; set; } = new();
    }

    public class DailyRevenueDto
    {
        public DateTime Date { get; set; }
        public decimal Revenue { get; set; }
        public int OrderCount { get; set; }
    }

    // Product Report DTOs
    public class ProductReportDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int TotalQuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AveragePrice { get; set; }
        public int OrderCount { get; set; }
    }

    // Order Statistics DTOs
    public class OrderStatisticsDto
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int PendingOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal CompletionRate { get; set; }
        public decimal CancellationRate { get; set; }
        public decimal AverageOrderValue { get; set; }
        public TimeSpan AveragePreparationTime { get; set; }
    }

    // Time-based Report DTOs
    public class HourlyReportDto
    {
        public int Hour { get; set; }
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
    }

    public class WeeklyReportDto
    {
        public string DayOfWeek { get; set; } = string.Empty;
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
    }

    public class MonthlyReportDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public int OrderCount { get; set; }
        public decimal Revenue { get; set; }
    }

    // Table Performance DTOs
    public class TablePerformanceDto
    {
        public int TableId { get; set; }
        public string TableNumber { get; set; } = string.Empty;
        public int TotalOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal UtilizationRate { get; set; }
    }

    // Category Report DTOs
    public class CategoryReportDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ProductCount { get; set; }
        public int TotalQuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal RevenuePercentage { get; set; }
    }

    // Sales Summary DTOs
    public class SalesSummaryDto
    {
        public DateTime ReportDate { get; set; }
        public decimal TodayRevenue { get; set; }
        public decimal YesterdayRevenue { get; set; }
        public decimal WeekRevenue { get; set; }
        public decimal MonthRevenue { get; set; }
        public decimal YearRevenue { get; set; }
        public int TodayOrders { get; set; }
        public int WeekOrders { get; set; }
        public int MonthOrders { get; set; }
        public List<ProductReportDto> TopProducts { get; set; } = new();
        public List<CategoryReportDto> CategoryBreakdown { get; set; } = new();
    }

    // Report Request DTOs
    public class ReportRequestDto
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ReportType { get; set; } = string.Empty; // Daily, Weekly, Monthly, Custom
        public int? CategoryId { get; set; }
        public int? ProductId { get; set; }
    }

    // Export Request DTOs
    public class ExportRequestDto
    {
        public string ReportType { get; set; } = string.Empty; // Revenue, Products, Orders, etc.
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Format { get; set; } = "PDF"; // PDF, Excel, CSV
    }
}
