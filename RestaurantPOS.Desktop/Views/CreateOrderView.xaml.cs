using System.Windows.Controls;
using RestaurantPOS.Desktop.ViewModels;

namespace RestaurantPOS.Desktop.Views;

public partial class CreateOrderView : UserControl
{
    public CreateOrderView()
    {
        InitializeComponent();
        Loaded += CreateOrderView_Loaded;
    }

    private async void CreateOrderView_Loaded(object sender, System.Windows.RoutedEventArgs e)
    {
        if (DataContext is CreateOrderViewModel viewModel)
        {
            await viewModel.InitializeCommand.ExecuteAsync(null);
        }
    }
}
