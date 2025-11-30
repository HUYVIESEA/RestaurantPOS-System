namespace RestaurantPOS.Desktop.Models;

public record DailyRevenueDto(string Day, decimal Amount);

public record TopSellingItemDto(string ProductName, int Quantity, decimal TotalRevenue);
