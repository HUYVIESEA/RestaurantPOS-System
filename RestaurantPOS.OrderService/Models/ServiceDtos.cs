namespace RestaurantPOS.OrderService.Models;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public bool IsAvailable { get; set; }
    public int StockQuantity { get; set; }
}

public class StockCheckResult
{
    public int ProductId { get; set; }
    public bool IsAvailable { get; set; }
    public int CurrentStock { get; set; }
    public decimal Price { get; set; }
}
