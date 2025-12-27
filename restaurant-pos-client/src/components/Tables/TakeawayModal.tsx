import React, { useEffect, useState } from 'react';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import './TakeawayModal.css';

interface TakeawayModalProps {
    takeawayTableId: number;
    onClose: () => void;
    onSelectOrder: (order: Order) => void;
    onCreateNew: () => void;
}

const TakeawayModal: React.FC<TakeawayModalProps> = ({ 
    takeawayTableId, 
    onClose, 
    onSelectOrder, 
    onCreateNew 
}) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [_loading, setLoading] = useState(true);

    useEffect(() => {
        loadTakeawayOrders();
    }, [takeawayTableId]);

    const loadTakeawayOrders = async () => {
        try {
            setLoading(true);
            const allOrders = await orderService.getByTable(takeawayTableId);
            // Filter only active orders (not Completed or Cancelled)
            const activeOrders = allOrders.filter(
                o => o.status !== 'Completed' && o.status !== 'Cancelled'
            );
            setOrders(activeOrders);

            // If no orders, auto-close and create new
            if (activeOrders.length === 0) {
                setTimeout(() => {
                    onClose();
                    onCreateNew();
                }, 300);
            }
        } catch (err) {
            console.error('Error loading takeaway orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="takeaway-modal-overlay" onClick={onClose}>
            <div className="takeaway-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="takeaway-modal-header">
                    <div className="modal-title">
                        <i className="fas fa-shopping-bag"></i>
                        <h3>Đơn hàng Mang về đang phục vụ</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="takeaway-modal-body">
                    {/* {loading ? (
                        <Loading message="Đang tải đơn hàng..." size="small" />
                    ) : orders.length > 0 ? ( */}
                    {orders.length > 0 ? (
                        <>
                            <p className="modal-subtitle">
                                Chọn đơn hàng để tiếp tục hoặc tạo đơn mới bên dưới ({orders.length} đơn)
                            </p>
                            <div className="takeaway-orders-list">
                                {orders.map((order) => (
                                    <div 
                                        key={order.id} 
                                        className="takeaway-order-item"
                                        onClick={() => {
                                            onClose();
                                            onSelectOrder(order);
                                        }}
                                    >
                                        <div className="order-item-icon">
                                            <i className="fas fa-receipt"></i>
                                        </div>
                                        <div className="order-item-info">
                                            <span className="order-item-title">
                                                Đơn hàng #{order.id}
                                            </span>
                                            {order.customerName && (
                                                <span className="order-item-customer">
                                                    {order.customerName}
                                                </span>
                                            )}
                                            <span className="order-item-time">
                                                {new Date(order.orderDate).toLocaleTimeString('vi-VN', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                        <div className="order-item-amount">
                                            {formatCurrency(order.totalAmount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>

                <div className="takeaway-modal-footer">
                    <button 
                        className="btn-create-new-takeaway"
                        onClick={() => {
                            onClose();
                            onCreateNew();
                        }}
                    >
                        <i className="fas fa-plus"></i>
                        Tạo đơn mới
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TakeawayModal;
