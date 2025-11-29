namespace RestaurantPOS.Desktop.Services
{
    public interface ISignalRService
    {
        Task ConnectAsync();
        Task DisconnectAsync();
        event Action OnTableUpdated;
        event Action<int> OnOrderCreated;
        event Action<int> OnOrderUpdated;
        event Action<int> OnOrderCompleted;
    }
}
