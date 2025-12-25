import React, { useEffect, useState } from 'react';
import { useSignalR } from '../../contexts/SignalRContext';
import { orderService } from '../../services/orderService';
import { Order, OrderItem } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import './KitchenView.css';

interface KitchenOrder {
  id: number;
  tableNumber: string;
  isTakeaway: boolean;
  orderDate: string;
  status: string;
  items: OrderItem[];
  elapsedTime?: string; // For display
}

const KitchenView: React.FC = () => {
    const { connection } = useSignalR();
    const { showToast } = useToast();
    const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        fetchPendingOrders();
        
        // Timer for elapsed time
        const timer = setInterval(() => {
            setKitchenOrders(prev => prev.map(o => ({
                ...o,
                elapsedTime: calculateElapsed(o.orderDate)
            })));
        }, 1000 * 60); // Update every minute

        return () => clearInterval(timer);
    }, []);

    // SignalR Listeners
    useEffect(() => {
        if (!connection) return;

        connection.on('OrderCreated', (newOrder: Order) => {
           // Play sound?
           const kOrder = mapToKitchenOrder(newOrder);
           setKitchenOrders(prev => [kOrder, ...prev]);
           showToast(`Đơn mới từ ${kOrder.tableNumber}`, 'info');
        });

        // If an order status changes elsewhere (e.g. Cancelled)
        connection.on('OrderUpdated', (updatedOrder: Order) => {
             if (updatedOrder.status !== 'Pending' && updatedOrder.status !== 'Prepared') {
                 // Remove from kitchen view if completed/cancelled
                 setKitchenOrders(prev => prev.filter(o => o.id !== updatedOrder.id));
             }
        });

        return () => {
            connection.off('OrderCreated');
            connection.off('OrderUpdated');
        }
    }, [connection]);

    const fetchPendingOrders = async () => {
        try {
            const allOrders = await orderService.getAll();
            // Filter only Pending or Processing orders
            const pending = allOrders
                .filter(o => o.status === 'Pending')
                .map(mapToKitchenOrder)
                .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()); // Oldest first
            
            setKitchenOrders(pending);
        } catch (err) {
            console.error("Failed to fetch kitchen orders", err);
        } finally {
            setLoading(false);
        }
    };

    const mapToKitchenOrder = (order: Order): KitchenOrder => {
        return {
            id: order.id,
            tableNumber: order.table ? order.table.tableNumber : 'Mang về',
            isTakeaway: !order.table,
            orderDate: order.orderDate,
            status: order.status,
            items: order.orderItems || [],
            elapsedTime: calculateElapsed(order.orderDate)
        };
    };

    const calculateElapsed = (dateStr: string) => {
        const start = new Date(dateStr).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 60000); // minutes
        return `${diff} phút`;
    };

    const handleCompleteOrder = async (orderId: number) => {
        try {
            await orderService.updateStatus(orderId, 'Prepared'); // Mark as 'Prepared' (Món đã xong)
            
            // Optimistic update
            setKitchenOrders(prev => prev.filter(o => o.id !== orderId));
            showToast('Đã báo nấu xong!', 'success');
        } catch (err) {
            showToast('Lỗi khi cập nhật', 'error');
        }
    };

    if (loading) return <div className="kitchen-loading"><div className="spinner"></div></div>;

    return (
        <div className="kitchen-container">
            <div className="kitchen-header">
                <h1><i className="fas fa-fire"></i> KITCHEN DISPLAY</h1>
                <div className="kitchen-stats">
                    <span className="stat-badge pending">{kitchenOrders.length} Đang chờ</span>
                </div>
            </div>

            <div className="kitchen-grid">
                {kitchenOrders.length === 0 ? (
                    <div className="kitchen-empty">
                        <i className="fas fa-check-circle"></i>
                        <p>Hết đơn chờ! Bếp nghỉ ngơi.</p>
                    </div>
                ) : (
                    kitchenOrders.map(order => (
                        <div key={order.id} className={`kitchen-ticket ${order.isTakeaway ? 'takeaway' : ''}`}>
                            <div className="ticket-header">
                                <div className="table-info">
                                    <span className="table-num">{order.tableNumber}</span>
                                    {order.isTakeaway && <i className="fas fa-shopping-bag"></i>}
                                </div>
                                <div className="time-info">
                                    <span className="order-id">#{order.id}</span>
                                    <span className="elapsed-time">{order.elapsedTime}</span>
                                </div>
                            </div>
                            
                            <div className="ticket-body">
                                <ul className="item-list">
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            <span className="qty">{item.quantity}</span>
                                            <span className="name">
                                                {item.product?.name}
                                                {item.unitPrice === 0 && <span className="free-tag">Khoan tính</span>}
                                            </span>
                                            {item.notes && <div className="item-note">Note: {item.notes}</div>}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="ticket-footer">
                                <button className="btn-done" onClick={() => handleCompleteOrder(order.id)}>
                                    <i className="fas fa-check"></i> Xong
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default KitchenView;
