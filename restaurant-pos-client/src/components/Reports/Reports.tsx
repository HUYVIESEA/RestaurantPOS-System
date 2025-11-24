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
import './Reports.css';
import './Charts.css';

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
      <div className="reports-summary">
        <div className="summary-cards">
          {/* Today Revenue */}
          <div className="summary-card highlight">
            <div className="summary-icon">💰</div>
            <div className="summary-content">
              <h3>Doanh Thu Hôm Nay</h3>
              <div className="summary-value">{formatPrice(salesSummary.todayRevenue)}</div>
              <div className="summary-compare">
                {salesSummary.todayRevenue >= salesSummary.yesterdayRevenue ? (
                  <span className="positive">
                    ↑ {formatPrice(salesSummary.todayRevenue - salesSummary.yesterdayRevenue)}
                  </span>
                ) : (
                  <span className="negative">
                    ↓ {formatPrice(salesSummary.yesterdayRevenue - salesSummary.todayRevenue)}
                  </span>
                )}
                <span className="label"> so với hôm qua</span>
              </div>
            </div>
          </div>

          {/* Week Revenue */}
          <div className="summary-card">
            <div className="summary-icon">📅</div>
            <div className="summary-content">
              <h3>Doanh Thu Tuần Này</h3>
              <div className="summary-value">{formatPrice(salesSummary.weekRevenue)}</div>
              <div className="summary-meta">{salesSummary.weekOrders} đơn hàng</div>
            </div>
          </div>

          {/* Month Revenue */}
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h3>Doanh Thu Tháng Này</h3>
              <div className="summary-value">{formatPrice(salesSummary.monthRevenue)}</div>
              <div className="summary-meta">{salesSummary.monthOrders} đơn hàng</div>
            </div>
          </div>

          {/* Year Revenue */}
          <div className="summary-card">
            <div className="summary-icon">🎯</div>
            <div className="summary-content">
              <h3>Doanh Thu Năm Nay</h3>
              <div className="summary-value">{formatPrice(salesSummary.yearRevenue)}</div>
              <div className="summary-meta">Tổng cộng cả năm</div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="summary-section">
          <h2>🏆 Top 5 thực đơn Bán Chạy (Tháng Này)</h2>
          <div className="top-products-list">
            {salesSummary.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.productId} className="top-product-item">
                <div className="rank">#{index + 1}</div>
                <div className="product-info">
                  <div className="product-name">{product.productName}</div>
                  <div className="product-category">{product.categoryName}</div>
                </div>
                <div className="product-stats">
                  <div className="stat-item">
                    <span className="stat-label">Đã bán:</span>
                    <span className="stat-value">{product.totalQuantitySold}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Doanh thu:</span>
                    <span className="stat-value">{formatPrice(product.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="summary-section">
          <h2>📂 Phân Tích Theo Danh Mục</h2>
          <div className="category-breakdown">
            {salesSummary.categoryBreakdown.map((category) => (
              <div key={category.categoryId} className="category-item">
                <div className="category-header">
                  <h3>{category.categoryName}</h3>
                  <span className="category-percentage">{category.revenuePercentage.toFixed(1)}%</span>
                </div>
                <div className="category-progress">
                  <div 
                    className="category-progress-bar" 
                    style={{ width: `${category.revenuePercentage}%` }}
                  />
                </div>
                <div className="category-stats">
                  <span>{category.productCount} thực đơn</span>
                  <span>{formatPrice(category.totalRevenue)}</span>
                </div>
              </div>
            ))}
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
      <div className="revenue-report">
        <div className="report-stats">
          <div className="stat-card">
            <h3>Tổng Doanh Thu</h3>
            <div className="stat-value">{formatPrice(revenueReport.totalRevenue)}</div>
          </div>
          <div className="stat-card">
            <h3>Tổng Đơn Hàng</h3>
            <div className="stat-value">{revenueReport.totalOrders}</div>
          </div>
          <div className="stat-card">
            <h3>Giá Trị Trung Bình</h3>
            <div className="stat-value">{formatPrice(revenueReport.averageOrderValue)}</div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="chart-card">
          <h3>
            <i className="fas fa-chart-line"></i>
            Biểu Đồ Doanh Thu Theo Ngày
          </h3>
          <RevenueChart data={chartData} />
        </div>

        <div className="daily-revenue-table">
          <h3>Doanh Thu Theo Ngày</h3>
          <table>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Số Đơn</th>
                <th>Doanh Thu</th>
              </tr>
            </thead>
            <tbody>
              {revenueReport.dailyRevenue.map((day) => (
                <tr key={day.date}>
                  <td>{new Date(day.date).toLocaleDateString('vi-VN')}</td>
                  <td>{day.orderCount}</td>
                  <td className="revenue-value">{formatPrice(day.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
      <div className="products-report">
        <h2>Top 10 thực đơn Bán Chạy</h2>
        
        {/* Product Bar Chart */}
        {topProducts.length > 0 && (
          <div className="chart-card">
            <h3>
              <i className="fas fa-chart-bar"></i>
              Biểu Đồ thực đơn Bán Chạy
            </h3>
            <ProductBarChart data={chartData} title="Số Lượng Đã Bán" />
          </div>
        )}

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Hạng</th>
                <th>thực đơn</th>
                <th>Danh Mục</th>
                <th>Đã Bán</th>
                <th>Doanh Thu</th>
                <th>Giá TB</th>
                <th>Số Đơn</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.productId}>
                  <td>
                    <div className="rank-badge">#{index + 1}</div>
                  </td>
                  <td className="product-name">{product.productName}</td>
                  <td>{product.categoryName}</td>
                  <td>{product.totalQuantitySold}</td>
                  <td className="revenue-value">{formatPrice(product.totalRevenue)}</td>
                  <td>{formatPrice(product.averagePrice)}</td>
                  <td>{product.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOrdersReport = () => {
    if (!orderStats) return null;

    return (
      <div className="orders-report">
        <div className="order-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <h3>Tổng Đơn Hàng</h3>
            <div className="stat-value">{orderStats.totalOrders}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <h3>Hoàn Thành</h3>
            <div className="stat-value">{orderStats.completedOrders}</div>
            <div className="stat-meta">{orderStats.completionRate.toFixed(1)}%</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">⏳</div>
            <h3>Đang Chờ</h3>
            <div className="stat-value">{orderStats.pendingOrders}</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">❌</div>
            <h3>Đã Hủy</h3>
            <div className="stat-value">{orderStats.cancelledOrders}</div>
            <div className="stat-meta">{orderStats.cancellationRate.toFixed(1)}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💵</div>
            <h3>Giá Trị TB</h3>
            <div className="stat-value">{formatPrice(orderStats.averageOrderValue)}</div>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="chart-card">
          <h3>
            <i className="fas fa-chart-pie"></i>
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
      <div className="tables-report">
        <h2>Hiệu Suất Bàn</h2>
        <div className="tables-grid">
          {tablePerformance.map((table) => (
            <div key={table.tableId} className="table-card">
              <div className="table-header">
                <h3>Bàn {table.tableNumber}</h3>
              </div>
              <div className="table-stats">
                <div className="table-stat">
                  <span className="label">Tổng đơn:</span>
                  <span className="value">{table.totalOrders}</span>
                </div>
                <div className="table-stat">
                  <span className="label">Doanh thu:</span>
                  <span className="value">{formatPrice(table.totalRevenue)}</span>
                </div>
                <div className="table-stat">
                  <span className="label">Giá trị TB:</span>
                  <span className="value">{formatPrice(table.averageOrderValue)}</span>
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
      <div className="reports-container">
        <Skeleton width="200px" height="32px" />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📊 Báo Cáo & Thống Kê</h1>
        <div className="reports-actions">
          <button onClick={() => handleExport('PDF')} className="export-btn pdf">
            <i className="fas fa-file-pdf"></i> Xuất PDF
          </button>
          <button onClick={() => handleExport('Excel')} className="export-btn excel">
            <i className="fas fa-file-excel"></i> Xuất Excel
          </button>
        </div>
      </div>

      <div className="reports-tabs">
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <i className="fas fa-chart-pie"></i> Tổng Quan
        </button>
        <button
          className={`tab ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          <i className="fas fa-money-bill-wave"></i> Doanh Thu
        </button>
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <i className="fas fa-shopping-bag"></i> thực đơn
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <i className="fas fa-receipt"></i> Đơn Hàng
        </button>
        <button
          className={`tab ${activeTab === 'tables' ? 'active' : ''}`}
          onClick={() => setActiveTab('tables')}
        >
          <i className="fas fa-table"></i> Bàn
        </button>
      </div>

      {activeTab !== 'summary' && (
        <div className="date-range-filter">
          <label>
            Từ ngày:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            Đến ngày:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        </div>
      )}

      <div className="reports-content">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
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
