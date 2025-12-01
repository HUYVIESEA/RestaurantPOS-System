using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;

namespace RestaurantPOS.API.Services
{
    public class FirebaseService : IFirebaseService
    {
        private readonly ILogger<FirebaseService> _logger;

        public FirebaseService(ILogger<FirebaseService> logger)
        {
            _logger = logger;
        }

        public async Task<string> SendNotificationAsync(string title, string body, string deviceToken, Dictionary<string, string>? data = null)
        {
            try
            {
                var message = new Message()
                {
                    Token = deviceToken,
                    Notification = new Notification()
                    {
                        Title = title,
                        Body = body
                    },
                    Data = data
                };

                string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                _logger.LogInformation($"Successfully sent message: {response}");
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending notification: {ex.Message}");
                throw;
            }
        }

        public async Task<string> SendMulticastNotificationAsync(string title, string body, List<string> deviceTokens, Dictionary<string, string>? data = null)
        {
            try
            {
                var message = new MulticastMessage()
                {
                    Tokens = deviceTokens,
                    Notification = new Notification()
                    {
                        Title = title,
                        Body = body
                    },
                    Data = data
                };

                BatchResponse response = await FirebaseMessaging.DefaultInstance.SendMulticastAsync(message);
                _logger.LogInformation($"{response.SuccessCount} messages were sent successfully");
                return $"{response.SuccessCount} messages sent";
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending multicast notification: {ex.Message}");
                throw;
            }
        }

        public async Task SubscribeToTopicAsync(List<string> deviceTokens, string topic)
        {
            try
            {
                TopicManagementResponse response = await FirebaseMessaging.DefaultInstance.SubscribeToTopicAsync(deviceTokens, topic);
                _logger.LogInformation($"{response.SuccessCount} tokens were subscribed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error subscribing to topic: {ex.Message}");
                throw;
            }
        }

        public async Task UnsubscribeFromTopicAsync(List<string> deviceTokens, string topic)
        {
            try
            {
                TopicManagementResponse response = await FirebaseMessaging.DefaultInstance.UnsubscribeFromTopicAsync(deviceTokens, topic);
                _logger.LogInformation($"{response.SuccessCount} tokens were unsubscribed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error unsubscribing from topic: {ex.Message}");
                throw;
            }
        }

        public async Task<string> SendTopicNotificationAsync(string title, string body, string topic, Dictionary<string, string>? data = null)
        {
            try
            {
                var message = new Message()
                {
                    Topic = topic,
                    Notification = new Notification()
                    {
                        Title = title,
                        Body = body
                    },
                    Data = data
                };

                string response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                _logger.LogInformation($"Successfully sent topic message: {response}");
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending topic notification: {ex.Message}");
                throw;
            }
        }
    }
}
