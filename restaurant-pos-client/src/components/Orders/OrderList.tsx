import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';
import { formatPrice } from '../../utils/priceUtils';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../Common/ConfirmDialog';
import './OrderList.css';

const OrderList: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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

  // Filter orders by status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => {
        if (statusFilter === 'Pending') return order.status === 'Pending';
        if (statusFilter === 'Completed') return order.status === 'Completed';
        if (statusFilter === 'Cancelled') return order.status === 'Cancelled';
        return true;
      });

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    completed: orders.filter(o => o.status === 'Completed').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Completed': return 'status-completed';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>📋 Quản lý Đơn hàng</h1>
        <p className="orders-subtitle">Theo dõi và cập nhật trạng thái đơn hàng</p>
      </div>

      {/* Status Overview */}
      <div className="status-overview">
        <div 
          className={`status-card total ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          <div className="status-icon">📊</div>
          <div className="status-info">
            <div className="status-label">Tất cả</div>
            <div className="status-count">{stats.total}</div>
          </div>
        </div>

        <div 
          className={`status-card pending ${statusFilter === 'Pending' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Pending')}
        >
          <div className="status-icon">🟡</div>
          <div className="status-info">
            <div className="status-label">Đang xử lý</div>
            <div className="status-count">{stats.pending}</div>
          </div>
        </div>

        <div 
          className={`status-card completed ${statusFilter === 'Completed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Completed')}
        >
          <div className="status-icon">🟢</div>
          <div className="status-info">
            <div className="status-label">Hoàn thành</div>
            <div className="status-count">{stats.completed}</div>
          </div>
        </div>

        <div 
          className={`status-card cancelled ${statusFilter === 'Cancelled' ? 'active' : ''}`}
          onClick={() => setStatusFilter('Cancelled')}
        >
          <div className="status-icon">🔴</div>
          <div className="status-info">
            <div className="status-label">Đã hủy</div>
            <div className="status-count">{stats.cancelled}</div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
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
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  Không có đơn hàng nào
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td className="table-number">
                    <strong>{order.table?.tableNumber || 'N/A'}</strong>
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
                      <option value="Completed">Hoàn thành</option>
                      <option value="Cancelled">Đã hủy</option>
                    </select>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-detail"
                      onClick={() => handleViewDetails(order.id)}
                    >
                      Chi tiết
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteClick(order.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
    </div>
  );
};

export default OrderList;
