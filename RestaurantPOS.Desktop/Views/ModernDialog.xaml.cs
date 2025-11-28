using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop.Views
{
    public partial class ModernDialog : Window
    {
        public static readonly DependencyProperty MessageProperty =
            DependencyProperty.Register("Message", typeof(string), typeof(ModernDialog), new PropertyMetadata(string.Empty));

        public static readonly DependencyProperty DialogTypeProperty =
            DependencyProperty.Register("DialogType", typeof(DialogType), typeof(ModernDialog), 
                new PropertyMetadata(DialogType.Info, OnDialogTypeChanged));

        public string Message
        {
            get => (string)GetValue(MessageProperty);
            set => SetValue(MessageProperty, value);
        }

        public DialogType DialogType
        {
            get => (DialogType)GetValue(DialogTypeProperty);
            set => SetValue(DialogTypeProperty, value);
        }

        public ModernDialog()
        {
            InitializeComponent();
            Loaded += ModernDialog_Loaded;
        }

        private void ModernDialog_Loaded(object sender, RoutedEventArgs e)
        {
            UpdateDialogAppearance();
        }

        private static void OnDialogTypeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ModernDialog dialog && dialog.IsLoaded)
            {
                dialog.UpdateDialogAppearance();
            }
        }

        private void UpdateDialogAppearance()
        {
            ButtonPanel.Children.Clear();

            switch (DialogType)
            {
                case DialogType.Success:
                    IconText.Text = "✅";
                    IconText.Foreground = new SolidColorBrush(Color.FromRgb(76, 175, 80));
                    CreateOkButton();
                    break;

                case DialogType.Error:
                    IconText.Text = "❌";
                    IconText.Foreground = new SolidColorBrush(Color.FromRgb(244, 67, 54));
                    CreateOkButton();
                    break;

                case DialogType.Warning:
                    IconText.Text = "⚠️";
                    IconText.Foreground = new SolidColorBrush(Color.FromRgb(255, 152, 0));
                    CreateOkButton();
                    break;

                case DialogType.Confirmation:
                    IconText.Text = "❓";
                    IconText.Foreground = new SolidColorBrush(Color.FromRgb(103, 58, 183));
                    CreateConfirmationButtons();
                    break;

                case DialogType.Info:
                default:
                    IconText.Text = "ℹ️";
                    IconText.Foreground = new SolidColorBrush(Color.FromRgb(33, 150, 243));
                    CreateOkButton();
                    break;
            }
        }

        private void CreateOkButton()
        {
            var okButton = new Button
            {
                Content = "OK",
                Width = 100,
                Height = 36,
                Background = new SolidColorBrush(Color.FromRgb(103, 58, 183)),
                Foreground = Brushes.White,
                BorderThickness = new Thickness(0),
                FontSize = 14,
                FontWeight = FontWeights.SemiBold,
                Cursor = System.Windows.Input.Cursors.Hand,
                Style = (Style)FindResource("ModernButtonStyle")
            };

            okButton.Click += (s, e) => DialogResult = true;
            ButtonPanel.Children.Add(okButton);
        }

        private void CreateConfirmationButtons()
        {
            var cancelButton = new Button
            {
                Content = "Hủy",
                Width = 100,
                Height = 36,
                Background = Brushes.White,
                Foreground = new SolidColorBrush(Color.FromRgb(97, 97, 97)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(224, 224, 224)),
                BorderThickness = new Thickness(1),
                FontSize = 14,
                Margin = new Thickness(0, 0, 10, 0),
                Cursor = System.Windows.Input.Cursors.Hand,
                Style = (Style)FindResource("ModernButtonStyle")
            };

            var confirmButton = new Button
            {
                Content = "Xác nhận",
                Width = 100,
                Height = 36,
                Background = new SolidColorBrush(Color.FromRgb(103, 58, 183)),
                Foreground = Brushes.White,
                BorderThickness = new Thickness(0),
                FontSize = 14,
                FontWeight = FontWeights.SemiBold,
                Cursor = System.Windows.Input.Cursors.Hand,
                Style = (Style)FindResource("ModernButtonStyle")
            };

            cancelButton.Click += (s, e) => DialogResult = false;
            confirmButton.Click += (s, e) => DialogResult = true;

            ButtonPanel.Children.Add(cancelButton);
            ButtonPanel.Children.Add(confirmButton);
        }
    }
}
