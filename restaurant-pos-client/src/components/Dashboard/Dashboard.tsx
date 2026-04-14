import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import reportService from '../../services/reportService';
import { categoryService } from '../../services/categoryService';
import { tableService } from '../../services/tableService';
import { formatCurrency } from '../../utils/priceUtils';
import { SkeletonStats } from '../Common/Skeleton';
import { useSignalR } from '../../contexts/SignalRContext';
import ShiftWidget from '../Shifts/ShiftWidget';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  availableTables: number;
  todayRevenue: number;
  pendingOrders: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    availableTables: 0,
    todayRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { connection, isConnected } = useSignalR();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (connection && isConnected) {
      const handleOrderUpdate = () => {
        console.log('⚡ Realtime update: Data changed');
        fetchDashboardData();
      };

      connection.on('ordercreated', handleOrderUpdate);
      connection.on('orderupdated', handleOrderUpdate);
      connection.on('ordercompleted', handleOrderUpdate);
      connection.on('tableupdated', handleOrderUpdate);

      return () => {
        connection.off('ordercreated', handleOrderUpdate);
        connection.off('orderupdated', handleOrderUpdate);
        connection.off('ordercompleted', handleOrderUpdate);
        connection.off('tableupdated', handleOrderUpdate);
      };
    }
  }, [connection, isConnected]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [products, categories, tables, summary, statistics] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        tableService.getAll(),
        reportService.getSalesSummary(),
        reportService.getOrderStatistics(today, today)
      ]);

      setStats({
        totalProducts: products.length,
        totalOrders: summary.todayOrders,
        totalCategories: categories.length,
        availableTables: tables.filter(t => t.isAvailable).length,
        todayRevenue: summary.todayRevenue,
        pendingOrders: statistics.pendingOrders,
      });
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 space-y-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <i className="fas fa-chart-pie text-indigo-500"></i> Dashboard
          </h2>
        </div>
        <SkeletonStats />
      </div>
    );
  }
  
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow-sm text-lg font-medium">
        {error}
      </div>
    </div>
  );

  return (
    <div className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold flex items-center gap-3">
            <i className="fas fa-chart-pie text-indigo-500"></i> Dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Tổng quan hệ thống Restaurant POS</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm border ${isConnected ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800'}`}>
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-colors font-medium"
            onClick={fetchDashboardData}
          >
            <i className="fas fa-rotate"></i> Làm mới
          </button>
        </div>
      </div>

      <ShiftWidget />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
        {/* Products Stat */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-hamburger"></i>
            </div>
            <div className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg flex items-center gap-1">
              <i className="fas fa-arrow-up"></i> +5%
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Thực đơn</p>
            <h3 className="text-3xl font-bold">{stats.totalProducts}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Tổng thực đơn</p>
          </div>
        </div>

        {/* Orders Stat */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-shopping-basket"></i>
            </div>
            <div className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg flex items-center gap-1">
              <i className="fas fa-arrow-up"></i> +12%
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Đơn hàng</p>
            <h3 className="text-3xl font-bold">{stats.totalOrders}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Tổng đơn hàng</p>
          </div>
        </div>

        {/* Categories Stat */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-layer-group"></i>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Danh mục</p>
            <h3 className="text-3xl font-bold">{stats.totalCategories}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Tổng danh mục</p>
          </div>
        </div>

        {/* Tables Stat */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-couch"></i>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Bàn trống</p>
            <h3 className="text-3xl font-bold">{stats.availableTables}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Sẵn sàng phục vụ</p>
          </div>
        </div>

        {/* Revenue Stat */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg flex items-center gap-1">
              <i className="fas fa-arrow-up"></i> +8%
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Doanh thu hôm nay</p>
            <h3 className="text-3xl font-bold">{formatCurrency(stats.todayRevenue)}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Đơn hàng hoàn thành</p>
          </div>
        </div>

        {/* Pending Orders Stat */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col relative overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center text-xl">
              <i className="fas fa-clock"></i>
            </div>
            {stats.pendingOrders > 0 && (
              <div className="text-xs font-bold text-rose-600 bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                <i className="fas fa-circle-exclamation"></i> Chú ý
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Đơn chờ xử lý</p>
            <h3 className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.pendingOrders}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Cần xử lý ngay</p>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-yellow-500">⚡</span> Thao tác nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
            onClick={() => navigate('/tables')}
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-2xl mr-4">🍽️</div>
            <div>
              <span className="block font-bold text-lg text-slate-800 dark:text-slate-100">Đặt món</span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Từ danh sách bàn</span>
            </div>
          </button>
          
          <button 
            className="flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
            onClick={() => navigate('/products')}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl mr-4">📦</div>
            <div>
              <span className="block font-bold text-lg text-slate-800 dark:text-slate-100">Thực đơn</span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Quản lý thực đơn</span>
            </div>
          </button>
          
          <button 
            className="flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
            onClick={() => navigate('/orders')}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-2xl mr-4">📋</div>
            <div>
              <span className="block font-bold text-lg text-slate-800 dark:text-slate-100">Đơn hàng</span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Xem tất cả</span>
            </div>
          </button>
          
          <button 
            className="flex items-center p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
            onClick={() => navigate('/analytics')}
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-2xl mr-4">📊</div>
            <div>
              <span className="block font-bold text-lg text-slate-800 dark:text-slate-100">Báo cáo</span>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Phân tích dữ liệu</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><span className="text-xl">🎯</span> Mục tiêu hôm nay</h4>
          <p className="text-slate-600 dark:text-slate-300">Phục vụ tốt nhất cho khách hàng</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><span className="text-xl">📈</span> Hiệu suất</h4>
          <p className="text-slate-600 dark:text-slate-300">Hệ thống hoạt động ổn định</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><span className="text-xl">🔔</span> Thông báo</h4>
          <p className="text-slate-600 dark:text-slate-300">
            {stats.pendingOrders > 0 ? (
              <span className="text-rose-600 dark:text-rose-400 font-medium">{stats.pendingOrders} đơn hàng cần xử lý</span>
            ) : (
              'Không có thông báo mới'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
