using System.Windows.Controls;
using RestaurantPOS.Desktop.ViewModels;

namespace RestaurantPOS.Desktop.Views;

public partial class OrderListView : UserControl
{
    public OrderListView()
    {
        InitializeComponent();
        Loaded += OrderListView_Loaded;
    }

    private async void OrderListView_Loaded(object sender, System.Windows.RoutedEventArgs e)
    {
        if (DataContext is OrderListViewModel viewModel)
        {
            await viewModel.LoadOrdersCommand.ExecuteAsync(null);
        }
    }
}
