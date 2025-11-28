using System.Windows.Controls;
using RestaurantPOS.Desktop.ViewModels;

namespace RestaurantPOS.Desktop.Views;

public partial class TableManagementView : UserControl
{
    public TableManagementView()
    {
        InitializeComponent();
        Loaded += TableManagementView_Loaded;
    }

    private async void TableManagementView_Loaded(object sender, System.Windows.RoutedEventArgs e)
    {
        if (DataContext is TableManagementViewModel viewModel)
        {
            await viewModel.LoadTablesCommand.ExecuteAsync(null);
        }
    }
}
