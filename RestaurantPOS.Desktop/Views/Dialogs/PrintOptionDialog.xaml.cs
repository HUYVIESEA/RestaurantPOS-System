using System.Windows.Controls;

namespace RestaurantPOS.Desktop.Views.Dialogs
{
    public partial class PrintOptionDialog : UserControl
    {
        public string Message { get; set; }

        public PrintOptionDialog(string message)
        {
            InitializeComponent();
            Message = message;
            DataContext = this;
        }
    }
}
