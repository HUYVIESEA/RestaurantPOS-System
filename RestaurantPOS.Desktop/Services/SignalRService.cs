using Microsoft.AspNetCore.SignalR.Client;
using System.Windows;
using CommunityToolkit.Mvvm.Messaging;
using RestaurantPOS.Desktop.Messages;

namespace RestaurantPOS.Desktop.Services
{
    public class SignalRService : ISignalRService
    {
        private readonly HubConnection _hubConnection;
        private const string HUB_URL = "http://localhost:5000/restaurantHub";

        public event Action? OnTableUpdated;
        public event Action<int>? OnOrderCreated;
        public event Action<int>? OnOrderUpdated;
        public event Action<int>? OnOrderCompleted;

        public SignalRService()
        {
            _hubConnection = new HubConnectionBuilder()
                .WithUrl(HUB_URL)
                .WithAutomaticReconnect()
                .Build();

            _hubConnection.On("TableUpdated", () => 
            {
                Application.Current.Dispatcher.Invoke(() => 
                {
                    OnTableUpdated?.Invoke();
                    WeakReferenceMessenger.Default.Send(new TableUpdatedMessage());
                });
            });

            _hubConnection.On<int>("OrderCreated", (id) => 
            {
                Application.Current.Dispatcher.Invoke(() => OnOrderCreated?.Invoke(id));
            });

            _hubConnection.On<int>("OrderUpdated", (id) => 
            {
                Application.Current.Dispatcher.Invoke(() => OnOrderUpdated?.Invoke(id));
            });

            _hubConnection.On<int>("OrderCompleted", (id) => 
            {
                Application.Current.Dispatcher.Invoke(() => OnOrderCompleted?.Invoke(id));
            });
            
            _hubConnection.Closed += async (error) =>
            {
                System.Diagnostics.Debug.WriteLine($"SignalR Closed: {error?.Message}");
                await Task.Delay(new Random().Next(0,5) * 1000);
                try { await ConnectAsync(); } catch { }
            };
        }

        public async Task ConnectAsync()
        {
            if (_hubConnection.State == HubConnectionState.Disconnected)
            {
                try
                {
                    await _hubConnection.StartAsync();
                    System.Diagnostics.Debug.WriteLine("SignalR Connected");
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine($"SignalR Connection Error: {ex.Message}");
                }
            }
        }

        public async Task DisconnectAsync()
        {
            await _hubConnection.StopAsync();
        }
    }
}
