using RestaurantPOS.API.Models.DTOs;

namespace RestaurantPOS.API.Services
{
    public interface IReportService
    {
        // Revenue Reports
        Task<RevenueReportDto> GetRevenueReportAsync(DateTime startDate, DateTime endDate);
        Task<List<DailyRevenueDto>> GetDailyRevenueAsync(DateTime startDate, DateTime endDate);
        Task<List<MonthlyReportDto>> GetMonthlyRevenueAsync(int year);

        // Product Reports
        Task<List<ProductReportDto>> GetTopSellingProductsAsync(DateTime startDate, DateTime endDate, int topCount = 10);
        Task<List<ProductReportDto>> GetProductPerformanceAsync(DateTime startDate, DateTime endDate);
        Task<ProductReportDto> GetProductReportByIdAsync(int productId, DateTime startDate, DateTime endDate);

        // Order Statistics
        Task<OrderStatisticsDto> GetOrderStatisticsAsync(DateTime startDate, DateTime endDate);
        Task<List<HourlyReportDto>> GetHourlyOrdersAsync(DateTime date);
        Task<List<WeeklyReportDto>> GetWeeklyOrdersAsync(DateTime startDate);

        // Table Reports
        Task<List<TablePerformanceDto>> GetTablePerformanceAsync(DateTime startDate, DateTime endDate);

        // Category Reports
        Task<List<CategoryReportDto>> GetCategoryReportAsync(DateTime startDate, DateTime endDate);

        // Sales Summary
        Task<SalesSummaryDto> GetSalesSummaryAsync();

        // Export Functions
        Task<byte[]> ExportToPdfAsync(string reportType, DateTime startDate, DateTime endDate);
        Task<byte[]> ExportToExcelAsync(string reportType, DateTime startDate, DateTime endDate);
    }
}
