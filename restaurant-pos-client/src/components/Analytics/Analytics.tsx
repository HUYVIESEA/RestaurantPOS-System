import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService, AnalyticsData } from '../../services/analyticsService';
import { formatCurrency, formatCompactPrice } from '../../utils/priceUtils';
import { SkeletonStats } from '../Common/Skeleton';
import { useToast } from '../../contexts/ToastContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]); // Fetch on timeRange change

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analyticsData = await analyticsService.getAnalytics(); // You might want to pass timeRange to backend if supported
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showError('Không thể tải dữ liệu phân tích');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Ngay,Doanh Thu\n";
    data.revenueByDay.forEach(item => {
      csvContent += `${item.day},${item.revenue}\n`;
    });

    csvContent += "\nTop San Pham\n";
    csvContent += "Ten San Pham,So Luong,Doanh Thu\n";
    data.topProducts.forEach(item => {
      csvContent += `${item.name},${item.quantity},${item.revenue}\n`;
    });

    csvContent += "\nTong Quan\n";
    csvContent += `Tong Doanh Thu (Tuan),${data.weekRevenue}\n`;
    csvContent += `Don Hang Hoan Thanh,${data.completedOrders}\n`;
    csvContent += `Gia Tri Trung Binh,${data.averageOrderValue}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bao_cao_doanh_thu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold"><i className="fas fa-chart-area mr-2"></i> Phân tích & Báo cáo</h2>
        </div>
        <SkeletonStats />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 flex items-center justify-center bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100">
        <div className="text-red-500 bg-red-100 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800">Không thể tải dữ liệu phân tích</div>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.revenueByDay.map(d => ({
    name: d.day,
    DoanhThu: d.revenue
  }));

  const peakHoursData = data.peakHours.map(h => ({
    name: `${h.hour}:00`,
    DonHang: h.orders
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</p>
          <p className="font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const OrdersTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</p>
          <p className="font-bold text-purple-600 dark:text-purple-400">
            {payload[0].value} đơn
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold"><i className="fas fa-chart-area mr-2 text-indigo-500"></i> Phân tích nâng cao</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Thông tin chi tiết về hoạt động kinh doanh (Enterprise Dashboard)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              onClick={() => setTimeRange('week')}
            >
              7 ngày
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              onClick={() => setTimeRange('month')}
            >
              30 ngày
            </button>
          </div>
          <button className="px-4 py-2 bg-slate-800 text-white dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors font-medium flex items-center gap-2" onClick={handleExportCSV}>
            <i className="fas fa-file-csv"></i> Xuất CSV
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-colors font-medium flex items-center gap-2" onClick={fetchAnalytics}>
            <i className="fas fa-sync-alt"></i> Làm mới
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl shrink-0 z-10">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Doanh thu {timeRange === 'week' ? 'tuần' : 'tháng'}</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(timeRange === 'week' ? data.weekRevenue : data.monthRevenue)}</p>
            <div className={`text-sm mt-1 flex items-center gap-1 font-semibold ${data.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              <i className={`fas fa-arrow-${data.revenueGrowth >= 0 ? 'up' : 'down'}`}></i>
              {Math.abs(data.revenueGrowth).toFixed(1)}% so với tuần trước
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl shrink-0 z-10">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <div className="z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Đơn hoàn thành</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{data.completedOrders}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {data.pendingOrders} đang chờ • {data.cancelledOrders} hủy
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shrink-0 z-10">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Giá trị trung bình</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(data.averageOrderValue)}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Trên mỗi đơn hàng</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl"></div>
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl shrink-0 z-10">
            <i className="fas fa-chair"></i>
          </div>
          <div className="flex-1 w-full z-10">
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Tỷ lệ lấp đầy</h3>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{data.tableOccupancyRate.toFixed(1)}%</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div 
                className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${data.tableOccupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white"><i className="fas fa-chart-area mr-2 text-indigo-500"></i> Xu hướng doanh thu</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => formatCompactPrice(value)}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="DoanhThu" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Bar Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white"><i className="fas fa-clock mr-2 text-purple-500"></i> Giờ cao điểm</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <Tooltip content={<OrdersTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="DonHang" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white"><i className="fas fa-star text-amber-500 mr-2"></i> Món ăn bán chạy</h3>
          </div>
          <div>
            {data.topProducts.length > 0 ? (
              <div className="space-y-4">
                {data.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-all">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${index === 0 ? 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-900' : index === 1 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800' : index === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-orange-900' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{index + 1}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{product.name}</h4>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{product.quantity} phần đã bán</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                        {formatCompactPrice(product.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <i className="fas fa-box-open text-4xl mb-3 opacity-50"></i>
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 rounded-2xl shadow-lg text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-0 bottom-0 w-48 h-48 bg-black opacity-10 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-2">Thao tác nhanh</h3>
            <p className="text-indigo-100 mb-8">Truy cập nhanh các chức năng quản lý cốt lõi</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all backdrop-blur-sm group" onClick={() => navigate('/orders')}>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <i className="fas fa-list"></i>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-lg">Đơn hàng</span>
                  <span className="block text-sm text-indigo-200">Quản lý hóa đơn</span>
                </div>
              </button>
              
              <button className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all backdrop-blur-sm group" onClick={() => navigate('/products')}>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <i className="fas fa-box"></i>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-lg">Thực đơn</span>
                  <span className="block text-sm text-indigo-200">Cập nhật món ăn</span>
                </div>
              </button>
              
              <button className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all backdrop-blur-sm group sm:col-span-2" onClick={() => navigate('/tables')}>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  <i className="fas fa-chair"></i>
                </div>
                <div className="text-left">
                  <span className="block font-bold text-lg">Sơ đồ bàn</span>
                  <span className="block text-sm text-indigo-200">Quản lý trạng thái bàn</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;