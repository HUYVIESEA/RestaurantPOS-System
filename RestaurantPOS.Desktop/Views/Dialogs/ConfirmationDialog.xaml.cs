using System.Windows.Controls;

namespace RestaurantPOS.Desktop.Views.Dialogs
{
    public partial class ConfirmationDialog : UserControl
    {
        public string Title { get; set; }
        public string Message { get; set; }

        public ConfirmationDialog(string title, string message)
        {
            InitializeComponent();
            Title = title;
            Message = message;
            DataContext = this;
        }
    }
}
