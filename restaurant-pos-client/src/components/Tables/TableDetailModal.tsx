import React, { useEffect, useState } from 'react';
import { Order, Table } from '../../types';
import { orderService } from '../../services/orderService';

interface TableDetailModalProps {
    table: Table;
    onClose: () => void;
    onSelectOrder: (order: Order) => void;
    onCreateOrder: () => void;
    onPayment?: (order: Order) => void;
}

const TableDetailModal: React.FC<TableDetailModalProps> = ({ 
    table, 
    onClose, 
    onSelectOrder, 
    onCreateOrder,
    onPayment 
}) => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        loadOrders();
    }, [table.id]);

    const loadOrders = async () => {
        try {
            const allOrders = await orderService.getByTable(table.id);
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

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'Pending': 
                return { label: 'Chờ chế biến', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50' };
            case 'Prepared': 
                return { label: 'Đã nấu xong', class: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50' };
            default: 
                return { label: status, class: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700' };
        }
    };

    const canPay = (status: string) => status === 'Pending' || status === 'Prepared';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-scale-in" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500">
                            <i className="fas fa-chair text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                Bàn {table.tableNumber}
                            </h3>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {table.floor ? `Khu vực: ${table.floor}` : 'Chưa phân khu'}
                            </span>
                        </div>
                    </div>
                    <button 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors focus:outline-none"
                        onClick={onClose}
                    >
                        <i className="fas fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                    {orders.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                    Đơn hàng đang phục vụ ({orders.length})
                                </h4>
                            </div>
                            
                            <div className="space-y-3">
                                {orders.map((order) => {
                                    const statusInfo = getStatusInfo(order.status);
                                    return (
                                        <div key={order.id} className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600/50 transition-colors shadow-sm hover:shadow">
                                            <div 
                                                className="flex-1 cursor-pointer"
                                                onClick={() => {
                                                    onClose();
                                                    onSelectOrder(order);
                                                }}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-gray-900 dark:text-white text-lg">#{order.id}</span>
                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${statusInfo.class}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                    <span className="flex items-center gap-1.5">
                                                        <i className="far fa-clock"></i>
                                                        {new Date(order.orderDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {order.customerName && (
                                                        <>
                                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                                            <span className="flex items-center gap-1.5 truncate max-w-[120px]">
                                                                <i className="far fa-user"></i> 
                                                                {order.customerName}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                <div className="text-lg font-bold text-blue-700 dark:text-blue-500">
                                                    {formatCurrency(order.totalAmount)}
                                                </div>
                                            </div>

                                            {canPay(order.status) && onPayment && (
                                                <button 
                                                    className="w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-400 font-semibold rounded-lg border border-green-200 dark:border-green-800/50 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onPayment(order);
                                                    }}
                                                >
                                                    <i className="fas fa-wallet"></i>
                                                    Thanh toán
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                                <i className="fas fa-utensils text-3xl text-gray-400 dark:text-gray-500"></i>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Bàn trống</h4>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Bàn này chưa có đơn hàng nào.</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Bấm "Gọi món" để tạo đơn mới.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <button 
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        onClick={() => {
                            onClose();
                            onCreateOrder();
                        }}
                    >
                        <i className="fas fa-circle-plus text-lg"></i>
                        Tạo đơn gọi món mới
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TableDetailModal;
