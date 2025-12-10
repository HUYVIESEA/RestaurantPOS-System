using System.Windows.Controls;
using System.Windows.Media;

namespace RestaurantPOS.Desktop.Views.Dialogs
{
    public partial class AlertDialog : UserControl
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public Brush IconColor { get; set; }

        public AlertDialog(string title, string message, string type = "Info")
        {
            InitializeComponent();
            Title = title;
            Message = message;
            
            // Set Color based on Type
            if (type == "Error") IconColor = Brushes.Red;
            else if (type == "Warning") IconColor = Brushes.Orange;
            else if (type == "Success") IconColor = Brushes.Green;
            else IconColor = Brushes.DodgerBlue;

            DataContext = this;
        }
    }
}
