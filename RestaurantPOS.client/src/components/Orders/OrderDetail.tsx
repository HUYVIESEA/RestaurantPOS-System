import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Order, OrderItem } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import AddItemDialog, { DialogCartItem } from './AddItemDialog';
import CancelItemDialog from './CancelItemDialog';
import VietQRView from '../Payment/VietQRView';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError, showWarning } = useToast();
  const [order, setOrder] = useState<Order | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelingItem, setCancelingItem] = useState<OrderItem | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      const data = await orderService.getById(parseInt(id!));
      setOrder(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải chi tiết đơn hàng.');
      console.error('Error fetching order:', err);
    }
  };

  const handleAddItem = async (items: DialogCartItem[]) => {
    try {
      for (const item of items) {
        await orderService.addItem(parseInt(id!), {
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes || undefined,
          variantId: item.variant?.id,
          modifierItemIds: item.modifiers?.map(m => m.id)
        });
      }
      showSuccess(`Đã thêm ${items.length} món vào đơn hàng`);
      setShowAddDialog(false);
      await fetchOrderDetail();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Lỗi khi thêm món');
      throw err;
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
      showWarning('Vui lòng chọn món cần hủy');
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
      const remainingItems = order?.orderItems?.filter(item => 
        !selectedItems.has(item.id)
      ) || [];

      if (remainingItems.length === 0) {
        await orderService.updateStatus(parseInt(id!), 'Cancelled');
        showSuccess('Đã hủy tất cả món. Đơn hàng chuyển sang trạng thái "Đã hủy".');
        navigate('/orders');
      } else {
        setOrder({
          ...order!,
          orderItems: remainingItems,
          totalAmount: order!.totalAmount - totalCancelled
        });
        setSelectedItems(new Set());
        showSuccess(`Đã hủy ${selectedItems.size} món thành công!`);
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
      showSuccess('Đã hủy món thành công!');
    } catch (err) {
      setError('Không thể hủy món.');
      console.error('Error:', err);
      showError('Không thể hủy món.');
    }
  };

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
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

  const handleCancelItem = (item: OrderItem) => {
    setCancelingItem(item);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async (cancelQuantity: number) => {
    if (!cancelingItem) return;

    try {
      const remainingQuantity = cancelingItem.quantity - cancelQuantity;

      if (remainingQuantity === 0) {
        await orderService.removeItem(parseInt(id!), cancelingItem.id);
      } else {
        await orderService.updateItemQuantity(parseInt(id!), cancelingItem.id, remainingQuantity);
      }

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

  const handlePaymentComplete = async (paymentMethod: string = 'Cash') => {
    try {
      await orderService.completeOrder(order!.id, order!.totalAmount, paymentMethod);
      
      showSuccess(`<i class="fa-solid fa-check-circle mr-1"></i> Thanh toán thành công!\nĐơn hàng #${order!.id} đã được thanh toán.`);
      navigate('/tables');
    } catch (err) {
      console.error('Error completing payment:', err);
      showError('Không thể hoàn thành thanh toán');
    }
  };

  const handleCashPayment = () => {
    if (window.confirm(`Xác nhận thanh toán tiền mặt?\n\nTổng tiền: ${order!.totalAmount.toLocaleString('vi-VN')} đ`)) {
        handlePaymentComplete('Cash');
    }
  };

  if (error) return <div className="p-4 text-red-600 bg-red-50 dark:bg-red-900/30 rounded-xl m-4 font-medium">{error}</div>;
  if (!order) return <div className="p-4 text-slate-600 dark:text-slate-400">Không tìm thấy đơn hàng</div>;

  return (
    <div className="w-full p-4 md:p-6 pb-24 space-y-6">
      {/* Add Item Dialog */}
      {showAddDialog && (
        <AddItemDialog
          onAdd={handleAddItem}
          onCancel={() => setShowAddDialog(false)}
        />
      )}

      {/* Cancel Item Dialog */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setShowPaymentDialog(false); setShowQR(false); }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 text-center">
              {showQR ? (
                  <><i className="fa-solid fa-qrcode mr-2 text-blue-600"></i>Thanh toán VietQR</>
              ) : (
                  <><i className="fa-solid fa-credit-card mr-2 text-blue-600"></i>Chọn hình thức thanh toán</>
              )}
            </h3>
            
            {!showQR ? (
                <div className="space-y-4">
                    <p className="text-center text-lg text-slate-600 dark:text-slate-300 mb-6">
                      Tổng tiền: <strong className="text-xl text-slate-900 dark:text-white block mt-2">{order.totalAmount.toLocaleString('vi-VN')} đ</strong>
                    </p>
                    <div className="space-y-3">
                        <button 
                            className="w-full min-h-[56px] flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm"
                            onClick={handleCashPayment}
                        >
                            <i className="fas fa-money-bill-wave text-xl"></i>
                            <span className="text-lg">Tiền mặt</span>
                        </button>

                        <button 
                            className="w-full min-h-[56px] flex items-center justify-center gap-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold transition-colors shadow-sm"
                            onClick={() => setShowQR(true)}
                        >
                            <i className="fas fa-qrcode text-xl"></i>
                            <span className="text-lg">Chuyển khoản QR</span>
                        </button>
                    </div>
                
                    <button 
                        className="w-full min-h-[48px] mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl font-medium transition-colors"
                        onClick={() => setShowPaymentDialog(false)}
                    >
                        Hủy bỏ
                    </button>
                </div>
            ) : (
                <VietQRView 
                    amount={order.totalAmount}
                    description={`Thanh toan don ${order.id}`}
                    onSuccess={() => handlePaymentComplete('Bank Transfer')}
                    onCancel={() => setShowQR(false)}
                />
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Chi tiết Đơn hàng #{order.id}</h2>
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 font-medium">
            <span className="bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg">
              Bàn: {order.table?.tableNumber || 'N/A'}
            </span>
            <span className={`px-3 py-1 rounded-lg ${
              order.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
              order.status === 'Completed' ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300' :
              'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {order.status}
            </span>
          </div>
        </div>
        <button 
          className="min-h-[44px] px-5 bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2" 
          onClick={() => navigate('/tables')}
        >
          <i className="fa-solid fa-arrow-left"></i> Quay lại
        </button>
      </div>

      {/* Order Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <label className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 block">Khách hàng</label>
          <p className="text-lg font-semibold text-slate-800 dark:text-white">{order.customerName || 'Khách vãng lai'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <label className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 block">Ngày đặt</label>
          <p className="text-lg font-semibold text-slate-800 dark:text-white">{new Date(order.orderDate).toLocaleString('vi-VN')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 lg:col-span-1 sm:col-span-2">
          <label className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 block">Tổng tiền</label>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-500">{order.totalAmount.toLocaleString('vi-VN')} đ</p>
        </div>
        {order.notes && (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-800/30 sm:col-span-2 lg:col-span-3">
            <label className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1 block">Ghi chú</label>
            <p className="text-amber-900 dark:text-amber-200">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Items Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Danh sách món ({order.orderItems?.length || 0})
          </h3>
          {order.status === 'Pending' && selectedItems.size > 0 && (
            <button 
              className="min-h-[44px] px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
              onClick={handleCancelSelected}
            >
              <i className="fa-solid fa-trash-can"></i> Hủy {selectedItems.size} món đã chọn
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                {order.status === 'Pending' && <th className="p-4 font-medium w-16 text-center">Chọn</th>}
                <th className="p-4 font-medium">Món</th>
                <th className="p-4 font-medium hidden sm:table-cell">Đơn giá</th>
                <th className="p-4 font-medium text-center">Số lượng</th>
                <th className="p-4 font-medium text-right">Thành tiền</th>
                {order.status === 'Pending' && <th className="p-4 font-medium text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {order.orderItems?.map(item => (
                <tr 
                  key={item.id} 
                  className={`transition-colors ${selectedItems.has(item.id) ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/20'}`}
                >
                  {order.status === 'Pending' && (
                    <td className="p-4 text-center align-middle">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-slate-300 text-blue-700 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700 cursor-pointer"
                          checked={selectedItems.has(item.id)}
                          onChange={() => handleToggleItem(item.id)}
                        />
                      </div>
                    </td>
                  )}
                  <td className="p-4 align-middle">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{item.product?.name}</div>
                    {(item.variantId || (item.modifierItemIds && item.modifierItemIds.length > 0)) && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-col gap-0.5">
                        {item.variantId && item.product?.variants && (
                          <span>Size: {item.product.variants.find(v => v.id === item.variantId)?.name || 'N/A'}</span>
                        )}
                        {item.modifierItemIds && item.modifierItemIds.length > 0 && item.product?.modifiers && (
                          <span>+ {
                            item.product.modifiers
                              .flatMap(mg => mg.items)
                              .filter(m => item.modifierItemIds!.includes(m.id))
                              .map(m => m.name)
                              .join(', ')
                          }</span>
                        )}
                      </div>
                    )}
                    {item.notes && <div className="text-xs text-amber-600 dark:text-amber-500 mt-1 italic">"{item.notes}"</div>}
                    <div className="sm:hidden text-sm text-slate-500 dark:text-slate-400 mt-1">{item.unitPrice.toLocaleString('vi-VN')} đ</div>
                  </td>
                  <td className="p-4 hidden sm:table-cell align-middle text-slate-600 dark:text-slate-300">
                    {item.unitPrice.toLocaleString('vi-VN')} đ
                  </td>
                  
                  {/* Editable Quantity */}
                  {order.status === 'Pending' ? (
                    <td className="p-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium text-slate-800 dark:text-slate-200">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                  ) : (
                    <td className="p-4 align-middle text-center font-medium text-slate-800 dark:text-slate-200">
                      {item.quantity}
                    </td>
                  )}

                  <td className="p-4 align-middle text-right font-semibold text-slate-800 dark:text-slate-200">
                    {(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ
                  </td>
                  
                  {order.status === 'Pending' && (
                    <td className="p-4 align-middle text-center">
                      <button
                        className="min-h-[36px] px-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                        onClick={() => handleCancelItem(item)}
                      >
                        Hủy
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <tr>
                <td colSpan={order.status === 'Pending' ? (window.innerWidth < 640 ? 3 : 4) : (window.innerWidth < 640 ? 2 : 3)} className="p-5 text-right font-semibold text-slate-700 dark:text-slate-300 text-lg">
                  Tổng cộng:
                </td>
                <td className="p-5 text-right font-bold text-blue-700 dark:text-blue-500 text-xl">
                  {order.totalAmount.toLocaleString('vi-VN')} đ
                </td>
                {order.status === 'Pending' && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Help Texts */}
      <div className="space-y-3">
        {order.status === 'Pending' && (
          <div className="p-4 rounded-xl bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 text-sm flex items-start gap-2">
            <i className="fa-solid fa-lightbulb mt-0.5"></i>
            <div>
               <strong>Lưu ý:</strong> Chỉ có thể hủy món khi đơn hàng đang ở trạng thái "Đang xử lý"
            </div>
          </div>
        )}

        {order.status !== 'Pending' && order.status !== 'Prepared' && (
          <div className="p-4 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-sm flex items-center gap-2">
            <i className="fa-solid fa-circle-info"></i> Đơn hàng đã {order.status === 'Completed' ? 'thanh toán' : 'bị hủy'}. Không thể chỉnh sửa.
          </div>
        )}

        {order.status === 'Prepared' && (
          <div className="p-4 rounded-xl bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 font-medium flex items-center gap-2">
            <i className="fa-solid fa-circle-check text-green-500"></i> Món ăn đã nấu xong. Sẵn sàng thanh toán!
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex gap-3 justify-center z-40 sm:static sm:bg-transparent sm:border-none sm:p-0 sm:mt-8 sm:backdrop-blur-none">
        {order.status === 'Pending' && (
          <>
            <button 
              className="flex-1 sm:flex-none min-h-[50px] px-6 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors shadow-sm shadow-amber-500/20 flex items-center justify-center gap-2"
              onClick={() => setShowAddDialog(true)}
            >
              <i className="fa-solid fa-plus"></i> Thêm món
            </button>
            <button
              className="flex-1 sm:flex-none min-h-[50px] px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2"
              onClick={() => setShowPaymentDialog(true)}
            >
              <i className="fa-solid fa-credit-card"></i> Thanh toán
            </button>
          </>
        )}
        
        {order.status === 'Prepared' && (
          <button
            className="w-full sm:max-w-md min-h-[56px] text-lg px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 mx-auto"
            onClick={() => setShowPaymentDialog(true)}
          >
            <i className="fa-solid fa-credit-card"></i> Thanh toán ngay
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetail;
