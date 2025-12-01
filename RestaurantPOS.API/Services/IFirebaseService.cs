namespace RestaurantPOS.API.Services
{
    public interface IFirebaseService
    {
        Task<string> SendNotificationAsync(string title, string body, string deviceToken, Dictionary<string, string>? data = null);
        Task<string> SendMulticastNotificationAsync(string title, string body, List<string> deviceTokens, Dictionary<string, string>? data = null);
        Task SubscribeToTopicAsync(List<string> deviceTokens, string topic);
        Task UnsubscribeFromTopicAsync(List<string> deviceTokens, string topic);
        Task<string> SendTopicNotificationAsync(string title, string body, string topic, Dictionary<string, string>? data = null);
    }
}
