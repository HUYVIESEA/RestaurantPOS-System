/**
 * Analytics Page
 * Business insights and statistics dashboard
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService, AnalyticsData } from '../../services/analyticsService';
import { formatCurrency, formatCompactPrice } from '../../utils/priceUtils';
import { SkeletonStats } from '../Common/Skeleton';
import { useToast } from '../../contexts/ToastContext';
import './Analytics.css';

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await analyticsService.getAnalytics();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showError('Không thể tải dữ liệu phân tích');
    } finally {
    setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <h2><i className="fas fa-chart-bar"></i> Phân tích & Báo cáo</h2>
        </div>
        <SkeletonStats />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-container">
        <div className="error-state">Không thể tải dữ liệu phân tích</div>
      </div>
);
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h2><i className="fas fa-chart-bar"></i> Phân tích & Báo cáo</h2>
  <p className="subtitle">Thông tin chi tiết về hoạt động kinh doanh</p>
        </div>
        <div className="header-actions">
   <div className="time-range-toggle">
<button
     className={`range-btn ${timeRange === 'week' ? 'active' : ''}`}
  onClick={() => setTimeRange('week')}
  >
           7 ngày
          </button>
            <button
     className={`range-btn ${timeRange === 'month' ? 'active' : ''}`}
    onClick={() => setTimeRange('month')}
            >
       30 ngày
     </button>
          </div>
      <button className="btn btn-primary" onClick={fetchAnalytics}>
 <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
  <div className="metric-card revenue">
       <div className="metric-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
       <div className="metric-content">
            <h3>Doanh thu {timeRange === 'week' ? 'tuần' : 'tháng'}</h3>
      <p className="metric-value">
      {formatCurrency(timeRange === 'week' ? data.weekRevenue : data.monthRevenue)}
         </p>
            <div className={`metric-change ${data.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
   <i className={`fas fa-arrow-${data.revenueGrowth >= 0 ? 'up' : 'down'}`}></i>
    {Math.abs(data.revenueGrowth).toFixed(1)}% so với tuần trước
            </div>
          </div>
        </div>

        <div className="metric-card orders">
          <div className="metric-icon">
            <i className="fas fa-shopping-cart"></i>
       </div>
 <div className="metric-content">
       <h3>Đơn hàng hoàn thành</h3>
            <p className="metric-value">{data.completedOrders}</p>
   <p className="metric-subtitle">
        {data.pendingOrders} đang xử lý, {data.cancelledOrders} đã hủy
            </p>
 </div>
</div>

        <div className="metric-card average">
          <div className="metric-icon">
<i className="fas fa-receipt"></i>
     </div>
 <div className="metric-content">
   <h3>Giá trị trung bình</h3>
         <p className="metric-value">{formatCurrency(data.averageOrderValue)}</p>
            <p className="metric-subtitle">Trung bình mỗi đơn hàng</p>
          </div>
</div>

     <div className="metric-card tables">
   <div className="metric-icon">
            <i className="fas fa-chair"></i>
      </div>
     <div className="metric-content">
      <h3>Tỷ lệ lấp đầy bàn</h3>
          <p className="metric-value">{data.tableOccupancyRate.toFixed(1)}%</p>
 <div className="progress-bar">
              <div 
   className="progress-fill" 
         style={{ width: `${data.tableOccupancyRate}%` }}
     ></div>
          </div>
          </div>
   </div>
      </div>

      {/* Revenue Chart */}
      <div className="chart-section">
   <div className="section-header">
    <h3><i className="fas fa-chart-line"></i> Doanh thu 7 ngày qua</h3>
     </div>
        <div className="bar-chart">
          {data.revenueByDay.map((day, index) => {
    const maxRevenue = Math.max(...data.revenueByDay.map(d => d.revenue));
            const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
            
            return (
           <div key={index} className="chart-bar">
       <div className="bar-value">{formatCompactPrice(day.revenue)}</div>
   <div className="bar-container">
      <div 
   className="bar-fill" 
          style={{ height: `${height}%` }}
      title={formatCurrency(day.revenue)}
     ></div>
   </div>
     <div className="bar-label">{day.day}</div>
           </div>
       );
          })}
        </div>
      </div>

      {/* Two Columns */}
      <div className="analytics-columns">
   {/* Top Products */}
        <div className="analytics-card">
   <div className="card-header">
          <h3><i className="fas fa-star"></i> Sản phẩm bán chạy</h3>
  </div>
   <div className="card-body">
            {data.topProducts.length > 0 ? (
  <div className="product-list">
  {data.topProducts.map((product, index) => (
           <div key={index} className="product-item">
<div className="product-rank">{index + 1}</div>
        <div className="product-info">
    <h4>{product.name}</h4>
        <p>{product.quantity} đã bán</p>
 </div>
         <div className="product-revenue">
             {formatCompactPrice(product.revenue)}
             </div>
      </div>
   ))}
           </div>
            ) : (
        <div className="empty-data">
       <i className="fas fa-box-open"></i>
       <p>Chưa có dữ liệu</p>
              </div>
)}
</div>
        </div>

        {/* Peak Hours */}
        <div className="analytics-card">
   <div className="card-header">
   <h3><i className="fas fa-clock"></i> Giờ cao điểm</h3>
     </div>
<div className="card-body">
        {data.peakHours.length > 0 ? (
     <div className="hours-list">
     {data.peakHours.map((hour, index) => (
<div key={index} className="hour-item">
           <div className="hour-time">
        <i className="fas fa-clock"></i>
           {hour.hour}:00 - {hour.hour + 1}:00
    </div>
            <div className="hour-bar">
      <div 
             className="hour-fill" 
  style={{ 
   width: `${(hour.orders / data.peakHours[0].orders) * 100}%` 
              }}
      ></div>
      </div>
            <div className="hour-count">{hour.orders} đơn</div>
         </div>
      ))}
  </div>
       ) : (
              <div className="empty-data">
 <i className="fas fa-clock"></i>
    <p>Chưa có dữ liệu</p>
     </div>
        )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="analytics-actions">
  <button className="action-card" onClick={() => navigate('/orders')}>
          <i className="fas fa-list"></i>
          <span>Xem tất cả đơn hàng</span>
        </button>
        <button className="action-card" onClick={() => navigate('/products')}>
          <i className="fas fa-box"></i>
        <span>Quản lý sản phẩm</span>
        </button>
        <button className="action-card" onClick={() => navigate('/tables')}>
          <i className="fas fa-chair"></i>
          <span>Quản lý bàn</span>
    </button>
      </div>
    </div>
  );
};

export default Analytics;
