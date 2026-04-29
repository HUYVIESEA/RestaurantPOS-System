namespace RestaurantPOS.API.Hubs
{
    public interface IRestaurantClient
    {
        Task OrderCreated(int orderId);
        Task OrderUpdated(int orderId);
        Task OrderCompleted(int orderId);
        Task TableUpdated(int tableId);
        Task DevicesUpdated();
        Task ReceiveMessage(string user, string message);
        Task ReceiveNotification(string message);
    }
}
