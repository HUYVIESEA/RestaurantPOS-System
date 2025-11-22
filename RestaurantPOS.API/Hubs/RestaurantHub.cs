using Microsoft.AspNetCore.SignalR;

namespace RestaurantPOS.API.Hubs
{
    public class RestaurantHub : Hub
    {
        // Example method for clients to call if needed
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        // We can add more specific groups here later, e.g., "Kitchen", "Waiters"
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }
    }
}
