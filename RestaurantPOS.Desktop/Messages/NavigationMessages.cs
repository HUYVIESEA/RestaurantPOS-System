namespace RestaurantPOS.Desktop.Messages;

public class LoginSuccessMessage
{
}

public class LogoutMessage
{
}

public record NavigateToMessage(string ViewName, object? Parameter = null);
