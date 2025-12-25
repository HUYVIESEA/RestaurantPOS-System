import React, { useEffect, useState } from 'react';
import { Order, Table } from '../../types';
import { orderService } from '../../services/orderService';
import './TableDetailModal.css';

interface TableDetailModalProps {
    table: Table;
    onClose: () => void;
    onSelectOrder: (order: Order) => void;
    onCreateOrder: () => void;
}

const TableDetailModal: React.FC<TableDetailModalProps> = ({ 
    table, 
    onClose, 
    onSelectOrder, 
    onCreateOrder 
}) => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        loadOrders();
    }, [table.id]);

    const loadOrders = async () => {
        try {
            const allOrders = await orderService.getByTable(table.id);
            // Filter active orders
            const activeOrders = allOrders.filter(
                o => o.status !== 'Completed' && o.status !== 'Cancelled'
            );
            setOrders(activeOrders);
        } catch (err) {
            console.error('Error loading table orders:', err);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="table-detail-modal-overlay" onClick={onClose}>
            <div className="table-detail-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="table-detail-modal-header">
                    <div className="modal-title">
                        <div className="modal-title-icon">
                            <i className="fas fa-chair"></i>
                        </div>
                        <div className="modal-title-text">
                            <h3>Bàn {table.tableNumber}</h3>
                            <span>{table.floor ? `Khu vực: ${table.floor}` : 'Chưa phân khu'}</span>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="table-detail-modal-body">
                    {orders.length > 0 ? (
                        <>
                            <div className="section-title">
                                Đơn hàng đang phục vụ ({orders.length})
                            </div>
                            <div className="orders-list">
                                {orders.map((order) => (
                                    <div 
                                        key={order.id} 
                                        className="order-item"
                                        onClick={() => {
                                            onClose();
                                            onSelectOrder(order);
                                        }}
                                    >
                                        <div className="order-info">
                                            <span className="order-id">#{order.id}</span>
                                            <div className="order-meta">
                                                <i className="far fa-clock"></i>
                                                {new Date(order.orderDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                {order.customerName && (
                                                    <>
                                                        <span>•</span>
                                                        <i className="far fa-user"></i> {order.customerName}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <span className="order-amount">
                                            {formatCurrency(order.totalAmount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <i className="fas fa-utensils"></i>
                            <p>Bàn này chưa có đơn hàng nào.</p>
                            <small>Bấm "Gọi món" để tạo đơn mới.</small>
                        </div>
                    )}
                </div>

                <div className="table-detail-modal-footer">
                    <button 
                        className="btn-action btn-primary"
                        onClick={() => {
                            onClose();
                            onCreateOrder();
                        }}
                    >
                        <i className="fas fa-plus-circle"></i>
                        Gọi món mới
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableDetailModal;
