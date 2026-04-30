import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { formatPrice } from '../../utils/priceUtils';
import { useToast } from '../../contexts/ToastContext';
import { useSignalR } from '../../contexts/SignalRContext';
import ConfirmDialog from '../Common/ConfirmDialog';
import CustomSelect from '../Common/CustomSelect';
import VietQRView from '../Payment/VietQRView';

// Status options for order dropdown - Workflow: Pending → Prepared → Completed
const statusOptions = [
  { value: 'Pending', label: 'Chờ chế biến', icon: 'fas fa-fire' },
  { value: 'Prepared', label: 'Đã nấu xong', icon: 'fas fa-bell-concierge' },
  { value: 'Completed', label: 'Đã thanh toán', icon: 'fas fa-circle-check' },
  { value: 'Cancelled', label: 'Đã hủy', icon: 'fas fa-ban' },
];

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { connection } = useSignalR();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  // Payment state
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [showQR, setShowQR] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen for SignalR events
  useEffect(() => {
    if (!connection) return;

    const handleOrderCreated = async (orderId: number) => {
      try {
        const newOrder = await orderService.getById(orderId);
        setOrders(prev => {
          if (prev.some(o => o.id === orderId)) return prev;
          return [newOrder, ...prev];
        });
        showToast(`Đơn hàng mới #${newOrder.id} vừa được tạo!`, 'info');
      } catch (err) {
        console.error("Failed to fetch new order details", err);
      }
    };

    const handleOrderUpdated = async (orderId: number) => {
      try {
        const updatedOrder = await orderService.getById(orderId);
        setOrders(prev => {
          const exists = prev.some(o => o.id === orderId);
          if (exists) {
            return prev.map(o => o.id === orderId ? updatedOrder : o);
          } else {
            return [updatedOrder, ...prev].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
          }
        });
      } catch (err) {
        console.error("Failed to fetch updated order details", err);
      }
    };

    const handleOrderCompleted = (orderId: number) => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o));
    };

    connection.on('ordercreated', handleOrderCreated);
    connection.on('orderupdated', handleOrderUpdated);
    connection.on('ordercompleted', handleOrderCompleted);

    return () => {
      connection.off('ordercreated', handleOrderCreated);
      connection.off('orderupdated', handleOrderUpdated);
      connection.off('ordercompleted', handleOrderCompleted);
    };
  }, [connection, showToast]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAll();
      // Sort by date descending (newest first)
      const sortedOrders = data.sort((a, b) => 
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );
      setOrders(sortedOrders);
    } catch (err) {
      showToast('Không thể tải đơn hàng', 'error');
      console.error('Error fetching orders:', err);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await orderService.updateStatus(id, newStatus);
      setOrders(orders.map(order => 
        order.id === id ? { ...order, status: newStatus } : order
      ));
      showToast('Cập nhật trạng thái thành công', 'success');
    } catch (err) {
      showToast('Không thể cập nhật trạng thái', 'error');
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteClick = (id: number) => {
    setOrderToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete === null) return;

    try {
      await orderService.delete(orderToDelete);
      setOrders(orders.filter(o => o.id !== orderToDelete));
      showToast('Xóa đơn hàng thành công', 'success');
    } catch (err) {
      showToast('Không thể xóa đơn hàng', 'error');
      console.error('Error deleting order:', err);
    } finally {
      setShowConfirmDialog(false);
      setOrderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setOrderToDelete(null);
  };

  const handleViewDetails = (id: number) => {
    navigate(`/orders/${id}`);
  };

  // Payment Handlers
  const handlePaymentClick = (order: Order) => {
    setPayingOrder(order);
    setShowQR(false); // Reset to method selection
  };

  const handlePaymentComplete = async () => {
    if (!payingOrder) return;

    try {
      await orderService.updateStatus(payingOrder.id, 'Completed');
      
      setOrders(orders.map(o => o.id === payingOrder.id ? { ...o, status: 'Completed' } : o));
      showToast(`<i class="fa-solid fa-check-circle mr-1"></i> Thanh toán thành công đơn hàng #${payingOrder.id}`, 'success');
      setPayingOrder(null);
      setShowQR(false);
    } catch (err) {
      showToast('Không thể hoàn thành thanh toán', 'error');
      console.error('Error completing payment:', err);
    }
  };

  const handleCashPayment = () => {
    if (!payingOrder) return;
    if (window.confirm(`Xác nhận thanh toán tiền mặt cho đơn #${payingOrder.id}?\n\nTổng tiền: ${formatPrice(payingOrder.totalAmount)}`)) {
        handlePaymentComplete();
    }
  };

  // Filter orders by status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    prepared: orders.filter(o => o.status === 'Prepared').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  const getStatusColorClass = (status: string, isTextOnly = false) => {
    switch (status) {
      case 'Pending': return isTextOnly ? 'text-blue-600' : 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-500';
      case 'Prepared': return isTextOnly ? 'text-sky-500' : 'bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400';
      case 'Completed': return isTextOnly ? 'text-blue-600' : 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-500';
      case 'Cancelled': return isTextOnly ? 'text-red-500' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400';
      default: return isTextOnly ? 'text-slate-500' : 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  const getStatusIconColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-600/10';
      case 'Prepared': return 'text-sky-500 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10';
      case 'Completed': return 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-600/10';
      case 'Cancelled': return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10';
      case 'all': return 'text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-600/10';
      default: return 'text-slate-500 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  const renderStatusCard = (type: string, label: string, count: number, iconClass: string) => {
    const isActive = statusFilter === type;
    
    return (
      <div 
        className={`rounded-xl p-4 flex items-center gap-4 cursor-pointer border-2 transition-all min-h-[80px] shadow-sm select-none
          ${isActive 
            ? 'border-blue-600 bg-blue-50/30 dark:border-blue-500 dark:bg-blue-900/20' 
            : 'border-transparent bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        onClick={() => setStatusFilter(type)}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${getStatusIconColor(type)}`}>
          <i className={iconClass}></i>
        </div>
        <div className="flex flex-col">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{count}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <i className="fas fa-clipboard-list text-blue-600"></i> 
              Quản lý Đơn hàng
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Theo dõi và cập nhật trạng thái đơn hàng</p>
        </div>
        
        <div className="flex items-center">
            <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
                <button 
                    className={`p-3 rounded-lg min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors focus:outline-none 
                      ${viewMode === 'list' 
                        ? 'bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-500 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    onClick={() => setViewMode('list')}
                    title="Dạng danh sách"
                >
                    <i className="fas fa-list"></i>
                </button>
                <button 
                    className={`p-3 rounded-lg min-w-[48px] min-h-[48px] flex items-center justify-center transition-colors focus:outline-none 
                      ${viewMode === 'grid' 
                        ? 'bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-500 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    onClick={() => setViewMode('grid')}
                    title="Dạng lưới"
                >
                    <i className="fas fa-th-large"></i>
                </button>
            </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {renderStatusCard('all', 'Tất cả', stats.total, 'fas fa-chart-pie')}
        {renderStatusCard('Pending', 'Chờ chế biến', stats.pending, 'fas fa-fire')}
        {renderStatusCard('Prepared', 'Đã nấu xong', stats.prepared, 'fas fa-bell-concierge')}
        {renderStatusCard('Completed', 'Đã thanh toán', stats.completed, 'fas fa-circle-check')}
        {renderStatusCard('Cancelled', 'Đã hủy', stats.cancelled, 'fas fa-ban')}
      </div>

      {viewMode === 'list' ? (
          /* Orders Table (List View) */
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Mã ĐH</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Bàn</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Khách hàng</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Ngày đặt</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Tổng tiền</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">Trạng thái</th>
                  <th className="p-4 font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500 dark:text-slate-400">
                      <i className="fas fa-inbox text-5xl mb-4 opacity-50 block"></i>
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-4 font-mono font-medium text-slate-900 dark:text-slate-100 align-middle">#{order.id}</td>
                      <td className="p-4 align-middle">
                        {order.table ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300 font-bold whitespace-nowrap">
                            <i className="fas fa-chair text-sm"></i>
                            {order.table.tableNumber}
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 font-bold whitespace-nowrap">
                            <i className="fas fa-shopping-bag text-sm"></i> Mang về
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-medium align-middle">
                        {order.customerName || <span className="text-slate-400 italic">Khách vãng lai</span>}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 align-middle whitespace-nowrap">
                        {new Date(order.orderDate).toLocaleString('vi-VN', {
                          hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white align-middle whitespace-nowrap">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="w-44">
                          <CustomSelect
                            options={statusOptions}
                            value={order.status}
                            onChange={(val) => handleUpdateStatus(order.id, val)}
                            className={`min-h-[44px] ${getStatusColorClass(order.status)}`}
                          />
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center justify-end gap-2">
                          {(order.status === 'Pending' || order.status === 'Prepared') && (
                            <button 
                              className="min-w-[44px] min-h-[44px] p-2 rounded-xl flex items-center justify-center text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-500 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                              onClick={() => handlePaymentClick(order)}
                              title="Thanh toán ngay"
                            >
                               <i className="fas fa-wallet text-lg"></i>
                            </button>
                          )}
                          <button 
                            className="min-w-[44px] min-h-[44px] p-2 rounded-xl flex items-center justify-center text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-500 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                            onClick={() => handleViewDetails(order.id)}
                            title="Xem chi tiết"
                          >
                            <i className="fas fa-eye text-lg"></i>
                          </button>
                          <button 
                            className="min-w-[44px] min-h-[44px] p-2 rounded-xl flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                            onClick={() => handleDeleteClick(order.id)}
                            title="Xóa đơn hàng"
                          >
                            <i className="fas fa-trash text-lg"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      ) : (
         /* Grid View (Card Layout) */
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{order.id}</span>
                        {order.table ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 dark:bg-blue-600/20 dark:text-blue-300 text-sm font-bold">
                                <i className="fas fa-chair text-xs"></i> {order.table.tableNumber}
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 text-sm font-bold">
                                <i className="fas fa-shopping-bag text-xs"></i> Mang về
                            </div>
                        )}
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col gap-3">
                        <div className="flex items-center gap-3 text-slate-800 dark:text-slate-200 font-medium" title="Khách hàng">
                            <i className="fas fa-circle-user text-slate-400 text-lg"></i> 
                            <span className="truncate">{order.customerName || <span className="text-slate-400 italic font-normal">Khách vãng lai</span>}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm" title="Thời gian đặt">
                            <i className="far fa-clock text-slate-400 text-lg"></i>
                            <span>
                              {new Date(order.orderDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} 
                              <span className="text-xs opacity-70 ml-1">
                                  ({new Date(order.orderDate).toLocaleDateString('vi-VN')})
                              </span>
                            </span>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-end justify-between">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">Tổng cộng:</span>
                            <span className="text-xl font-bold text-blue-700 dark:text-blue-500">
                              {formatPrice(order.totalAmount)}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                         <div className="flex-1">
                            <select
                              className={`w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium appearance-none cursor-pointer ${getStatusColorClass(order.status)}`}
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            >
                              <option value="Pending">Chờ chế biến</option>
                              <option value="Prepared">Đã nấu xong</option>
                              <option value="Completed">Đã thanh toán</option>
                              <option value="Cancelled">Đã hủy</option>
                            </select>
                         </div>
                         
                         <div className="flex items-center gap-2">
                            {(order.status === 'Pending' || order.status === 'Prepared') && (
                                <button 
                                  className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-500 dark:bg-blue-600/20 dark:hover:bg-blue-600/30 transition-colors"
                                  onClick={() => handlePaymentClick(order)} 
                                  title="Thanh toán"
                                >
                                    <i className="fas fa-wallet text-lg"></i>
                                </button>
                            )}
                            <button 
                              className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 transition-colors shadow-sm"
                              onClick={() => handleViewDetails(order.id)}
                            >
                                <i className="fas fa-arrow-right text-lg"></i>
                            </button>
                         </div>
                    </div>
                </div>
            ))}
            {filteredOrders.length === 0 && (
                <div className="col-span-full p-12 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <i className="fas fa-inbox text-5xl mb-4 opacity-50 block"></i>
                    Không có đơn hàng nào
                </div>
            )}
         </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Xác nhận xóa đơn hàng"
        message="Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

    {/* Payment Method Dialog */}
    {payingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => { setPayingOrder(null); setShowQR(false); }}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
              {showQR ? 'Thanh toán VietQR' : 'Chọn hình thức thanh toán'}
            </h3>
            {showQR ? (
                <VietQRView 
                    amount={payingOrder.totalAmount}
                    description={`Thanh toan don ${payingOrder.id}`}
                    onSuccess={handlePaymentComplete}
                    onCancel={() => setShowQR(false)}
                />
            ) : (
                <div className="flex flex-col gap-6">
                    <div className="text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <div className="text-slate-500 dark:text-slate-400 mb-2">Đơn hàng #{payingOrder.id}</div>
                        <div className="text-3xl font-black text-blue-700 dark:text-blue-500">
                          {formatPrice(payingOrder.totalAmount)}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-600/10 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-500 transition-all focus:outline-none min-h-[120px]"
                            onClick={handleCashPayment}
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center text-blue-700 dark:text-blue-500 text-xl">
                              <i className="fas fa-money-bill-wave"></i>
                            </div>
                            <span className="font-bold">Tiền mặt</span>
                        </button>

                        <button 
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-600 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-600/10 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-500 transition-all focus:outline-none min-h-[120px]"
                            onClick={() => setShowQR(true)}
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-600/20 flex items-center justify-center text-blue-700 dark:text-blue-500 text-xl">
                              <i className="fas fa-qrcode"></i>
                            </div>
                            <span className="font-bold">Chuyển khoản</span>
                        </button>
                    </div>
                
                    <button 
                        className="mt-2 min-h-[56px] w-full rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-lg transition-colors focus:outline-none"
                        onClick={() => { setPayingOrder(null); setShowQR(false); }}
                    >
                        Hủy bỏ
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;
