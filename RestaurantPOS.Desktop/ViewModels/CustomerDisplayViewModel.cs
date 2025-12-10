using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using RestaurantPOS.Desktop.Models;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class CustomerDisplayViewModel : INotifyPropertyChanged
    {
        private ObservableCollection<CartItem> _cartItems = new ObservableCollection<CartItem>();
        private decimal _totalAmount;
        private decimal _paymentAmount;
        private string _qrCodeUrl = string.Empty;
        private DisplayState _currentState = DisplayState.Idle;

        public enum DisplayState
        {
            Idle,
            Ordering,
            Payment
        }

        public ObservableCollection<CartItem> CartItems
        {
            get => _cartItems;
            set { _cartItems = value; OnPropertyChanged(); }
        }

        public decimal TotalAmount
        {
            get => _totalAmount;
            set { _totalAmount = value; OnPropertyChanged(); }
        }

        public decimal PaymentAmount
        {
            get => _paymentAmount;
            set { _paymentAmount = value; OnPropertyChanged(); }
        }

        public string QrCodeUrl
        {
            get => _qrCodeUrl;
            set { _qrCodeUrl = value; OnPropertyChanged(); }
        }

        public DisplayState CurrentState
        {
            get => _currentState;
            set 
            { 
                _currentState = value; 
                OnPropertyChanged();
                OnPropertyChanged(nameof(IsIdleVisible));
                OnPropertyChanged(nameof(IsOrderVisible));
                OnPropertyChanged(nameof(IsPaymentVisible));
            }
        }

        public Visibility IsIdleVisible => _currentState == DisplayState.Idle ? Visibility.Visible : Visibility.Collapsed;
        public Visibility IsOrderVisible => _currentState == DisplayState.Ordering ? Visibility.Visible : Visibility.Collapsed;
        public Visibility IsPaymentVisible => _currentState == DisplayState.Payment ? Visibility.Visible : Visibility.Collapsed;

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? name = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }
    }
}
