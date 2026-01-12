import React, { useEffect, useState } from 'react';
import bigDataService, { BigDataStoreRevenue, BigDataProductSales, BigDataMonthlyRevenue } from '../../services/bigDataService';
import { formatCurrency, formatCompactPrice } from '../../utils/priceUtils';
import { useToast } from '../../contexts/ToastContext';
import './BigDataAnalytics.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BigDataAnalytics: React.FC = () => {
  const { showError } = useToast();
  const [topStores, setTopStores] = useState<BigDataStoreRevenue[]>([]);
  const [topProducts, setTopProducts] = useState<BigDataProductSales[]>([]);
  const [revenueTrends, setRevenueTrends] = useState<BigDataMonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBigData();
  }, []);

  const fetchBigData = async () => {
    try {
      setLoading(true);
      const [stores, products, trends] = await Promise.all([
        bigDataService.getTopStores(),
        bigDataService.getBestSellers(),
        bigDataService.getMonthlyTrends()
      ]);
      setTopStores(stores);
      setTopProducts(products);
      // Backend returns Trends in desc order, we might want to sort for chart
      setRevenueTrends([...trends].reverse());
    } catch (error) {
      console.error('Error fetching big data:', error);
      showError('Không thể kết nối với hệ thống Big Data (MongoDB)');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bigdata-container">
        <div className="loading-state">Đang tính toán trên 1 triệu bản ghi MongoDB...</div>
      </div>
    );
  }

  const totalRevenue = topStores.reduce((acc, curr) => acc + curr.totalRevenue, 0);

  return (
    <div className="bigdata-container">
      <div className="bigdata-header">
        <div className="header-left">
          <h2><i className="fas fa-database"></i> Phân tích Big Data (MongoDB)</h2>
          <p className="subtitle">Tính toán thời gian thực trên 1,000,000+ đơn hàng</p>
        </div>
        <button className="btn btn-outline-light" onClick={fetchBigData}>
          <i className="fas fa-sync"></i> Refresh Analytics
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon"><i className="fas fa-money-bill-wave"></i></div>
          <div className="metric-content">
            <h3>Tổng doanh thu (Top 5 chi nhánh)</h3>
            <p className="metric-value text-primary">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><i className="fas fa-shopping-basket"></i></div>
          <div className="metric-content">
            <h3>Tổng sản phẩm bán ra (Top 5)</h3>
            <p className="metric-value text-success">
              {topProducts.reduce((acc, curr) => acc + curr.totalSold, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3><i className="fas fa-chart-line"></i> Xu hướng doanh thu theo tháng</h3>
        <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
          <ResponsiveContainer>
            <BarChart data={revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey={(d) => `${d.month}/${d.year}`} />
              <YAxis tickFormatter={(val) => formatCompactPrice(val)} />
              <Tooltip formatter={(val: number) => formatCurrency(val)} />
              <Bar dataKey="monthlySales" fill="#6200EA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="analytics-columns">
        <div className="bigdata-card">
          <div className="card-header">
            <h3><i className="fas fa-store"></i> Top 5 Chi nhánh Doanh thu cao</h3>
          </div>
          <div className="card-body">
            {topStores.map((store, index) => (
              <div key={index} className="data-item">
                <span className="item-name">Cửa hàng #{store.storeId}</span>
                <span className="item-value">{formatCurrency(store.totalRevenue)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bigdata-card">
          <div className="card-header">
            <h3><i className="fas fa-fire"></i> Top 5 Sản phẩm bán chạy nhất</h3>
          </div>
          <div className="card-body">
            {topProducts.map((product, index) => (
              <div key={index} className="data-item">
                <span className="item-name">{product.productName}</span>
                <span className="item-value">{product.totalSold.toLocaleString()} đơn</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BigDataAnalytics;
