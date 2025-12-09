using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Utilities;
using LiveCharts;
using LiveCharts.Wpf;
using System.Collections.Generic;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class DashboardViewModel : INotifyPropertyChanged
    {
        private readonly ReportService _reportService;
        private readonly OrderService _orderService;
        private readonly TableService _tableService;

        private decimal _todayRevenue;
        private int _todayOrdersCount;
        private int _activeTablesCount;
        private ObservableCollection<DashboardOrder> _recentOrders;
        private bool _isLoading;
        private string _statusMessage = "Đang tải dữ liệu...";

        // Chart Properties
        private SeriesCollection _revenueSeries;
        private string[] _revenueLabels;
        private Func<double, string> _revenueFormatter;

        public DashboardViewModel()
        {
            _reportService = new ReportService();
            _orderService = new OrderService();
            _tableService = new TableService();
            
            // Initialize defaults
            _recentOrders = new ObservableCollection<DashboardOrder>();
            RecentOrders = _recentOrders;
            _revenueSeries = new SeriesCollection();
            _revenueLabels = Array.Empty<string>();
            _revenueFormatter = value => value.ToString("N0") + " đ";

            RefreshCommand = new RelayCommand(ExecuteRefresh);
            
            // Fire and forget
            Task.Run(async () => await LoadDashboardData());
        }

        public SeriesCollection RevenueSeries
        {
            get => _revenueSeries;
            set { _revenueSeries = value; OnPropertyChanged(); }
        }

        public string[] RevenueLabels
        {
            get => _revenueLabels;
            set { _revenueLabels = value; OnPropertyChanged(); }
        }

        public Func<double, string> RevenueFormatter
        {
            get => _revenueFormatter;
            set { _revenueFormatter = value; OnPropertyChanged(); }
        }

        public decimal TodayRevenue
        {
            get => _todayRevenue;
            set { _todayRevenue = value; OnPropertyChanged(); }
        }

        public int TodayOrdersCount
        {
            get => _todayOrdersCount;
            set { _todayOrdersCount = value; OnPropertyChanged(); }
        }

        public int ActiveTablesCount
        {
            get => _activeTablesCount;
            set { _activeTablesCount = value; OnPropertyChanged(); }
        }

        public ObservableCollection<DashboardOrder> RecentOrders
        {
            get => _recentOrders;
            set { _recentOrders = value; OnPropertyChanged(); }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); }
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set { _statusMessage = value; OnPropertyChanged(); }
        }

        public ICommand RefreshCommand { get; }

        private async void ExecuteRefresh(object? parameter)
        {
            await LoadDashboardData();
        }

        public async Task LoadDashboardData()
        {
            IsLoading = true;
            StatusMessage = "Đang cập nhật...";
            try
            {
                // 1. Get Active Tables first (needed for mapping)
                var tables = await _tableService.GetTablesAsync();
                // 2. Get Today's Sales Summary
                var summary = await _reportService.GetSalesSummaryAsync();
                
                System.Windows.Application.Current.Dispatcher.Invoke(() => 
                {
                    ActiveTablesCount = tables.Count(t => !t.IsAvailable);
                    
                    if (summary != null)
                    {
                        TodayRevenue = summary.TodayRevenue;
                        TodayOrdersCount = summary.TodayOrders;
                        StatusMessage = $"Cập nhật lúc {DateTime.Now:HH:mm:ss}";
                    }
                    else
                    {
                        StatusMessage = "Không thể lấy dữ liệu báo cáo.";
                    }
                });

                // 3. Get Revenue Chart Data (Last 7 Days)
                var endDate = DateTime.Now;
                var startDate = endDate.AddDays(-6);
                var revenueData = await _reportService.GetRevenueReportAsync(startDate, endDate);
                
                var values = new ChartValues<decimal>();
                var labels = new List<string>();

                // Fill missing dates with 0
                for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
                {
                    var report = revenueData.FirstOrDefault(r => r.Date.Date == date);
                    values.Add(report?.Revenue ?? 0);
                    labels.Add(date.ToString("dd/MM"));
                }

                System.Windows.Application.Current.Dispatcher.Invoke(() => 
                {
                    RevenueSeries = new SeriesCollection
                    {
                        new LineSeries
                        {
                            Title = "Doanh thu",
                            Values = values,
                            PointGeometry = DefaultGeometries.Circle,
                            PointGeometrySize = 10,
                            LineSmoothness = 0
                        }
                    };
                    RevenueLabels = labels.ToArray();
                });

                // 3. Get Recent Orders (Last 5)
                var allOrders = await _orderService.GetAllOrdersAsync();
                var recent = allOrders.OrderByDescending(o => o.CreatedAt).Take(5).ToList();
                
                System.Windows.Application.Current.Dispatcher.Invoke(() => 
                {
                    RecentOrders.Clear();
                    foreach (var order in recent)
                    {
                        var table = tables.FirstOrDefault(t => t.Id == order.TableId);
                        RecentOrders.Add(new DashboardOrder
                        {
                            Id = order.Id,
                            TableNumber = table?.TableNumber ?? order.TableId.ToString(),
                            TotalAmount = order.TotalAmount,
                            Status = order.Status,
                            CreatedAt = order.CreatedAt
                        });
                    }
                });
            }
            catch (Exception ex)
            {
                StatusMessage = $"Lỗi: {ex.Message}";
                System.Diagnostics.Debug.WriteLine($"Dashboard Error: {ex.Message}");
            }
            finally
            {
                IsLoading = false;
            }
        }

        public class DashboardOrder
        {
            public int Id { get; set; }
            public string TableNumber { get; set; } = "";
            public decimal TotalAmount { get; set; }
            public string Status { get; set; } = "";
            public DateTime CreatedAt { get; set; }
        }

        public event System.ComponentModel.PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([System.Runtime.CompilerServices.CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new System.ComponentModel.PropertyChangedEventArgs(propertyName));
        }
    }
}
