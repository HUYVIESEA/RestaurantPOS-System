using System.ComponentModel;
using System.Collections.ObjectModel;
using System.Windows.Controls;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.Views.Dialogs
{
    public partial class TakeAwaySelectionDialog : UserControl
    {
        public TakeAwaySelectionDialog()
        {
            InitializeComponent();
        }
    }

    public class TakeAwaySelectionViewModel : INotifyPropertyChanged
    {
        private bool _isLoading;
        public bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); }
        }

        private ObservableCollection<Order> _activeOrders = new ObservableCollection<Order>();
        public ObservableCollection<Order> ActiveOrders 
        { 
            get => _activeOrders;
            set { _activeOrders = value; OnPropertyChanged(); }
        }

        public ICommand SelectOrderCommand { get; set; }
        public ICommand CreateNewOrderCommand { get; set; }

        public TakeAwaySelectionViewModel(ICommand selectOrderCommand, ICommand createNewOrderCommand)
        {
            ActiveOrders = new ObservableCollection<Order>();
            SelectOrderCommand = selectOrderCommand;
            CreateNewOrderCommand = createNewOrderCommand;
            IsLoading = true; // Default to loading
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
