using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RestaurantPOS.Desktop.Models
{
    public class RevenueReportDto
    {
        [JsonPropertyName("date")]
        public DateTime Date { get; set; }

        [JsonPropertyName("totalRevenue")]
        public decimal TotalRevenue { get; set; }

        [JsonPropertyName("orderCount")]
        public int OrderCount { get; set; }
    }

    public class ProductReportDto
    {
        [JsonPropertyName("productId")]
        public int ProductId { get; set; }

        [JsonPropertyName("productName")]
        public string ProductName { get; set; } = string.Empty;

        [JsonPropertyName("quantitySold")]
        public int QuantitySold { get; set; }

        [JsonPropertyName("totalRevenue")]
        public decimal TotalRevenue { get; set; }
    }

    public class CategoryReportDto
    {
        [JsonPropertyName("categoryName")]
        public string CategoryName { get; set; } = string.Empty;

        [JsonPropertyName("totalRevenue")]
        public decimal TotalRevenue { get; set; }

        [JsonPropertyName("percentage")]
        public double Percentage { get; set; }
    }

    public class SalesSummaryDto
    {
        [JsonPropertyName("reportDate")]
        public DateTime ReportDate { get; set; }

        [JsonPropertyName("todayRevenue")]
        public decimal TodayRevenue { get; set; }

        [JsonPropertyName("yesterdayRevenue")]
        public decimal YesterdayRevenue { get; set; }

        [JsonPropertyName("weekRevenue")]
        public decimal WeekRevenue { get; set; }

        [JsonPropertyName("monthRevenue")]
        public decimal MonthRevenue { get; set; }

        [JsonPropertyName("yearRevenue")]
        public decimal YearRevenue { get; set; }

        [JsonPropertyName("todayOrders")]
        public int TodayOrders { get; set; }

        [JsonPropertyName("weekOrders")]
        public int WeekOrders { get; set; }

        [JsonPropertyName("monthOrders")]
        public int MonthOrders { get; set; }

        [JsonPropertyName("topProducts")]
        public List<ProductReportDto> TopProducts { get; set; } = new();

        [JsonPropertyName("categoryBreakdown")]
        public List<CategoryReportDto> CategoryBreakdown { get; set; } = new();
    }
}
