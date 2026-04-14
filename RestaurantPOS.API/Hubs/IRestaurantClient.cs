namespace RestaurantPOS.API.Hubs
{
    public interface IRestaurantClient
    {
        Task OrderCreated(int orderId);
        Task OrderUpdated(int orderId);
        Task OrderCompleted(int orderId);
        Task TableUpdated();
        Task DevicesUpdated();
        Task ReceiveMessage(string user, string message);
        Task ReceiveNotification(string message);
    }
}
