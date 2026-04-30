import React, { useState } from 'react';
import { OrderItem } from '../../types';

interface CancelItemDialogProps {
  item: OrderItem;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

const CancelItemDialog: React.FC<CancelItemDialogProps> = ({ item, onConfirm, onCancel }) => {
  const [cancelQuantity, setCancelQuantity] = useState(1);
  const maxQuantity = item.quantity;

  const handleConfirm = () => {
    if (cancelQuantity < 1 || cancelQuantity > maxQuantity) {
      alert(`Số lượng hủy phải từ 1 đến ${maxQuantity}`);
      return;
    }
    onConfirm(cancelQuantity);
  };

  const itemTotal = item.unitPrice * item.quantity;
  const cancelTotal = item.unitPrice * cancelQuantity;
  const remainingQuantity = maxQuantity - cancelQuantity;
  const remainingTotal = item.unitPrice * remainingQuantity;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2"><i className="fa-solid fa-trash-can text-red-500"></i> Hủy món</h3>
          <button className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700" onClick={onCancel}><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className="p-4 space-y-6">
          {/* Item Info */}
          <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-700">
            <h4 className="text-white font-medium text-lg mb-1">{item.product?.name}</h4>
            {item.notes && <p className="text-gray-400 text-sm italic">Ghi chú: {item.notes}</p>}
          </div>

          {/* Current Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
              <label className="text-gray-400 text-xs block mb-1">Số lượng hiện tại</label>
              <span className="text-white font-medium">{maxQuantity}</span>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 border border-gray-700">
              <label className="text-gray-400 text-xs block mb-1">Đơn giá</label>
              <span className="text-white font-medium">{item.unitPrice.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="col-span-2 bg-gray-800 rounded-xl p-3 border border-gray-700 flex justify-between items-center">
              <label className="text-gray-400 text-sm">Tổng tiền hiện tại:</label>
              <span className="text-amber-400 font-bold">{itemTotal.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <div className="h-px bg-gray-700"></div>

          {/* Cancel Quantity Input */}
          <div>
            <label className="text-gray-300 block mb-2 font-medium">Số lượng cần hủy:</label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-1 bg-gray-800 rounded-xl p-1 border border-gray-700">
                <button 
                  className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-700 text-white rounded-lg transition-colors font-bold text-xl"
                  onClick={() => setCancelQuantity(Math.max(1, cancelQuantity - 1))}
                  disabled={cancelQuantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={cancelQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setCancelQuantity(Math.min(maxQuantity, Math.max(1, val)));
                  }}
                  className="flex-1 bg-transparent text-white text-center font-bold text-xl focus:outline-none appearance-none"
                />
                <button 
                  className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-gray-700 text-white rounded-lg transition-colors font-bold text-xl"
                  onClick={() => setCancelQuantity(Math.min(maxQuantity, cancelQuantity + 1))}
                  disabled={cancelQuantity >= maxQuantity}
                >
                  +
                </button>
              </div>
              <button
                className="px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors border border-gray-600"
                onClick={() => setCancelQuantity(maxQuantity)}
              >
                Tất cả
              </button>
            </div>
          </div>

          {/* Quick Buttons */}
          {maxQuantity > 4 && (
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              <span className="text-gray-400 text-sm whitespace-nowrap">Nhanh:</span>
              {[1, 5, 10].filter(q => q <= maxQuantity).map(q => (
                <button 
                  key={q}
                  className={`min-w-[40px] h-8 rounded-lg text-sm font-medium transition-colors ${cancelQuantity === q ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                  onClick={() => setCancelQuantity(q)}
                >
                  {q}
                </button>
              ))}
              {maxQuantity > 1 && (
                <button 
                  className={`px-3 h-8 rounded-lg text-sm font-medium transition-colors ${cancelQuantity === maxQuantity ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'}`}
                  onClick={() => setCancelQuantity(maxQuantity)}
                >
                  Tối đa ({maxQuantity})
                </button>
              )}
            </div>
          )}

          <div className="h-px bg-gray-700"></div>

          {/* Result Summary */}
          <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700 space-y-3">
            <div className="flex justify-between items-center text-red-400 font-medium">
              <span>Số lượng hủy:</span>
              <span>{cancelQuantity}</span>
            </div>
            <div className="flex justify-between items-center text-red-400 font-bold">
              <span>Tiền hủy:</span>
              <span>-{cancelTotal.toLocaleString('vi-VN')} đ</span>
            </div>
            
            {remainingQuantity > 0 && (
              <>
                <div className="h-px bg-gray-700 my-2"></div>
                <div className="flex justify-between items-center text-gray-400 text-sm">
                  <span>Số lượng còn lại:</span>
                  <span>{remainingQuantity}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300 font-medium">
                  <span>Tiền còn lại:</span>
                  <span>{remainingTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              </>
            )}

            {cancelQuantity === maxQuantity && (
              <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center flex items-center justify-center gap-2">
                <span><i className="fa-solid fa-triangle-exclamation text-amber-500"></i></span> Món này sẽ bị xóa hoàn toàn
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-700 flex gap-3 bg-gray-800/50">
          <button 
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            onClick={onCancel}
          >
            Hủy bỏ
          </button>
          <button 
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20"
            onClick={handleConfirm}
          >
            <i className="fa-solid fa-check mr-2"></i> Xác nhận hủy ({cancelQuantity})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelItemDialog;