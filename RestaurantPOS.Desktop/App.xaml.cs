using System.Net.Http;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http;
using RestaurantPOS.Desktop.ViewModels;
using RestaurantPOS.Desktop.Views;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application
{
    public new static App Current => (App)Application.Current;
    public IServiceProvider Services { get; }

    public App()
    {
        Services = ConfigureServices();
        this.DispatcherUnhandledException += App_DispatcherUnhandledException;
        TaskScheduler.UnobservedTaskException += TaskScheduler_UnobservedTaskException;
        AppDomain.CurrentDomain.UnhandledException += CurrentDomain_UnhandledException;
    }

    private void App_DispatcherUnhandledException(object sender, System.Windows.Threading.DispatcherUnhandledExceptionEventArgs e)
    {
        try
        {
            var toast = Services.GetService(typeof(RestaurantPOS.Desktop.Services.IToastService)) as RestaurantPOS.Desktop.Services.IToastService;
            toast?.ShowError($"Lỗi không xác định: {e.Exception.Message}");
        }
        catch { }
        finally
        {
            e.Handled = true; // tránh crash app
        }
    }

    private void TaskScheduler_UnobservedTaskException(object? sender, UnobservedTaskExceptionEventArgs e)
    {
        try
        {
            var toast = Services.GetService(typeof(RestaurantPOS.Desktop.Services.IToastService)) as RestaurantPOS.Desktop.Services.IToastService;
            toast?.ShowError($"Lỗi nền: {e.Exception.Message}");
        }
        catch { }
        finally
        {
            e.SetObserved();
        }
    }

    private void CurrentDomain_UnhandledException(object? sender, UnhandledExceptionEventArgs e)
    {
        try
        {
            var ex = e.ExceptionObject as Exception;
            var toast = Services.GetService(typeof(RestaurantPOS.Desktop.Services.IToastService)) as RestaurantPOS.Desktop.Services.IToastService;
            toast?.ShowError($"Sự cố nghiêm trọng: {ex?.Message}");
        }
        catch { }
    }

    private static IServiceProvider ConfigureServices()
    {
        var services = new ServiceCollection();

        // Services
        services.AddSingleton<IAuthenticationService>(sp =>
        {
            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:5000/")
            };
            return new AuthenticationService(httpClient);
        });

        services.AddSingleton<ITableService>(sp =>
        {
            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:5000/")
            };
            var authService = sp.GetRequiredService<IAuthenticationService>();
            return new TableService(httpClient, authService);
        });

        services.AddSingleton<IProductService>(sp =>
        {
            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:5000/")
            };
            var authService = sp.GetRequiredService<IAuthenticationService>();
            return new ProductService(httpClient, authService);
        });

        services.AddSingleton<IOrderService>(sp =>
        {
            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:5000/")
            };
            var authService = sp.GetRequiredService<IAuthenticationService>();
            return new OrderService(httpClient, authService);
        });

        services.AddSingleton<IUserService>(sp =>
        {
            var httpClient = new HttpClient
            {
                BaseAddress = new Uri("http://localhost:5000/")
            };
            var authService = sp.GetRequiredService<IAuthenticationService>();
            return new UserService(httpClient, authService);
        });

        // Toast Service (thông báo tự động ẩn)
        services.AddSingleton<IToastService, ToastService>();

        // ViewModels
        services.AddSingleton<MainViewModel>();
        services.AddTransient<LoginViewModel>();
        services.AddTransient<DashboardViewModel>();
        services.AddTransient<TableManagementViewModel>();
        services.AddTransient<OrderListViewModel>();
        services.AddTransient<CreateOrderViewModel>();
        services.AddTransient<OrderDetailViewModel>();
        services.AddTransient<UserManagementViewModel>();

        // Views
        services.AddTransient<MainWindow>();

        return services.BuildServiceProvider();
    }

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        var mainWindow = Services.GetRequiredService<MainWindow>();
        mainWindow.DataContext = Services.GetRequiredService<MainViewModel>();
        mainWindow.Show();
    }
}
