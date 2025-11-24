import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Order, OrderItem } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import AddItemDialog from './AddItemDialog';
import CancelItemDialog from './CancelItemDialog';
import VnPayButton from '../Payment/VnPayButton';
import './OrderDetail.css';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelingItem, setCancelingItem] = useState<OrderItem | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const data = await orderService.getById(parseInt(id!));
      setOrder(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải chi tiết đơn hàng.');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle add item
  const handleAddItem = async (productId: number, quantity: number, notes: string) => {
    try {
      // Call API to add item to order
      await orderService.addItem(parseInt(id!), {
        productId,
        quantity,
        notes: notes || undefined,
      });
      
      // Close dialog
      setShowAddDialog(false);
      
      // Reload order to show new item
      await fetchOrderDetail();
      
      showSuccess(`✅ Đã thêm món thành công!\nSố lượng: ${quantity}`); // ✅ MODIFY
    } catch (err) {
      console.error('Error adding item:', err);
      showError('Không thể thêm món'); // ✅ MODIFY
    }
  };

  const handleToggleItem = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleCancelSelected = async () => {
    if (selectedItems.size === 0) {
      showWarning('Vui lòng chọn món cần hủy'); // ✅ CHANGED
      return;
    }

    const itemsToCancel = order?.orderItems?.filter(item => 
      selectedItems.has(item.id)
) || [];

const totalCancelled = itemsToCancel.reduce(
      (sum, item) => sum + (item.unitPrice * item.quantity), 
    0
    );

 const confirmMessage = `Bạn có chắc muốn hủy ${selectedItems.size} món?\n` +
   `Tổng tiền: ${totalCancelled.toLocaleString('vi-VN')} đ`;

    if (!window.confirm(confirmMessage)) return;

    try {
      // TODO: Call API to cancel items
    // For now, we'll delete them locally
      const remainingItems = order?.orderItems?.filter(item => 
    !selectedItems.has(item.id)
      ) || [];

  if (remainingItems.length === 0) {
     // If all items cancelled, cancel the order
      await orderService.updateStatus(parseInt(id!), 'Cancelled');
   showSuccess('Đã hủy tất cả món. Đơn hàng chuyển sang trạng thái "Đã hủy".'); // ✅ CHANGED
        navigate('/orders');
      } else {
        // Update order with remaining items
      setOrder({
...order!,
          orderItems: remainingItems,
          totalAmount: order!.totalAmount - totalCancelled
     });
      setSelectedItems(new Set());
        showSuccess(`Đã hủy ${selectedItems.size} món thành công!`); // ✅ CHANGED
      }
    } catch (err) {
    setError('Không thể hủy món.');
      console.error('Error cancelling items:', err);
    }
  };

  const handleCancelSingleItem = async (itemId: number) => {
    const item = order?.orderItems?.find(i => i.id === itemId);
    if (!item) return;

    const itemTotal = item.unitPrice * item.quantity;
    const confirmMessage = `Hủy món: ${item.product?.name}\n` +
      `Số lượng: ${item.quantity}\n` +
      `Tổng: ${itemTotal.toLocaleString('vi-VN')} đ`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await orderService.removeItem(parseInt(id!), itemId);
      await fetchOrderDetail();
      showSuccess('Đã hủy món thành công!'); // ✅ CHANGED
    } catch (err) {
      setError('Không thể hủy món.');
      console.error('Error:', err);
      showError('Không thể hủy món.');
    }
  };

  // ✅ NEW: Handle quantity change
  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
 if (newQuantity < 1) {
 // If quantity = 0, remove item
      handleCancelSingleItem(itemId);
      return;
    }

    try {
   await orderService.updateItemQuantity(parseInt(id!), itemId, newQuantity);
   await fetchOrderDetail();
    } catch (err) {
   setError('Không thể cập nhật số lượng.');
   console.error('Error:', err);
    }
  };

  // ✅ NEW: Handle partial cancel
  const handleCancelItem = (item: OrderItem) => {
    setCancelingItem(item);
    setShowCancelDialog(true);
  };

  // ✅ NEW: Confirm partial cancel
  const handleCancelConfirm = async (cancelQuantity: number) => {
    if (!cancelingItem) return;

    try {
      const remainingQuantity = cancelingItem.quantity - cancelQuantity;

      if (remainingQuantity === 0) {
        // Remove item completely
        await orderService.removeItem(parseInt(id!), cancelingItem.id);
   } else {
        // Update quantity
        await orderService.updateItemQuantity(parseInt(id!), cancelingItem.id, remainingQuantity);
      }

   // Close dialog and reload
      setShowCancelDialog(false);
    setCancelingItem(null);
      await fetchOrderDetail();
 
   const message = remainingQuantity === 0
        ? `Đã xóa món "${cancelingItem.product?.name}"`
 : `Đã hủy ${cancelQuantity} phần. Còn lại ${remainingQuantity} phần`;
      showSuccess(message);

    } catch (err) {
      setError('Không thể hủy món.');
      console.error('Error:', err);
      showError('Không thể hủy món.');
    }
  };

  // Handle cash payment
  const handleCashPayment = async () => {
    if (!window.confirm(`Xác nhận thanh toán tiền mặt?\n\nTổng tiền: ${order!.totalAmount.toLocaleString('vi-VN')} đ`)) {
      return;
    }

    try {
      await orderService.updateStatus(order!.id, 'Completed');
      showSuccess(`✅ Thanh toán thành công!\nBàn ${order!.table?.tableNumber} đã được trả tự động.`);
      navigate('/tables');
    } catch (err) {
      console.error('Error completing payment:', err);
      showError('Không thể hoàn thành thanh toán');
    }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Không tìm thấy đơn hàng</div>;

  return (
    <div className="order-detail-container">
   {/* ✅ Add Item Dialog */}
      {showAddDialog && (
        <AddItemDialog
          onAdd={handleAddItem}
       onCancel={() => setShowAddDialog(false)}
    />
    )}

      {/* ✅ NEW: Cancel Item Dialog */}
      {showCancelDialog && cancelingItem && (
   <CancelItemDialog
     item={cancelingItem}
          onConfirm={handleCancelConfirm}
          onCancel={() => {
       setShowCancelDialog(false);
   setCancelingItem(null);
 }}
  />
      )}

      {/* Payment Method Dialog */}
      {showPaymentDialog && (
        <div className="modal-overlay" onClick={() => setShowPaymentDialog(false)}>
          <div className="modal-content payment-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Chọn phương thức thanh toán</h3>
            <p className="payment-amount">Tổng tiền: <strong>{order.totalAmount.toLocaleString('vi-VN')} đ</strong></p>
            
            <div className="payment-methods">
              <button 
                className="payment-method-btn cash"
                onClick={() => {
                  setShowPaymentDialog(false);
                  handleCashPayment();
                }}
              >
                <i className="fas fa-money-bill-wave"></i>
                <span>Tiền mặt</span>
              </button>

              <VnPayButton 
                amount={order.totalAmount}
                orderDescription={`Thanh toán đơn hàng #${order.id} - Bàn ${order.table?.tableNumber}`}
                orderType="billpayment"
                onSuccess={(url) => {
                  // Redirect to VNPay payment page
                  window.location.href = url;
                }}
                onError={(error) => {
                  setShowPaymentDialog(false);
                  showError(`Thanh toán VNPay thất bại: ${error}`);
                }}
              />
            </div>

            <button 
              className="btn btn-secondary"
              onClick={() => setShowPaymentDialog(false)}
              style={{ marginTop: '1rem', width: '100%' }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      <div className="header">
        <div>
  <h2>Chi tiết Đơn hàng #{order.id}</h2>
   <p className="subtitle">
Bàn: {order.table?.tableNumber || 'N/A'} | 
        Trạng thái: <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span>
   </p>
        </div>
        <button className="btn btn-back" onClick={() => navigate('/tables')}>
          ← Quay lại
  </button>
      </div>

      <div className="order-info-grid">
        <div className="info-card">
  <label>Khách hàng</label>
        <p>{order.customerName || 'Khách vãng lai'}</p>
        </div>
 <div className="info-card">
      <label>Ngày đặt</label>
     <p>{new Date(order.orderDate).toLocaleString('vi-VN')}</p>
        </div>
        <div className="info-card">
          <label>Tổng tiền</label>
<p className="total-amount">{order.totalAmount.toLocaleString('vi-VN')} đ</p>
        </div>
    {order.notes && (
          <div className="info-card notes">
 <label>Ghi chú</label>
         <p>{order.notes}</p>
        </div>
   )}
      </div>

      <div className="items-section">
        <div className="items-header">
          <h3>Danh sách món ({order.orderItems?.length || 0})</h3>
{order.status === 'Pending' && selectedItems.size > 0 && (
            <button 
       className="btn btn-danger"
 onClick={handleCancelSelected}
    >
      🗑️ Hủy {selectedItems.size} món đã chọn
    </button>
          )}
        </div>

      <table className="items-table">
          <thead>
            <tr>
              {order.status === 'Pending' && <th style={{ width: '50px' }}>Chọn</th>}
              <th>Món</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
              {order.status === 'Pending' && <th>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {order.orderItems?.map(item => (
      <tr key={item.id} className={selectedItems.has(item.id) ? 'selected' : ''}>
        {order.status === 'Pending' && (
         <td>
       <input
     type="checkbox"
   checked={selectedItems.has(item.id)}
         onChange={() => handleToggleItem(item.id)}
       />
</td>
        )}
   <td>
        <div className="item-name">
        {item.product?.name}
     {item.notes && <span className="item-notes">({item.notes})</span>}
  </div>
 </td>
    <td>{item.unitPrice.toLocaleString('vi-VN')} đ</td>
       
    {/* ✅ NEW: Editable Quantity */}
         {order.status === 'Pending' ? (
         <td className="quantity">
        <div className="quantity-controls-inline">
    <button 
            className="qty-btn-sm"
         onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
   disabled={item.quantity <= 1}
 >
       −
     </button>
      <span className="qty-value">{item.quantity}</span>
         <button 
       className="qty-btn-sm"
  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
       >
       +
           </button>
                  </div>
         </td>
   ) : (
 <td className="quantity">{item.quantity}</td>
 )}

                <td className="item-total">
     {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ
       </td>
         {order.status === 'Pending' && (
   <td>
     <button
    className="btn btn-sm btn-cancel"
         onClick={() => handleCancelItem(item)}
          >
   Hủy
</button>
  </td>
   )}
       </tr>
      ))}
          </tbody>
 <tfoot>
            <tr className="total-row">
        <td colSpan={order.status === 'Pending' ? 4 : 3} className="text-right">
        <strong>Tổng cộng:</strong>
          </td>
   <td className="total-amount">
    <strong>{order.totalAmount.toLocaleString('vi-VN')} đ</strong>
     </td>
       {order.status === 'Pending' && <td></td>}
         </tr>
       </tfoot>
        </table>

 {order.status === 'Pending' && (
          <div className="help-text">
        💡 <strong>Lưu ý:</strong> Chỉ có thể hủy món khi đơn hàng đang ở trạng thái "Đang xử lý"
          </div>
        )}

        {order.status !== 'Pending' && (
       <div className="help-text info">
          ℹ️ Đơn hàng đã {order.status === 'Completed' ? 'hoàn thành' : 'bị hủy'}. Không thể chỉnh sửa.
          </div>
        )}
    </div>

   <div className="actions-footer">
   {order.status === 'Pending' && (
          <>
            <button 
      className="btn btn-warning"
     onClick={() => setShowAddDialog(true)}
   >
     ➕ Thêm món
 </button>
            <button
              className="btn btn-success"
              onClick={() => setShowPaymentDialog(true)}
            >
              💳 Thanh toán
            </button>
          </>
)}
      </div>
    </div>
  );
};

export default OrderDetail;
