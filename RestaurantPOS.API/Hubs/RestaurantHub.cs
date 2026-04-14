using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace RestaurantPOS.API.Hubs
{
    public class RestaurantHub : Hub<IRestaurantClient>
    {
        public async Task SendMessage(string user, string message)
        {
            await Clients.All.ReceiveMessage(user, message);
        }

        public async Task JoinRoleGroup(string roleName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roleName);
        }

        public async Task LeaveRoleGroup(string roleName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roleName);
        }
    }
}
