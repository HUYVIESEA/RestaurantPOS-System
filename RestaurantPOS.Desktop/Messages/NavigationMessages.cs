namespace RestaurantPOS.Desktop.Messages;

public class LoginSuccessMessage
{
    public Models.UserDto User { get; set; }

    public LoginSuccessMessage(Models.UserDto user)
    {
        User = user;
    }
}

public class LogoutMessage
{
}

public record NavigateToMessage(string ViewName, object? Parameter = null);
