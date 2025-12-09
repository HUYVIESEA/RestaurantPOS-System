using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Windows.Input;
using RestaurantPOS.Desktop.Models;
using RestaurantPOS.Desktop.Services;
using RestaurantPOS.Desktop.Utilities;
using LiveCharts;
using LiveCharts.Wpf;
using System.Linq;

namespace RestaurantPOS.Desktop.ViewModels
{
    public class ReportsViewModel : INotifyPropertyChanged
    {
        private readonly ReportService _reportService;
        private DateTime _startDate;
        private DateTime _endDate;
        private bool _isLoading;
        private SalesSummaryDto? _salesSummary;

        public ReportsViewModel()
        {
            _reportService = new ReportService();
            _startDate = DateTime.Now.AddDays(-30);
            _endDate = DateTime.Now;

            LoadReportCommand = new RelayCommand(ExecuteLoadReport);
            ExportCommand = new RelayCommand(ExecuteExport);
            
            // Initialize defaults to avoid CS8618
            _revenueSeries = new SeriesCollection();
            _revenueLabels = Array.Empty<string>();
            _revenueFormatter = value => value.ToString("N0") + " đ";
            _categorySeries = new SeriesCollection();

            // Load initial data safely
            Task.Run(async () => await RefreshData());
        }

        // Chart Properties
        private SeriesCollection _revenueSeries;
        private string[] _revenueLabels;
        private Func<double, string> _revenueFormatter;
        private SeriesCollection _categorySeries;

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

        public SeriesCollection CategorySeries
        {
            get => _categorySeries;
            set { _categorySeries = value; OnPropertyChanged(); }
        }

        public DateTime StartDate
        {
            get => _startDate;
            set { _startDate = value; OnPropertyChanged(); }
        }

        public DateTime EndDate
        {
            get => _endDate;
            set { _endDate = value; OnPropertyChanged(); }
        }

        public bool IsLoading
        {
            get => _isLoading;
            set { _isLoading = value; OnPropertyChanged(); }
        }

        public SalesSummaryDto? SalesSummary
        {
            get => _salesSummary;
            set { _salesSummary = value; OnPropertyChanged(); }
        }

        public ObservableCollection<ProductReportDto> TopProducts { get; } = new ObservableCollection<ProductReportDto>();
        public ObservableCollection<CategoryReportDto> CategoryRevenue { get; } = new ObservableCollection<CategoryReportDto>();

        public ICommand LoadReportCommand { get; }
        public ICommand ExportCommand { get; }

        public async Task RefreshData()
        {
            IsLoading = true;
            await LoadSalesSummary();
            await LoadDetailedReports();
            IsLoading = false;
        }

        private async void ExecuteLoadReport(object? parameter)
        {
            IsLoading = true;
            await LoadDetailedReports();
            IsLoading = false;
        }

        private void ExecuteExport(object? parameter)
        {
            string type = parameter as string ?? "PDF";
            System.Windows.MessageBox.Show($"Tính năng xuất báo cáo {type} đang được phát triển!", "Thông báo", System.Windows.MessageBoxButton.OK, System.Windows.MessageBoxImage.Information);
        }

        private async Task LoadSalesSummary()
        {
            var summary = await _reportService.GetSalesSummaryAsync();
            if (summary != null)
            {
                System.Windows.Application.Current.Dispatcher.Invoke(() => 
                {
                    SalesSummary = summary;
                });
            }
        }

        private async Task LoadDetailedReports()
        {
            // Top Products
            var products = await _reportService.GetTopSellingProductsAsync(StartDate, EndDate);
            
            System.Windows.Application.Current.Dispatcher.Invoke(() => 
            {
                TopProducts.Clear();
                if (products != null && products.Count > 0)
                {
                    foreach (var p in products) TopProducts.Add(p);
                }
                else if (SalesSummary?.TopProducts != null && SalesSummary.TopProducts.Count > 0)
                {
                    // Fallback to summary data
                    foreach (var p in SalesSummary.TopProducts) TopProducts.Add(p);
                }
            });

            // Category Revenue
            var categories = await _reportService.GetCategoryReportAsync(StartDate, EndDate);
            
            System.Windows.Application.Current.Dispatcher.Invoke(() => 
            {
                CategoryRevenue.Clear();
                if (categories != null && categories.Count > 0)
                {
                    foreach (var c in categories) CategoryRevenue.Add(c);
                }
                else if (SalesSummary?.CategoryBreakdown != null && SalesSummary.CategoryBreakdown.Count > 0)
                {
                    // Fallback to summary data
                    foreach (var c in SalesSummary.CategoryBreakdown) CategoryRevenue.Add(c);
                }

                // Populate Category Chart
                var catSeries = new SeriesCollection();
                foreach (var cat in CategoryRevenue)
                {
                    catSeries.Add(new PieSeries
                    {
                        Title = cat.CategoryName,
                        Values = new ChartValues<decimal> { cat.TotalRevenue },
                        DataLabels = true,
                        LabelPoint = chartPoint => string.Format("{0} ({1:P})", cat.CategoryName, chartPoint.Participation)
                    });
                }
                CategorySeries = catSeries;
            });

            // Revenue Chart
            var revenueData = await _reportService.GetRevenueReportAsync(StartDate, EndDate);
            var values = new ChartValues<decimal>();
            var labels = new List<string>();

            for (var date = StartDate.Date; date <= EndDate.Date; date = date.AddDays(1))
            {
                var report = revenueData.FirstOrDefault(r => r.Date.Date == date);
                values.Add(report?.Revenue ?? 0);
                labels.Add(date.ToString("dd/MM"));
            }

            System.Windows.Application.Current.Dispatcher.Invoke(() => 
            {
                RevenueSeries = new SeriesCollection
                {
                    new ColumnSeries // Use Column for reports
                    {
                        Title = "Doanh thu",
                        Values = values
                    }
                };
                RevenueLabels = labels.ToArray();
            });
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
