namespace RestaurantPOS.Desktop.Services
{
    public class UserSession
    {
        private static UserSession? _instance;
        public static UserSession Instance => _instance ??= new UserSession();

        public string? Token { get; private set; }
        public string? Username { get; private set; }
        public string? Role { get; private set; }

        private UserSession() { }

        public void SetSession(string token, string username, string role)
        {
            Token = token;
            Username = username;
            Role = role;
        }

        public void ClearSession()
        {
            Token = null;
            Username = null;
            Role = null;
        }
    }
}
