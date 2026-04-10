namespace RestaurantPOS.API.Models;

public class MergeTablesRequest
{
    public List<int> TableIds { get; set; } = new();
}

public class MergeTablesResponse
{
    public int GroupId { get; set; }
    public string TableNumbers { get; set; } = string.Empty;
    public int TotalCapacity { get; set; }
    public int TableCount { get; set; }
}

public class MergedTableGroup
{
    public int GroupId { get; set; }
    public string? TableNumbers { get; set; }
    public int TotalCapacity { get; set; }
    public int TableCount { get; set; }
    public bool IsOccupied { get; set; }
}
