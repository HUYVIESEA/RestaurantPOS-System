using System;
using System.Windows;
using System.Windows.Documents;

namespace RestaurantPOS.Desktop.Views
{
    public partial class ReceiptPreviewWindow : Window
    {
        public bool IsConfirmed { get; private set; }

        public ReceiptPreviewWindow(FlowDocument document)
        {
            InitializeComponent();
            
            // Adjust document for viewing
            var clone = CloneDocument(document);
            DocViewer.Document = clone;
        }

        private void Print_Click(object sender, RoutedEventArgs e)
        {
            IsConfirmed = true;
            Close();
        }

        private void Cancel_Click(object sender, RoutedEventArgs e)
        {
            IsConfirmed = false;
            Close();
        }

        // Helper to clone FlowDocument because a FlowDocument can only be hosted by one viewer at a time
        private FlowDocument CloneDocument(FlowDocument doc)
        {
            var stream = new System.IO.MemoryStream();
            System.Windows.Markup.XamlWriter.Save(doc, stream);
            stream.Position = 0;
            return (FlowDocument)System.Windows.Markup.XamlReader.Load(stream);
        }
    }
}
