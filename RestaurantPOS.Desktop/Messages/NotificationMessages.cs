namespace RestaurantPOS.Desktop.Messages
{
    public record ShowToastMessage(string Message, string Type = "Success"); // Type: Success, Error, Warning
}
