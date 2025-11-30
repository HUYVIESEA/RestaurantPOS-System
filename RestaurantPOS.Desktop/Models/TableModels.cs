using CommunityToolkit.Mvvm.ComponentModel;

namespace RestaurantPOS.Desktop.Models;

public partial class TableDto : ObservableObject
{
    public int Id { get; set; }
    
    [System.Text.Json.Serialization.JsonPropertyName("tableNumber")]
    public string Name { get; set; } = string.Empty;
    
    public int Capacity { get; set; }
    
    private bool isAvailable;
    public bool IsAvailable 
    { 
        get => isAvailable; 
        set 
        {
            SetProperty(ref isAvailable, value);
            OnPropertyChanged(nameof(Status));
        }
    }

    public string Status 
    {
        get => IsAvailable ? "Available" : "Occupied";
        set => IsAvailable = (value == "Available");
    }

    public int? CurrentOrderId { get; set; }
    public DateTime? OccupiedAt { get; set; }
    public string? CurrentOrderNumber { get; set; }
    public decimal? CurrentOrderTotal { get; set; }
    
    public string Floor { get; set; } = "Tầng 1";

    [ObservableProperty]
    private string duration = "";

    public bool IsMerged { get; set; }
    public int? MergedGroupId { get; set; }
    public string? MergedTableNumbers { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    [ObservableProperty]
    private bool isSelected;
}

public class UpdateTableStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class MergeTablesRequest
{
    public List<int> TableIds { get; set; } = new();
}
