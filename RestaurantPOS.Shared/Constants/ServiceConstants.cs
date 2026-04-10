namespace RestaurantPOS.Shared.Constants;

public static class ServicePorts
{
    public const int ApiGateway = 8080;
    public const int OrderService = 5001;
    public const int ProductService = 5002;
    public const int PaymentService = 5003;
    public const int NotificationService = 5004;
    public const int AuthService = 5005;
}

public static class ServiceNames
{
    public const string Order = "order-service";
    public const string Product = "product-service";
    public const string Payment = "payment-service";
    public const string Notification = "notification-service";
    public const string Auth = "auth-service";
}
