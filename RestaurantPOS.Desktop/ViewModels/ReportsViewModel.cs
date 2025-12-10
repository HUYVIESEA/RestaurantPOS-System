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
using LiveChartsCore;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.SkiaSharpView.Painting;
using SkiaSharp;
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
            _revenueSeries = new ISeries[] { };
            _revenueXAxes = new Axis[] { new Axis { Labels = new string[] { } } };
            _revenueYAxes = new Axis[] { new Axis { Labeler = value => value.ToString("N0") + " đ" } };
            _categorySeries = new ISeries[] { };

            // Load initial data safely
            Task.Run(async () => await RefreshData());
        }

        // Chart Properties
        private ISeries[] _revenueSeries;
        private Axis[] _revenueXAxes;
        private Axis[] _revenueYAxes;
        private ISeries[] _categorySeries;

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

        public ISeries[] CategorySeries
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

        private async void ExecuteExport(object? parameter)
        {
            try
            {
                IsLoading = true;
                var exportService = new ReportExportService();
                
                // Ensure data is loaded
                if (TopProducts.Count == 0 && CategoryRevenue.Count == 0)
                {
                    await LoadSalesSummary();
                    await LoadDetailedReports();
                }

                await exportService.ExportToCsvAsync(TopProducts, CategoryRevenue, StartDate, EndDate);
                
                await DialogHelper.ShowAlert("Thông báo", "Xuất báo cáo thành công!", "Success");
            }
            catch (Exception ex)
            {
                await DialogHelper.ShowAlert("Lỗi", $"Lỗi xuất báo cáo: {ex.Message}", "Error");
            }
            finally
            {
                IsLoading = false;
            }
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
                var catSeries = new List<ISeries>();
                foreach (var cat in CategoryRevenue)
                {
                    catSeries.Add(new PieSeries<double>
                    {
                        Values = new double[] { (double)cat.TotalRevenue },
                        Name = cat.CategoryName,
                        DataLabelsSize = 12,
                        DataLabelsFormatter = point => $"{point.Model:N0}",
                        DataLabelsPaint = new SolidColorPaint(SKColors.White)
                    });
                }
                CategorySeries = catSeries.ToArray();
            });

            // Revenue Chart
            var revenueData = await _reportService.GetRevenueReportAsync(StartDate, EndDate);
            var values = new List<double>();
            var labels = new List<string>();

            for (var date = StartDate.Date; date <= EndDate.Date; date = date.AddDays(1))
            {
                var report = revenueData.FirstOrDefault(r => r.Date.Date == date);
                values.Add((double)(report?.Revenue ?? 0));
                labels.Add(date.ToString("dd/MM"));
            }

            System.Windows.Application.Current.Dispatcher.Invoke(() => 
            {
                RevenueSeries = new ISeries[]
                {
                    new ColumnSeries<double>
                    {
                        Name = "Doanh thu",
                        Values = values.ToArray()
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
            });
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string? propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
