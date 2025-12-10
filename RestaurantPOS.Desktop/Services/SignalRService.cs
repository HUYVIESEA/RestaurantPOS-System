using Microsoft.AspNetCore.SignalR.Client;

namespace RestaurantPOS.Desktop.Services
{
    public class SignalRService
    {
        private HubConnection _hubConnection;
        private static SignalRService? _instance;
        public static SignalRService Instance => _instance ??= new SignalRService();

        public event Action? OnDevicesUpdated;
        public event Action<string, string>? OnMessageReceived; // For future use

        private SignalRService()
        {
            _hubConnection = new HubConnectionBuilder()
                .WithUrl("http://localhost:5000/restaurantHub")
                .WithAutomaticReconnect()
                .Build();

            _hubConnection.On("DevicesUpdated", () =>
            {
                OnDevicesUpdated?.Invoke();
            });

             _hubConnection.On<string, string>("ReceiveMessage", (user, message) =>
            {
                OnMessageReceived?.Invoke(user, message);
            });
        }

        public async Task ConnectAsync()
        {
            try
            {
                if (_hubConnection.State == HubConnectionState.Disconnected)
                {
                    await _hubConnection.StartAsync();
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SignalR Connection Error: {ex.Message}");
            }
        }

        public async Task DisconnectAsync()
        {
            await _hubConnection.StopAsync();
        }
    }
}
