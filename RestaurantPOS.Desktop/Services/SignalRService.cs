using Microsoft.AspNetCore.SignalR.Client;
using RestaurantPOS.Desktop.Utilities;
using System;
using System.Threading.Tasks;

namespace RestaurantPOS.Desktop.Services
{
    public class SignalRService
    {
        private HubConnection _hubConnection;
        private static SignalRService? _instance;
        public static SignalRService Instance => _instance ??= new SignalRService();

        public event Action<int>? OrderCreated;
        public event Action<int>? OrderUpdated;
        public event Action<int>? OrderCompleted;
        public event Action<int>? TableUpdated;

        public event Action? OnDevicesUpdated;
        public event Action<string, string>? OnMessageReceived;

        public bool IsConnected => _hubConnection?.State == HubConnectionState.Connected;

        private SignalRService()
        {
            // Assuming localhost:5000/api -> localhost:5000/restaurantHub
            var hubUrl = Constants.ApiBaseUrl.Replace("/api", "/restaurantHub");

            _hubConnection = new HubConnectionBuilder()
                .WithUrl(hubUrl, options =>
                {
                    options.AccessTokenProvider = () => Task.FromResult(UserSession.Instance.Token);
                })
                .WithAutomaticReconnect()
                .Build();

            _hubConnection.On<int>("OrderCreated", (orderId) =>
            {
                System.Windows.Application.Current.Dispatcher.Invoke(() => OrderCreated?.Invoke(orderId));
            });

            _hubConnection.On<int>("OrderUpdated", (orderId) =>
            {
                 System.Windows.Application.Current.Dispatcher.Invoke(() => OrderUpdated?.Invoke(orderId));
            });

            _hubConnection.On<int>("OrderCompleted", (orderId) =>
            {
                 System.Windows.Application.Current.Dispatcher.Invoke(() => OrderCompleted?.Invoke(orderId));
            });
            
            _hubConnection.On<int>("TableUpdated", (tableId) =>
            {
                 System.Windows.Application.Current.Dispatcher.Invoke(() => TableUpdated?.Invoke(tableId));
            });

            _hubConnection.On("DevicesUpdated", () =>
            {
                System.Windows.Application.Current.Dispatcher.Invoke(() => OnDevicesUpdated?.Invoke());
            });

             _hubConnection.On<string, string>("ReceiveMessage", (user, message) =>
            {
                System.Windows.Application.Current.Dispatcher.Invoke(() => OnMessageReceived?.Invoke(user, message));
            });
        }

        public async Task ConnectAsync()
        {
            try
            {
                if (_hubConnection.State == HubConnectionState.Disconnected)
                {
                    await _hubConnection.StartAsync();
                    System.Diagnostics.Debug.WriteLine($"SignalR Connected. ID: {_hubConnection.ConnectionId}");
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"SignalR Connection Error: {ex.Message}");
            }
        }

        public async Task DisconnectAsync()
        {
            if (_hubConnection != null)
            {
                 await _hubConnection.StopAsync();
            }
        }
    }
}
