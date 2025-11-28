using System.Windows;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Threading;
using RestaurantPOS.Desktop.Services;

namespace RestaurantPOS.Desktop.Controls
{
    public partial class ToastNotification : Window
    {
        private DispatcherTimer? _timer;
        private static readonly List<ToastNotification> _activeToasts = new();
        private const double ToastSpacing = 90;
        private const double TopMargin = 20;

        public static readonly DependencyProperty MessageProperty =
            DependencyProperty.Register("Message", typeof(string), typeof(ToastNotification), new PropertyMetadata(string.Empty));

        public static readonly DependencyProperty ToastTypeProperty =
            DependencyProperty.Register("ToastType", typeof(ToastType), typeof(ToastNotification),
                new PropertyMetadata(ToastType.Info, OnToastTypeChanged));

        public static readonly DependencyProperty DurationProperty =
            DependencyProperty.Register("Duration", typeof(int), typeof(ToastNotification), new PropertyMetadata(3000));

        public string Message
        {
            get => (string)GetValue(MessageProperty);
            set => SetValue(MessageProperty, value);
        }

        public ToastType ToastType
        {
            get => (ToastType)GetValue(ToastTypeProperty);
            set => SetValue(ToastTypeProperty, value);
        }

        public int Duration
        {
            get => (int)GetValue(DurationProperty);
            set => SetValue(DurationProperty, value);
        }

        public ToastNotification()
        {
            InitializeComponent();
            Loaded += ToastNotification_Loaded;
        }

        private void ToastNotification_Loaded(object sender, RoutedEventArgs e)
        {
            UpdateToastAppearance();
            PositionToast();
            AnimateIn();
            StartTimer();
        }

        private static void OnToastTypeChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            if (d is ToastNotification toast && toast.IsLoaded)
            {
                toast.UpdateToastAppearance();
            }
        }

        private void UpdateToastAppearance()
        {
            switch (ToastType)
            {
                case ToastType.Success:
                    IconText.Text = "✓";
                    ToastBorder.Background = new SolidColorBrush(Color.FromRgb(76, 175, 80));
                    break;

                case ToastType.Error:
                    IconText.Text = "✕";
                    ToastBorder.Background = new SolidColorBrush(Color.FromRgb(244, 67, 54));
                    break;

                case ToastType.Warning:
                    IconText.Text = "⚠";
                    ToastBorder.Background = new SolidColorBrush(Color.FromRgb(255, 152, 0));
                    break;

                case ToastType.Info:
                default:
                    IconText.Text = "ℹ";
                    ToastBorder.Background = new SolidColorBrush(Color.FromRgb(33, 150, 243));
                    break;
            }
        }

        private void PositionToast()
        {
            var workArea = SystemParameters.WorkArea;
            
            // Position at top-right
            Left = workArea.Right - Width - 20;
            Top = TopMargin + (_activeToasts.Count * ToastSpacing);

            _activeToasts.Add(this);
        }

        private void AnimateIn()
        {
            var fadeIn = new DoubleAnimation(0, 1, TimeSpan.FromMilliseconds(300));
            var slideIn = new DoubleAnimation(Left + 50, Left, TimeSpan.FromMilliseconds(300))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
            };

            ToastBorder.BeginAnimation(OpacityProperty, fadeIn);
            BeginAnimation(LeftProperty, slideIn);
        }

        private void AnimateOut()
        {
            var fadeOut = new DoubleAnimation(1, 0, TimeSpan.FromMilliseconds(300));
            var slideOut = new DoubleAnimation(Left, Left + 50, TimeSpan.FromMilliseconds(300))
            {
                EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseIn }
            };

            fadeOut.Completed += (s, e) => 
            {
                _activeToasts.Remove(this);
                RepositionToasts();
                Close();
            };

            ToastBorder.BeginAnimation(OpacityProperty, fadeOut);
            BeginAnimation(LeftProperty, slideOut);
        }

        private static void RepositionToasts()
        {
            for (int i = 0; i < _activeToasts.Count; i++)
            {
                var toast = _activeToasts[i];
                var targetTop = TopMargin + (i * ToastSpacing);
                
                var slideDown = new DoubleAnimation(toast.Top, targetTop, TimeSpan.FromMilliseconds(300))
                {
                    EasingFunction = new QuadraticEase { EasingMode = EasingMode.EaseOut }
                };
                
                toast.BeginAnimation(TopProperty, slideDown);
            }
        }

        private void StartTimer()
        {
            _timer = new DispatcherTimer
            {
                Interval = TimeSpan.FromMilliseconds(Duration)
            };
            _timer.Tick += (s, e) =>
            {
                _timer.Stop();
                AnimateOut();
            };
            _timer.Start();
        }

        protected override void OnClosed(EventArgs e)
        {
            _timer?.Stop();
            base.OnClosed(e);
        }
    }
}
