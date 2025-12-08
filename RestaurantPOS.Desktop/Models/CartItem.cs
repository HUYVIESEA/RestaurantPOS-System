using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace RestaurantPOS.Desktop.Models
{
    public class CartItem : INotifyPropertyChanged
    {
        private int _quantity;
        private decimal _totalPrice;
        private string _note;

        public Product Product { get; set; }

        public string Note
        {
            get => _note;
            set
            {
                _note = value;
                OnPropertyChanged();
            }
        }

        public int Quantity
        {
            get => _quantity;
            set
            {
                _quantity = value;
                TotalPrice = Product.Price * _quantity;
                OnPropertyChanged();
            }
        }

        public decimal TotalPrice
        {
            get => _totalPrice;
            private set
            {
                _totalPrice = value;
                OnPropertyChanged();
            }
        }

        public int? OrderItemId { get; set; }
        public int OriginalQuantity { get; set; }
        public bool IsNew { get; set; } = true;

        public CartItem(Product product, int quantity = 1, bool isNew = true, int? orderItemId = null)
        {
            Product = product;
            Quantity = quantity;
            IsNew = isNew;
            OrderItemId = orderItemId;
            OriginalQuantity = isNew ? 0 : quantity;
            _note = string.Empty;
        }

        public event PropertyChangedEventHandler? PropertyChanged;

        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
