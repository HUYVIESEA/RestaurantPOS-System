using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantPOS.API.Models.DTOs;
using RestaurantPOS.API.Services;

namespace RestaurantPOS.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        // GET: api/Reports/revenue?startDate=2024-01-01&endDate=2024-01-31
        [HttpGet("revenue")]
        public async Task<ActionResult<RevenueReportDto>> GetRevenueReport(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportService.GetRevenueReportAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating revenue report", error = ex.Message });
            }
        }

        // GET: api/Reports/revenue/daily?startDate=2024-01-01&endDate=2024-01-31
        [HttpGet("revenue/daily")]
        public async Task<ActionResult<List<DailyRevenueDto>>> GetDailyRevenue(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportService.GetDailyRevenueAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating daily revenue report", error = ex.Message });
            }
        }

        // GET: api/Reports/revenue/monthly?year=2024
        [HttpGet("revenue/monthly")]
        public async Task<ActionResult<List<MonthlyReportDto>>> GetMonthlyRevenue([FromQuery] int year)
        {
            try
            {
                var report = await _reportService.GetMonthlyRevenueAsync(year);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating monthly revenue report", error = ex.Message });
            }
        }

        // GET: api/Reports/products/top-selling?startDate=2024-01-01&endDate=2024-01-31&topCount=10
        [HttpGet("products/top-selling")]
        public async Task<ActionResult<List<ProductReportDto>>> GetTopSellingProducts(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] int topCount = 10)
        {
            try
            {
                var report = await _reportService.GetTopSellingProductsAsync(startDate, endDate, topCount);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating top selling products report", error = ex.Message });
            }
        }

        // GET: api/Reports/products/performance?startDate=2024-01-01&endDate=2024-01-31
        [HttpGet("products/performance")]
        public async Task<ActionResult<List<ProductReportDto>>> GetProductPerformance(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportService.GetProductPerformanceAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating product performance report", error = ex.Message });
            }
        }

        // GET: api/Reports/products/5?startDate=2024-01-01&endDate=2024-01-31
        [HttpGet("products/{productId}")]
        public async Task<ActionResult<ProductReportDto>> GetProductReport(
            int productId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportService.GetProductReportByIdAsync(productId, startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating product report", error = ex.Message });
            }
        }

        // GET: api/Reports/orders/statistics?startDate=2024-01-01&endDate=2024-01-31
        [HttpGet("orders/statistics")]
        public async Task<ActionResult<OrderStatisticsDto>> GetOrderStatistics(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportService.GetOrderStatisticsAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating order statistics", error = ex.Message });
            }
        }

        // GET: api/Reports/orders/hourly?date=2024-01-15
        [HttpGet("orders/hourly")]
        public async Task<ActionResult<List<HourlyReportDto>>> GetHourlyOrders([FromQuery] DateTime date)
        {
            try
            {
                var report = await _reportService.GetHourlyOrdersAsync(date);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating hourly orders report", error = ex.Message });
            }
        }

        // GET: api/Reports/orders/weekly?startDate=2024-01-01
        [HttpGet("orders/weekly")]
        public async Task<ActionResult<List<WeeklyReportDto>>> GetWeeklyOrders([FromQuery] DateTime startDate)
        {
            try
            {
                var report = await _reportService.GetWeeklyOrdersAsync(startDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating weekly orders report", error = ex.Message });
            }
        }

        // GET: api/Reports/tables/performance?startDate=2024-01-01&endDate=2024-01-31
        [HttpGet("tables/performance")]
        public async Task<ActionResult<List<TablePerformanceDto>>> GetTablePerformance(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportService.GetTablePerformanceAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating table performance report", error = ex.Message });
            }
        }

        // GET: api/Reports/categories?startDate=2024-01-01&endDate=2024-01-31
        [HttpGet("categories")]
        public async Task<ActionResult<List<CategoryReportDto>>> GetCategoryReport(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var report = await _reportService.GetCategoryReportAsync(startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating category report", error = ex.Message });
            }
        }

        // GET: api/Reports/summary
        [HttpGet("summary")]
        public async Task<ActionResult<SalesSummaryDto>> GetSalesSummary()
        {
            try
            {
                var report = await _reportService.GetSalesSummaryAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating sales summary", error = ex.Message });
            }
        }

        // POST: api/Reports/export/pdf
        [HttpPost("export/pdf")]
        public async Task<IActionResult> ExportToPdf([FromBody] ExportRequestDto request)
        {
            try
            {
                var pdfBytes = await _reportService.ExportToPdfAsync(
                    request.ReportType,
                    request.StartDate,
                    request.EndDate);

                return File(pdfBytes, "application/pdf", $"Report_{DateTime.Now:yyyyMMdd}.pdf");
            }
            catch (NotImplementedException)
            {
                return StatusCode(501, new { message = "PDF export feature will be available in future version" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error exporting to PDF", error = ex.Message });
            }
        }

        // POST: api/Reports/export/excel
        [HttpPost("export/excel")]
        public async Task<IActionResult> ExportToExcel([FromBody] ExportRequestDto request)
        {
            try
            {
                var excelBytes = await _reportService.ExportToExcelAsync(
                    request.ReportType,
                    request.StartDate,
                    request.EndDate);

                return File(excelBytes, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"Report_{DateTime.Now:yyyyMMdd}.xlsx");
            }
            catch (NotImplementedException)
            {
                return StatusCode(501, new { message = "Excel export feature will be available in future version" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error exporting to Excel", error = ex.Message });
            }
        }
    }
}
