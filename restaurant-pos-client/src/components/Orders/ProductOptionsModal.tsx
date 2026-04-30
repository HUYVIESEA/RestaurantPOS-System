import React, { useState, useEffect } from 'react';
import { Product, ProductVariant, ModifierItem } from '../../types';

interface ProductOptionsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (variant?: ProductVariant, selectedModifiers?: ModifierItem[], quantity?: number, notes?: string) => void;
}

const ProductOptionsModal: React.FC<ProductOptionsModalProps> = ({ product, isOpen, onClose, onConfirm }) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedModifiers, setSelectedModifiers] = useState<ModifierItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Auto-select first variant if exists
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(undefined);
      }
      setSelectedModifiers([]);
      setQuantity(1);
      setNotes('');
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const handleModifierToggle = (item: ModifierItem) => {
    const isSelected = selectedModifiers.some(m => m.id === item.id);
    if (isSelected) {
      setSelectedModifiers(selectedModifiers.filter(m => m.id !== item.id));
    } else {
      setSelectedModifiers([...selectedModifiers, item]);
    }
  };

  const calculateTotalPrice = () => {
    let total = product.price;
    if (selectedVariant) {
      total += selectedVariant.priceDelta || 0;
    }
    selectedModifiers.forEach(m => {
      total += m.priceDelta || 0;
    });
    return total * quantity;
  };

  const hasVariants = product.variants && product.variants.length > 0;
  const hasModifiers = product.modifiers && product.modifiers.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 w-full sm:w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up sm:animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/80">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1">{product.name}</h3>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
          
          {hasVariants && (
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                Kích thước / Size <span className="text-red-500">*</span>
              </h4>
              <div className="flex flex-col gap-2">
                {product.variants!.map(variant => (
                  <label key={variant.id} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedVariant?.id === variant.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="variant" 
                        checked={selectedVariant?.id === variant.id}
                        onChange={() => setSelectedVariant(variant)}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{variant.name}</span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">
                      {variant.priceDelta && variant.priceDelta > 0 ? `+${variant.priceDelta.toLocaleString('vi-VN')} đ` : (variant.priceDelta && variant.priceDelta < 0 ? `${variant.priceDelta.toLocaleString('vi-VN')} đ` : '0 đ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {hasModifiers && product.modifiers!.map(modGroup => (
            <div key={modGroup.id}>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                {modGroup.name}
              </h4>
              <div className="flex flex-col gap-2">
                {modGroup.items.map(item => {
                  const isSelected = selectedModifiers.some(m => m.id === item.id);
                  return (
                    <label key={item.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-slate-500'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleModifierToggle(item)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                      </div>
                      {item.priceDelta && item.priceDelta > 0 ? (
                         <span className="text-slate-600 dark:text-slate-400 font-semibold">+{item.priceDelta.toLocaleString('vi-VN')} đ</span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
             <span className="font-bold text-slate-700 dark:text-slate-300">Số lượng</span>
             <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button 
                  className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-bold text-lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <i className="fa-solid fa-minus"></i>
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 h-10 bg-transparent text-center font-bold text-slate-800 dark:text-white focus:outline-none appearance-none"
                />
                <button 
                  className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-bold text-lg"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
             </div>
          </div>

          <div>
            <textarea
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/50 resize-none dark:text-white text-sm"
              placeholder="Ghi chú thêm (Vd: ít đá, không cay...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-transform active:scale-[0.98] flex items-center justify-between px-6"
            onClick={() => onConfirm(selectedVariant, selectedModifiers, quantity, notes)}
          >
            <span>Thêm vào đơn</span>
            <span className="text-lg">{calculateTotalPrice().toLocaleString('vi-VN')} đ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal;
