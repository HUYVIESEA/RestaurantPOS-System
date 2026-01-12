namespace RestaurantPOS.API.Models.DTOs
{
    public class BigDataStoreRevenueDto
    {
        public string StoreId { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
    }

    public class BigDataProductSalesDto
    {
        public string ProductName { get; set; } = string.Empty;
        public int TotalSold { get; set; }
    }

    public class BigDataMonthlyRevenueDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal MonthlySales { get; set; }
    }
}
