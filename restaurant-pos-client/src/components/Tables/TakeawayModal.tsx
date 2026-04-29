import React, { useEffect, useState } from "react";
import { Order } from "../../types";
import { orderService } from "../../services/orderService";

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
  onCreateNew,
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
        (o) => o.status !== "Completed" && o.status !== "Cancelled",
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
      console.error("Error loading takeaway orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 z-10">
          <div className="flex items-center gap-3">
            <i className="fas fa-shopping-bag text-blue-700 dark:text-blue-500 text-2xl"></i>
            <h3 className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold m-0">
              Đơn hàng Mang về đang phục vụ
            </h3>
          </div>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick={onClose}
          >
            <i className="fas fa-xmark text-lg"></i>
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* {loading ? (
                        <Loading message="Đang tải đơn hàng..." size="small" />
                    ) : orders.length > 0 ? ( */}
          {orders.length > 0 ? (
            <>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Chọn đơn hàng để tiếp tục hoặc tạo đơn mới bên dưới (
                {orders.length} đơn)
              </p>
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl cursor-pointer transition-all border-2 border-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-600 dark:hover:border-blue-500 hover:translate-x-1"
                    onClick={() => {
                      onClose();
                      onSelectOrder(order);
                    }}
                  >
                    <div className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm">
                      <i className="fas fa-receipt"></i>
                    </div>
                    <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                      <span className="font-bold text-gray-900 dark:text-white text-[0.95rem] truncate">
                        Đơn hàng #{order.id}
                      </span>
                      {order.customerName && (
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {order.customerName}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(order.orderDate).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="font-bold text-blue-700 dark:text-blue-500 text-base whitespace-nowrap ml-2">
                      {formatCurrency(order.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="p-5 sm:p-6 border-t border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-10">
          <button
            className="w-full p-4 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-700/30 active:translate-y-0 active:shadow-none"
            onClick={() => {
              onClose();
              onCreateNew();
            }}
          >
            <i className="fas fa-plus-circle"></i>
            Tạo đơn mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default TakeawayModal;
