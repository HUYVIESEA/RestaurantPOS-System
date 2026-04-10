import React from 'react';

interface ReturnTableDialogProps {
  tableName: string;
  orderCount: number;
  totalAmount: number;
  onConfirm: (shouldComplete: boolean) => void;
  onCancel: () => void;
}

const ReturnTableDialog: React.FC<ReturnTableDialogProps> = ({
  tableName,
  orderCount,
  totalAmount,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 border-b border-blue-100 dark:border-blue-800">
          <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 m-0">💰 Trả bàn {tableName}</h3>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300">
            <p className="text-2xl m-0">⚠️</p>
            <p className="m-0">Bàn này có <strong className="font-bold">{orderCount} đơn hàng</strong> chưa hoàn thành</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
              <span>Số đơn hàng:</span>
              <strong className="font-bold">{orderCount}</strong>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600 mt-3 text-lg font-bold text-gray-700 dark:text-gray-300">
              <span>Tổng tiền:</span>
              <strong className="text-blue-600 dark:text-blue-400">{totalAmount.toLocaleString('vi-VN')} đ</strong>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p className="m-0">💡 <strong>Lưu ý:</strong></p>
            <ul className="list-none p-0 space-y-1.5 m-0">
              <li>✅ <strong>Hoàn thành đơn:</strong> Tính vào doanh thu, đơn chuyển sang "Hoàn thành"</li>
              <li>❌ <strong>Chỉ trả bàn:</strong> Không tính doanh thu, đơn vẫn "Đang xử lý"</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 bg-gray-50/50 dark:bg-gray-800/50">
          <button 
            className="py-3 px-4 rounded-xl font-semibold transition-colors flex-1 text-center touch-manipulation bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button 
            className="py-3 px-4 rounded-xl font-semibold transition-colors flex-1 text-center touch-manipulation bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
            onClick={() => onConfirm(false)}
          >
            Chỉ trả bàn
          </button>
          <button 
            className="py-3 px-4 rounded-xl font-semibold transition-colors flex-1 text-center touch-manipulation bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
            onClick={() => onConfirm(true)}
          >
            ✅ Hoàn thành & Trả bàn
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnTableDialog;
