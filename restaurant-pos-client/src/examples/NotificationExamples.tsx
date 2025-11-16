/**
 * NOTIFICATION SYSTEM - USAGE EXAMPLES
 * 
 * How to use notifications in your components
 */

import { useNotifications } from '../contexts/NotificationContext';

// Example 1: Order Created Notification
export const OrderCreatedExample = () => {
  const { addNotification } = useNotifications();

  const handleOrderCreate = async () => {
    // ... create order logic ...
    
    // Add notification
    addNotification(
      'order',
      'Đơn hàng mới',
      'Đơn hàng #123 đã được tạo thành công',
      '/orders/123'
    );
  };
};

// Example 2: Table Status Change
export const TableStatusExample = () => {
  const { addNotification } = useNotifications();

const handleTableOccupied = () => {
    addNotification(
      'table',
      'Bàn được đặt',
      'Bàn 5 vừa được khách đặt',
      '/tables'
    );
  };
};

// Example 3: Success Notification
export const SuccessExample = () => {
  const { addNotification } = useNotifications();

  const handleSuccess = () => {
    addNotification(
 'success',
      'Thành công',
      'Dữ liệu đã được lưu thành công'
    );
  };
};

// Example 4: Warning Notification
export const WarningExample = () => {
  const { addNotification } = useNotifications();

  const handleLowStock = () => {
 addNotification(
      'warning',
      'Cảnh báo tồn kho',
      'Sản phẩm XYZ sắp hết hàng',
      '/products'
 );
  };
};

// Example 5: Error Notification
export const ErrorExample = () => {
  const { addNotification } = useNotifications();

  const handleError = () => {
 addNotification(
      'error',
      'Lỗi',
      'Không thể kết nối đến server'
    );
  };
};

/**
 * INTEGRATION EXAMPLES
 */

// In OrderForm.tsx
const handleSubmit = async () => {
  try {
  await orderService.create(orderData);
    addNotification('success', 'Đơn hàng mới', `Đơn hàng #${orderId} đã được tạo`, `/orders/${orderId}`);
  } catch (error) {
    addNotification('error', 'Lỗi', 'Không thể tạo đơn hàng');
  }
};

// In TableList.tsx
const handleReturnTable = async (tableId: number) => {
  await tableService.returnTable(tableId);
  addNotification('info', 'Trả bàn', `Bàn ${tableId} đã được trả`, '/tables');
};

// In ProductList.tsx
const checkLowStock = (products: Product[]) => {
  products.forEach(product => {
    if (product.stock < 10) {
      addNotification('warning', 'Tồn kho thấp', `${product.name} còn ${product.stock} sản phẩm`, `/products/${product.id}`);
 }
  });
};

/**
 * ADVANCED USAGE
 */

// Mark notification as read when user clicks
const { markAsRead } = useNotifications();
markAsRead(notificationId);

// Mark all as read
const { markAllAsRead } = useNotifications();
markAllAsRead();

// Remove specific notification
const { removeNotification } = useNotifications();
removeNotification(notificationId);

// Clear all notifications
const { clearAll } = useNotifications();
clearAll();

// Get unread count
const { unreadCount } = useNotifications();
console.log(`You have ${unreadCount} unread notifications`);
