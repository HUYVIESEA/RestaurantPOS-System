import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { tableService } from '../../services/tableService'; // ✅ ADD
import { Order } from '../../types';
import { formatPrice } from '../../utils/priceUtils';
import { useToast } from '../../contexts/ToastContext';
import { useSignalR } from '../../contexts/SignalRContext';
import ConfirmDialog from '../Common/ConfirmDialog';
import VietQRView from '../Payment/VietQRView'; // ✅ ADD
import '../Payment/VietQRView.css'; // ✅ ADD
import './OrderList.css';


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

  // ✅ Listen for SignalR events
  useEffect(() => {
    if (connection) {
      connection.on('OrderCreated', (newOrder: Order) => {
        setOrders(prev => [newOrder, ...prev]);
        showToast(`Đơn hàng mới #${newOrder.id} vừa được tạo!`, 'info');
      });

      connection.on('OrderUpdated', (updatedOrder: Order) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      });

      return () => {
        connection.off('OrderCreated');
        connection.off('OrderUpdated');
      };
    }
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
    } finally {
      // setLoading(false);
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
      
      // Release table
      if (payingOrder.tableId) {
          try {
              await tableService.updateAvailability(payingOrder.tableId, true);
          } catch (tableErr) {
              console.error('Failed to release table:', tableErr);
          }
      }

      setOrders(orders.map(o => o.id === payingOrder.id ? { ...o, status: 'Completed' } : o));
      showToast(`✅ Thanh toán thành công đơn hàng #${payingOrder.id}`, 'success');
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
    prepared: orders.filter(o => o.status === 'Prepared').length, // ✅ New
    completed: orders.filter(o => o.status === 'Completed').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Prepared': return 'status-prepared'; // ✅ New
      case 'Completed': return 'status-completed';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };



  return (
    <div className="orders-container">
      <div className="orders-header">
        <div>
            <h1><i className="fas fa-clipboard-list"></i> Quản lý Đơn hàng</h1>
            <p className="orders-subtitle">Theo dõi và cập nhật trạng thái đơn hàng</p>
        </div>
        
        <div className="header-controls">
            <div className="view-switcher">
                <button 
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="Dạng danh sách"
                >
                    <i className="fas fa-list"></i>
                </button>
                <button 
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Dạng lưới"
                >
                    <i className="fas fa-th-large"></i>
                </button>
            </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="status-overview">
        <div 
          className={`status-card total ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="status-icon"><i className="fas fa-chart-pie"></i></div>
          <div className="status-info">
            <div className="status-label">Tất cả</div>
            <div className="status-count">{stats.total}</div>
          </div>
        </div>

        <div 
          className={`status-card pending ${statusFilter === 'Pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Pending')}
        >
          <div className="status-icon" style={{color: '#F57F17'}}><i className="fas fa-clock"></i></div>
          <div className="status-info">
            <div className="status-label">Đang xử lý</div>
            <div className="status-count">{stats.pending}</div>
          </div>
        </div>

        {/* ✅ NEW: Prepared Card */}
        <div 
          className={`status-card prepared ${statusFilter === 'Prepared' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Prepared')}
        >
          <div className="status-icon" style={{color: '#0288D1'}}><i className="fas fa-bell"></i></div>
          <div className="status-info">
            <div className="status-label">Món đã xong</div>
            <div className="status-count">{stats.prepared}</div>
          </div>
        </div>

        <div 
          className={`status-card completed ${statusFilter === 'Completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Completed')}
        >
          <div className="status-icon" style={{color: '#2E7D32'}}><i className="fas fa-check-circle"></i></div>
          <div className="status-info">
            <div className="status-label">Hoàn thành</div>
            <div className="status-count">{stats.completed}</div>
          </div>
        </div>

        <div 
          className={`status-card cancelled ${statusFilter === 'Cancelled' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Cancelled')}
        >
          <div className="status-icon" style={{color: '#C62828'}}><i className="fas fa-ban"></i></div>
          <div className="status-info">
            <div className="status-label">Đã hủy</div>
            <div className="status-count">{stats.cancelled}</div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
          /* Orders Table (List View) */
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Mã ĐH</th>
                  <th>Bàn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th style={{textAlign: 'right'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data" style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                      <i className="fas fa-inbox" style={{fontSize: '3rem', marginBottom: '1rem', display: 'block', opacity: 0.5}}></i>
                      Không có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.id}</td>
                      <td className="table-number">
                        {order.table ? (
                          <strong>{order.table.tableNumber}</strong>
                        ) : (
                          <span className="table-badge takeaway">
                            <i className="fas fa-shopping-bag"></i> Mang về
                          </span>
                        )}
                      </td>
                      <td className="customer-name">
                        {order.customerName || 'Khách vãng lai'}
                      </td>
                      <td className="order-date">
                        {new Date(order.orderDate).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="total-amount">
                        <span className="price-highlight">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </td>
                      <td className="status-cell">
                        <select
                          className={`status-select ${getStatusColor(order.status)}`}
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        >
                          <option value="Pending">Đang xử lý</option>
                          <option value="Prepared">Món đã xong</option>
                          <option value="Completed">Hoàn thành</option>
                          <option value="Cancelled">Đã hủy</option>
                        </select>
                      </td>
                      <td className="actions-cell" style={{justifyContent: 'flex-end'}}>
                        {order.status === 'Pending' && (
                          <button 
                            className="btn-payment-mini"
                            onClick={() => handlePaymentClick(order)}
                            title="Thanh toán ngay"
                          >
                             <i className="fas fa-wallet"></i>
                          </button>
                        )}
                        <button 
                          className="btn-detail"
                          onClick={() => handleViewDetails(order.id)}
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteClick(order.id)}
                          title="Xóa đơn hàng"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      ) : (
         /* Grid View (Card Layout) */
         <div className="orders-grid">
            {filteredOrders.map((order) => (
                <div key={order.id} className="order-card">
                    <div className="order-card-header">
                        <span className="order-id-badge">#{order.id}</span>
                        {order.table ? (
                            <div className="table-badge">
                                <i className="fas fa-chair"></i> {order.table.tableNumber}
                            </div>
                        ) : (
                            <div className="table-badge takeaway">
                                <i className="fas fa-shopping-bag"></i> Mang về
                            </div>
                        )}
                    </div>
                    
                    <div className="order-card-body">
                        <div className="customer-info" title="Khách hàng">
                            <i className="fas fa-user-circle"></i> 
                            <span>{order.customerName || 'Khách vãng lai'}</span>
                        </div>
                        <div className="order-time" title="Thời gian đặt">
                            <i className="far fa-clock"></i>
                            {new Date(order.orderDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} 
                            <span style={{fontSize: '0.8em', opacity: 0.7}}>
                                ({new Date(order.orderDate).toLocaleDateString('vi-VN')})
                            </span>
                        </div>
                        
                        <div className="card-amount">
                             Total: {formatPrice(order.totalAmount)}
                        </div>
                    </div>

                    <div className="order-card-footer">
                         <div style={{flex: 1}}>
                            <select
                              className={`status-select ${getStatusColor(order.status)}`}
                              value={order.status}
                              onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                              style={{width: '100%'}}
                            >
                              <option value="Pending">Running</option>
                              <option value="Prepared">Ready</option>
                              <option value="Completed">Done</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                         </div>
                         
                         <div style={{display: 'flex', gap: '0.5rem'}}>
                            {order.status === 'Pending' && (
                                <button className="btn-payment-mini" onClick={() => handlePaymentClick(order)} title="Thanh toán">
                                    <i className="fas fa-wallet"></i>
                                </button>
                            )}
                            <button className="btn-detail" onClick={() => handleViewDetails(order.id)}>
                                <i className="fas fa-arrow-right"></i>
                            </button>
                         </div>
                    </div>
                </div>
            ))}
            {filteredOrders.length === 0 && (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                    <i className="fas fa-inbox" style={{fontSize: '3rem', marginBottom: '1rem', display: 'block', opacity: 0.5}}></i>
                    Không có đơn hàng nào
                </div>
            )}
         </div>
      )}

      {/* Pagination placeholder */}
      <div className="pagination">
        {/* Add pagination later if needed */}
      </div>

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
        <div className="modal-overlay" onClick={() => { setPayingOrder(null); setShowQR(false); }}>
          <div className="modal-content payment-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{showQR ? 'Thanh toán VietQR' : 'Chọn hình thức thanh toán'}</h3>
            {showQR ? (
                <VietQRView 
                    amount={payingOrder.totalAmount}
                    description={`Thanh toan don ${payingOrder.id}`}
                    onSuccess={handlePaymentComplete}
                    onCancel={() => setShowQR(false)}
                />
            ) : (
                <>
                    <p className="payment-amount">
                        Đơn hàng #{payingOrder.id}<br/>
                        Tổng tiền: <strong>{formatPrice(payingOrder.totalAmount)}</strong>
                    </p>
                    <div className="payment-methods">
                        <button 
                            className="payment-method-btn cash"
                            onClick={handleCashPayment}
                        >
                            <i className="fas fa-money-bill-wave"></i>
                            <span>Tiền mặt</span>
                        </button>

                        <button 
                            className="payment-method-btn qr"
                            onClick={() => setShowQR(true)}
                        >
                            <i className="fas fa-qrcode"></i>
                            <span>Chuyển khoản QR</span>
                        </button>
                    </div>
                
                    <button 
                        className="btn btn-secondary"
                        onClick={() => { setPayingOrder(null); setShowQR(false); }}
                        style={{ marginTop: '1rem', width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                    >
                        Hủy bỏ
                    </button>
                </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderList;
