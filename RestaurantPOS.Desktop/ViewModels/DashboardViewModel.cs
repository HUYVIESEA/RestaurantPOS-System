using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Utilities;
using LiveChartsCore;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.SkiaSharpView.Painting;
using SkiaSharp;
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
        private ISeries[] _revenueSeries;
        private Axis[] _revenueXAxes;
        private Axis[] _revenueYAxes;

        private ISeries[] _categorySeries;
        public ISeries[] CategorySeries
        {
            get => _categorySeries;
            set { _categorySeries = value; OnPropertyChanged(); }
        }

        private ISeries[] _topProductsSeries;
        public ISeries[] TopProductsSeries
        {
            get => _topProductsSeries;
            set { _topProductsSeries = value; OnPropertyChanged(); }
        }

        private Axis[] _topProductsXAxes;
        public Axis[] TopProductsXAxes
        {
            get => _topProductsXAxes;
            set { _topProductsXAxes = value; OnPropertyChanged(); }
        }
        
        private Axis[] _topProductsYAxes;
        public Axis[] TopProductsYAxes
        {
            get => _topProductsYAxes;
            set { _topProductsYAxes = value; OnPropertyChanged(); }
        }

        public DashboardViewModel()
        {
            _reportService = new ReportService();
            _orderService = new OrderService();
            _tableService = new TableService();
            
            // Initialize defaults
            _recentOrders = new ObservableCollection<DashboardOrder>();
            RecentOrders = _recentOrders;
            _revenueSeries = new ISeries[] { };
            _revenueXAxes = new Axis[] { new Axis { Labels = new string[] { } } };
            _revenueYAxes = new Axis[] { new Axis { Labeler = value => value.ToString("N0") + " đ" } };
            _categorySeries = new ISeries[] { };
            _topProductsSeries = new ISeries[] { };
            _topProductsXAxes = new Axis[] { };
            _topProductsYAxes = new Axis[] { };

            RefreshCommand = new RelayCommand(ExecuteRefresh);
            
            // Fire and forget
            Task.Run(async () => await LoadDashboardData());
        }

        public ISeries[] RevenueSeries
        {
            get => _revenueSeries;
            set { _revenueSeries = value; OnPropertyChanged(); }
        }

        public Axis[] RevenueXAxes
        {
            get => _revenueXAxes;
            set { _revenueXAxes = value; OnPropertyChanged(); }
        }

        public Axis[] RevenueYAxes
        {
            get => _revenueYAxes;
            set { _revenueYAxes = value; OnPropertyChanged(); }
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

        private decimal _averageOrderValue;
        public decimal AverageOrderValue
        {
            get => _averageOrderValue;
            set { _averageOrderValue = value; OnPropertyChanged(); }
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
                var endDate = DateTime.Now;
                var startDate = endDate.AddDays(-6);

                // Start all tasks related to data fetching in parallel
                var tablesTask = _tableService.GetTablesAsync();
                var summaryTask = _reportService.GetSalesSummaryAsync();
                var revenueReportTask = _reportService.GetRevenueReportAsync(startDate, endDate);
                var allOrdersTask = _orderService.GetAllOrdersAsync();
                var categoryReportTask = _reportService.GetCategoryReportAsync(startDate, endDate);
                var topProductsTask = _reportService.GetTopSellingProductsAsync(startDate, endDate, 5);

                await Task.WhenAll(tablesTask, summaryTask, revenueReportTask, allOrdersTask, categoryReportTask, topProductsTask);

                var tables = tablesTask.Result;
                var summary = summaryTask.Result;
                var revenueData = revenueReportTask.Result;
                var allOrders = allOrdersTask.Result;
                var categoryReport = categoryReportTask.Result;
                var topProducts = topProductsTask.Result;

                System.Windows.Application.Current.Dispatcher.Invoke(() => 
                {
                    // 1. Update Active Tables
                    ActiveTablesCount = tables.Count(t => !t.IsAvailable);

                    // 2. Update Sales Summary Cards
                    if (summary != null)
                    {
                        TodayRevenue = summary.TodayRevenue;
                        TodayOrdersCount = summary.TodayOrders;
                        AverageOrderValue = summary.TodayOrders > 0 ? summary.TodayRevenue / summary.TodayOrders : 0;
                    }
                    else
                    {
                        StatusMessage = "Không thể lấy dữ liệu báo cáo.";
                    }

                    // 3. Update Revenue Chart
                    var values = new List<double>();
                    var labels = new List<string>();

                    for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
                    {
                        var report = revenueData.FirstOrDefault(r => r.Date.Date == date);
                        values.Add((double)(report?.Revenue ?? 0));
                        labels.Add(date.ToString("dd/MM"));
                    }

                    RevenueSeries = new ISeries[]
                    {
                        new LineSeries<double>
                        {
                            Name = "Doanh thu",
                            Values = values.ToArray(),
                            GeometrySize = 10,
                            LineSmoothness = 0,
                            Stroke = new SolidColorPaint(SKColors.Green),
                            Fill = new SolidColorPaint(SKColors.Green.WithAlpha(50))
                        }
                    };

                    RevenueXAxes = new Axis[]
                    {
                         new Axis
                         {
                             Labels = labels,
                             LabelsRotation = 15
                         }
                    };

                    // 4. Update Recent Orders
                    var recent = allOrders.OrderByDescending(o => o.CreatedAt).Take(5).ToList();
                    RecentOrders.Clear();
                    foreach (var order in recent)
                    {
                        var table = tables.FirstOrDefault(t => t.Id == order.TableId);
                        RecentOrders.Add(new DashboardOrder
                        {
                            Id = order.Id,
                            TableNumber = table?.TableNumber ?? order.TableId.ToString() ?? "Unknown",
                            TotalAmount = order.TotalAmount,
                            Status = order.Status,
                            CreatedAt = order.CreatedAt
                        });
                    }

                    // 5. Update Category Pie Chart
                    var pieSeries = new List<ISeries>();
                    foreach(var cat in categoryReport.Take(5))
                    {
                        pieSeries.Add(new PieSeries<double>
                        {
                            Values = new double[] { (double)cat.TotalRevenue },
                            Name = cat.CategoryName,
                            InnerRadius = 50,
                            DataLabelsSize = 12,
                            DataLabelsPosition = LiveChartsCore.Measure.PolarLabelsPosition.Middle,
                            ToolTipLabelFormatter = point => $"{point.Context.Series.Name}: {point.Coordinate.PrimaryValue:N0} đ"
                        });
                    }
                    CategorySeries = pieSeries.ToArray();

                    // 6. Update Top Products Chart
                    var quantities = new List<int>();
                    var productNames = new List<string>();

                    foreach(var p in topProducts)
                    {
                         productNames.Add(p.ProductName);
                         quantities.Add(p.TotalQuantitySold);
                    }

                    TopProductsSeries = new ISeries[]
                    {
                        new RowSeries<int>
                        {
                            Name = "Số lượng",
                            Values = quantities.ToArray(),
                            Stroke = null,
                            DataLabelsPaint = new SolidColorPaint(SKColors.Black),
                            DataLabelsPosition = LiveChartsCore.Measure.DataLabelsPosition.End,
                            Fill = new SolidColorPaint(SKColors.DodgerBlue)
                        }
                    };

                    TopProductsYAxes = new Axis[]
                    {
                        new Axis
                        {
                            Labels = productNames.ToArray(),
                            LabelsRotation = 0,
                            SeparatorsPaint = null,
                            SeparatorsAtCenter = false,
                            TicksPaint = null
                        }
                    };
                    
                    TopProductsXAxes = new Axis[]
                    {
                        new Axis
                        {
                             IsVisible = false 
                        }
                    };

                    // Final Status Update
                    StatusMessage = $"Cập nhật lúc {DateTime.Now:HH:mm:ss}";
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
