import React, { useEffect, useState } from 'react';
import { useSignalR } from '../../contexts/SignalRContext';
import { orderService } from '../../services/orderService';
import { Order, OrderItem } from '../../types';
import { useToast } from '../../contexts/ToastContext';

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

        const handleOrderCreated = async (orderId: number) => {
            // We only receive the ID from the strongly-typed hub, so fetch the details
            try {
                const newOrder = await orderService.getById(orderId);
                const kOrder = mapToKitchenOrder(newOrder);
                setKitchenOrders(prev => {
                    if (prev.some(o => o.id === orderId)) return prev;
                    return [...prev, kOrder].sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
                });
                showToast(`Đơn mới từ ${kOrder.tableNumber}`, 'info');
            } catch (err) {
                console.error("Failed to fetch new order details", err);
            }
        };

        const handleOrderUpdated = async (orderId: number) => {
            try {
                const updatedOrder = await orderService.getById(orderId);
                if (updatedOrder.status !== 'Pending' && updatedOrder.status !== 'Processing') {
                    // Remove if no longer relevant to kitchen
                    setKitchenOrders(prev => prev.filter(o => o.id !== orderId));
                } else {
                    const kOrder = mapToKitchenOrder(updatedOrder);
                    setKitchenOrders(prev => {
                        const exists = prev.some(o => o.id === orderId);
                        if (exists) {
                            return prev.map(o => o.id === orderId ? kOrder : o);
                        } else {
                            return [...prev, kOrder].sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to fetch updated order details", err);
            }
        };

        connection.on('ordercreated', handleOrderCreated);
        connection.on('orderupdated', handleOrderUpdated);
        connection.on('ordercompleted', (orderId: number) => {
            setKitchenOrders(prev => prev.filter(o => o.id !== orderId));
        });

        return () => {
            connection.off('ordercreated', handleOrderCreated);
            connection.off('orderupdated', handleOrderUpdated);
            connection.off('ordercompleted');
        }
    }, [connection, showToast]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6 font-sans text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-4 text-orange-600 dark:text-orange-500 tracking-tight">
                    <i className="fas fa-fire text-3xl"></i> KITCHEN DISPLAY
                </h1>
                <div className="flex items-center">
                    <span className="px-5 py-2.5 bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 font-bold rounded-full shadow-sm text-lg border border-orange-200 dark:border-orange-800">
                        {kitchenOrders.length} Đang chờ
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {kitchenOrders.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-400 dark:text-slate-500">
                        <i className="fas fa-circle-check text-7xl mb-6 text-slate-300 dark:text-slate-600"></i>
                        <p className="text-2xl font-medium">Hết đơn chờ! Bếp nghỉ ngơi.</p>
                    </div>
                ) : (
                    kitchenOrders.map(order => (
                        <div 
                            key={order.id} 
                            className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transform transition-transform hover:-translate-y-1 ${
                                order.isTakeaway ? 'border-t-4 border-t-blue-500' : 'border-t-4 border-t-orange-500'
                            }`}
                        >
                            <div className="bg-slate-50 dark:bg-slate-700/60 px-5 py-4 flex justify-between items-start border-b border-slate-100 dark:border-slate-700">
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {order.tableNumber}
                                        {order.isTakeaway && <i className="fas fa-shopping-bag text-blue-500 text-base"></i>}
                                    </span>
                                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                        Đơn #{order.id}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-lg font-bold px-3 py-1 rounded-lg ${
                                        parseInt(order.elapsedTime || '0') > 15 
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' 
                                            : 'bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-300'
                                    }`}>
                                        <i className="far fa-clock mr-1.5"></i>
                                        {order.elapsedTime}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-6 flex-grow">
                                <ul className="space-y-4">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-4">
                                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold px-3 py-1.5 rounded-lg text-lg min-w-[3rem] text-center border border-slate-200 dark:border-slate-600 shadow-sm">
                                                {item.quantity}
                                            </span>
                                            <div className="flex-grow pt-1">
                                                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                                                    {item.product?.name}
                                                    {item.unitPrice === 0 && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400">
                                                            Khoan tính
                                                        </span>
                                                    )}
                                                </div>
                                                {item.notes && (
                                                    <div className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-100 dark:border-red-800/30 flex items-start gap-2">
                                                        <i className="fas fa-exclamation-circle mt-0.5"></i>
                                                        <span>{item.notes}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-700/40 border-t border-slate-100 dark:border-slate-700 mt-auto">
                                <button 
                                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-xl shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-green-500/50 active:scale-[0.98]"
                                    onClick={() => handleCompleteOrder(order.id)}
                                >
                                    <i className="fas fa-circle-check text-2xl"></i> BÁO XONG
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
