import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import reportService from '../../services/reportService';
import { formatPrice } from '../../utils/priceUtils';
import { Skeleton, SkeletonCard } from '../Common/Skeleton';
import {
  RevenueChart,
  ProductBarChart,
  OrderStatusChart
} from './Charts';
import {
  SalesSummary,
  ProductReport,
  RevenueReport,
  OrderStatistics,
  TablePerformance
} from '../../types';

const Reports: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'revenue' | 'products' | 'orders' | 'tables'>('summary');
  
  // Summary data
  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);
  
  // Revenue data
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  
  // Products data
  const [topProducts, setTopProducts] = useState<ProductReport[]>([]);
  
  // Orders data
  const [orderStats, setOrderStats] = useState<OrderStatistics | null>(null);
  
  // Tables data
  const [tablePerformance, setTablePerformance] = useState<TablePerformance[]>([]);
  
  // Date range
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSalesSummary();
  }, []);

  useEffect(() => {
    if (activeTab === 'revenue') {
      loadRevenueReport();
    } else if (activeTab === 'products') {
      loadTopProducts();
    } else if (activeTab === 'orders') {
      loadOrderStatistics();
    } else if (activeTab === 'tables') {
      loadTablePerformance();
    }
  }, [activeTab, startDate, endDate]);

  const loadSalesSummary = async () => {
    try {
      setLoading(true);
      const data = await reportService.getSalesSummary();
      setSalesSummary(data);
    } catch (error) {
      showToast('Lỗi khi tải báo cáo tổng quan', 'error');
      console.error('Error loading sales summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueReport = async () => {
    try {
      setLoading(true);
      const data = await reportService.getRevenueReport(startDate, endDate);
      setRevenueReport(data);
    } catch (error) {
      showToast('Lỗi khi tải báo cáo doanh thu', 'error');
      console.error('Error loading revenue report:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTopProducts = async () => {
    try {
      setLoading(true);
      const data = await reportService.getTopSellingProducts(startDate, endDate, 10);
      setTopProducts(data);
    } catch (error) {
      showToast('Lỗi khi tải báo cáo thực đơn', 'error');
      console.error('Error loading top products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStatistics = async () => {
    try {
      setLoading(true);
      const data = await reportService.getOrderStatistics(startDate, endDate);
      setOrderStats(data);
    } catch (error) {
      showToast('Lỗi khi tải thống kê đơn hàng', 'error');
      console.error('Error loading order statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTablePerformance = async () => {
    try {
      setLoading(true);
      const data = await reportService.getTablePerformance(startDate, endDate);
      setTablePerformance(data);
    } catch (error) {
      showToast('Lỗi khi tải hiệu suất bàn', 'error');
      console.error('Error loading table performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'PDF' | 'Excel') => {
    try {
      showToast(`Đang xuất báo cáo ${format}...`, 'info');
      
      const blob = format === 'PDF' 
        ? await reportService.exportToPdf({ reportType: activeTab, startDate, endDate, format })
        : await reportService.exportToExcel({ reportType: activeTab, startDate, endDate, format });
      
      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Report_${activeTab}_${new Date().toISOString().split('T')[0]}.${format === 'PDF' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast(`Xuất ${format} thành công!`, 'success');
    } catch (error: any) {
      if (error.response?.status === 501) {
        showToast('Tính năng xuất file sẽ được cập nhật trong phiên bản tiếp theo', 'info');
      } else {
        showToast(`Lỗi khi xuất ${format}`, 'error');
      }
    }
  };

  const renderSummary = () => {
    if (!salesSummary) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today Revenue */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-50">Doanh Thu Hôm Nay</h3>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">💰</div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold mb-2">{formatPrice(salesSummary.todayRevenue)}</div>
            <div className="text-sm font-medium">
              {salesSummary.todayRevenue >= salesSummary.yesterdayRevenue ? (
                <span className="text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <i className="fas fa-arrow-up text-xs"></i> {formatPrice(salesSummary.todayRevenue - salesSummary.yesterdayRevenue)}
                </span>
              ) : (
                <span className="text-rose-300 bg-rose-900/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <i className="fas fa-arrow-down text-xs"></i> {formatPrice(salesSummary.yesterdayRevenue - salesSummary.todayRevenue)}
                </span>
              )}
              <span className="text-blue-100 ml-2">so với hôm qua</span>
            </div>
          </div>

          {/* Week Revenue */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-500 dark:text-slate-400">Doanh Thu Tuần Này</h3>
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center text-xl">📅</div>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{formatPrice(salesSummary.weekRevenue)}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{salesSummary.weekOrders} đơn hàng</div>
          </div>

          {/* Month Revenue */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-500 dark:text-slate-400">Doanh Thu Tháng Này</h3>
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center text-xl">📊</div>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{formatPrice(salesSummary.monthRevenue)}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{salesSummary.monthOrders} đơn hàng</div>
          </div>

          {/* Year Revenue */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-500 dark:text-slate-400">Doanh Thu Năm Nay</h3>
              <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center text-xl">🎯</div>
            </div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{formatPrice(salesSummary.yearRevenue)}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Tổng cộng cả năm</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              🏆 Top 5 thực đơn Bán Chạy (Tháng Này)
            </h2>
            <div className="space-y-3">
              {salesSummary.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.productId} className="flex items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-slate-50 dark:border-slate-700/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 shrink-0 ${
                    index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                    index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 dark:text-white truncate">{product.productName}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.categoryName}</div>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="text-sm font-bold text-slate-800 dark:text-white">{formatPrice(product.totalRevenue)}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{product.totalQuantitySold} đã bán</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              📂 Phân Tích Theo Danh Mục
            </h2>
            <div className="space-y-4">
              {salesSummary.categoryBreakdown.map((category) => (
                <div key={category.categoryId} className="group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{category.categoryName}</span>
                    <span className="font-bold text-slate-800 dark:text-white">{category.revenuePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-500 group-hover:bg-blue-600" 
                      style={{ width: `${category.revenuePercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>{category.productCount} thực đơn</span>
                    <span>{formatPrice(category.totalRevenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRevenueReport = () => {
    if (!revenueReport) return null;

    // Prepare chart data
    const chartData = {
      labels: revenueReport.dailyRevenue.map(d => 
        new Date(d.date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
      ),
      revenue: revenueReport.dailyRevenue.map(d => d.revenue)
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Tổng Doanh Thu</h3>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(revenueReport.totalRevenue)}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Tổng Đơn Hàng</h3>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{revenueReport.totalOrders}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">Giá Trị Trung Bình</h3>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(revenueReport.averageOrderValue)}</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-chart-simple text-blue-500"></i>
            Biểu Đồ Doanh Thu Theo Ngày
          </h3>
          <RevenueChart data={chartData} />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Doanh Thu Theo Ngày</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50">
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">Ngày</th>
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-center">Số Đơn</th>
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-right">Doanh Thu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {revenueReport.dailyRevenue.map((day) => (
                  <tr key={day.date} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 text-slate-800 dark:text-slate-200">{new Date(day.date).toLocaleDateString('vi-VN')}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 text-center">{day.orderCount}</td>
                    <td className="p-3 text-right font-semibold text-blue-600 dark:text-blue-400">{formatPrice(day.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderProductsReport = () => {
    // Prepare chart data
    const chartData = {
      labels: topProducts.map(p => p.productName),
      values: topProducts.map(p => p.totalQuantitySold)
    };

    return (
      <div className="space-y-6">
        {/* Product Bar Chart */}
        {topProducts.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-chart-area text-purple-500"></i>
              Biểu Đồ thực đơn Bán Chạy
            </h3>
            <ProductBarChart data={chartData} title="Số Lượng Đã Bán" />
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Top 10 thực đơn Bán Chạy</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50">
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 w-16 text-center">Hạng</th>
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600">thực đơn</th>
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 hidden sm:table-cell">Danh Mục</th>
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-center">Đã Bán</th>
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-right">Doanh Thu</th>
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-right hidden md:table-cell">Giá TB</th>
                  <th className="p-3 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600 text-center hidden lg:table-cell">Số Đơn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {topProducts.map((product, index) => (
                  <tr key={product.productId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                        index === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                        index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{product.productName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400 hidden sm:table-cell text-sm">{product.categoryName}</td>
                    <td className="p-3 text-center font-semibold text-slate-800 dark:text-slate-200">{product.totalQuantitySold}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(product.totalRevenue)}</td>
                    <td className="p-3 text-right text-slate-600 dark:text-slate-400 hidden md:table-cell text-sm">{formatPrice(product.averagePrice)}</td>
                    <td className="p-3 text-center text-slate-600 dark:text-slate-400 hidden lg:table-cell text-sm">{product.orderCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderOrdersReport = () => {
    if (!orderStats) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center text-xl mx-auto mb-2">📦</div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Tổng Đơn Hàng</h3>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{orderStats.totalOrders}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center text-xl mx-auto mb-2">✅</div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Hoàn Thành</h3>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{orderStats.completedOrders}</div>
            <div className="text-xs font-medium text-emerald-500 mt-1">{orderStats.completionRate.toFixed(1)}%</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center text-xl mx-auto mb-2">⏳</div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Đang Chờ</h3>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{orderStats.pendingOrders}</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center text-xl mx-auto mb-2">❌</div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Đã Hủy</h3>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{orderStats.cancelledOrders}</div>
            <div className="text-xs font-medium text-rose-500 mt-1">{orderStats.cancellationRate.toFixed(1)}%</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center text-xl mx-auto mb-2">💵</div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Giá Trị TB</h3>
            <div className="text-xl font-bold text-slate-800 dark:text-white truncate">{formatPrice(orderStats.averageOrderValue)}</div>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-emerald-500"></i>
            Phân Bổ Trạng Thái Đơn Hàng
          </h3>
          <OrderStatusChart 
            data={{
              completed: orderStats.completedOrders,
              pending: orderStats.pendingOrders,
              cancelled: orderStats.cancelledOrders
            }} 
          />
        </div>
      </div>
    );
  };

  const renderTablesReport = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Hiệu Suất Bàn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tablePerformance.map((table) => (
            <div key={table.tableId} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="border-b border-slate-100 dark:border-slate-700 pb-3 mb-3">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                  <i className="fas fa-chair text-slate-400"></i> Bàn {table.tableNumber}
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Tổng đơn:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{table.totalOrders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Doanh thu:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(table.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Giá trị TB:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{formatPrice(table.averageOrderValue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && !salesSummary) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton width="200px" height="32px" />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
          📊 Báo Cáo & Thống Kê
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => handleExport('PDF')} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 rounded-lg font-medium transition-colors text-sm">
            <i className="fas fa-file-invoice"></i> Xuất PDF
          </button>
          <button onClick={() => handleExport('Excel')} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg font-medium transition-colors text-sm">
            <i className="fas fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <button
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'summary' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('summary')}
        >
          <i className="fas fa-chart-pie"></i> <span className="hidden sm:inline">Tổng Quan</span>
        </button>
        <button
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'revenue' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('revenue')}
        >
          <i className="fas fa-money-bill-wave"></i> <span className="hidden sm:inline">Doanh Thu</span>
        </button>
        <button
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('products')}
        >
          <i className="fas fa-shopping-bag"></i> <span className="hidden sm:inline">thực đơn</span>
        </button>
        <button
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="fas fa-receipt"></i> <span className="hidden sm:inline">Đơn Hàng</span>
        </button>
        <button
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'tables' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
          onClick={() => setActiveTab('tables')}
        >
          <i className="fas fa-table"></i> <span className="hidden sm:inline">Bàn</span>
        </button>
      </div>

      {activeTab !== 'summary' && (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Từ ngày:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">Đến ngày:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
            />
          </div>
        </div>
      )}

      <div className="animate-in fade-in duration-300">
        {loading ? (
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            {activeTab === 'summary' && renderSummary()}
            {activeTab === 'revenue' && renderRevenueReport()}
            {activeTab === 'products' && renderProductsReport()}
            {activeTab === 'orders' && renderOrdersReport()}
            {activeTab === 'tables' && renderTablesReport()}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
