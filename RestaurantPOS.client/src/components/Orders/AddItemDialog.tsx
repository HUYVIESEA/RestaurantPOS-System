import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category, ProductVariant, ModifierItem } from '../../types';
import ProductOptionsModal from './ProductOptionsModal';

export interface DialogCartItem {
  cartId: string;
  product: Product;
  quantity: number;
  notes: string;
  variant?: ProductVariant;
  modifiers?: ModifierItem[];
  unitPrice: number;
}

interface AddItemDialogProps {
  onAdd: (items: DialogCartItem[]) => Promise<void> | void;
  onCancel: () => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ onAdd, onCancel }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<DialogCartItem[]>([]);
  const [_loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [configuringProduct, setConfiguringProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(productsData.filter(p => p.isAvailable));
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    try {
      const data = categoryId
        ? await productService.getByCategory(categoryId)
        : await productService.getAll();
      setProducts(data.filter(p => p.isAvailable));
    } catch (err) {
      console.error('Error filtering products:', err);
    }
  };

  const addToCart = (product: Product, variant?: ProductVariant, modifiers: ModifierItem[] = [], qty: number = 1, customNotes: string = '') => {
    const modIds = modifiers.map(m => m.id).sort().join(',');
    const cartId = `${product.id}-${variant?.id || 0}-${modIds}-${customNotes}`;
    const unitPrice = product.price + (variant?.priceDelta || 0) + modifiers.reduce((sum, m) => sum + (m.priceDelta || 0), 0);

    const existing = cart.find(item => item.cartId === cartId);
    if (existing) {
      setCart(cart.map(item =>
        item.cartId === cartId
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setCart([...cart, { cartId, product, quantity: qty, notes: customNotes, variant, modifiers, unitPrice }]);
    }
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.cartId !== cartId));
    } else {
      setCart(cart.map(item =>
        item.cartId === cartId ? { ...item, quantity } : item
      ));
    }
  };

  const updateNotes = (cartId: string, notes: string) => {
    setCart(cart.map(item =>
      item.cartId === cartId ? { ...item, notes } : item
    ));
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const handleProductClick = (product: Product) => {
    if ((product.variants && product.variants.length > 0) || (product.modifiers && product.modifiers.length > 0)) {
      setConfiguringProduct(product);
    } else {
      addToCart(product, undefined, [], 1, '');
    }
  };

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert('Vui lòng chọn ít nhất 1 món');
      return;
    }
    
    try {
      setAdding(true);
      await onAdd(cart);
      setCart([]);
    } catch (e) {
      // Bỏ qua vì đã hiển thị lỗi ở component cha
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><i className="fa-solid fa-plus text-blue-600 dark:text-blue-500"></i> Thêm món</h3>
          <button className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" onClick={onCancel}>
             <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* Category Filter */}
          <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar">
            <button
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
              onClick={() => handleCategoryFilter(null)}
            >
              Tất cả
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === category.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(product => {
              const inCartCount = cart.filter(c => c.product.id === product.id).reduce((sum, c) => sum + c.quantity, 0);
              return (
                <div
                  key={product.id}
                  className={`relative bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 cursor-pointer transition-all border-2 ${inCartCount > 0 ? 'border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-700 shadow-md scale-[1.02]' : 'border-slate-100 dark:border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  onClick={() => handleProductClick(product)}
                >
                  <div className="text-slate-800 dark:text-slate-100 font-medium mb-1 truncate">{product.name}</div>
                  <div className="text-blue-700 dark:text-blue-500 text-sm font-bold">{product.price.toLocaleString('vi-VN')} đ</div>
                  {inCartCount > 0 && (
                    <div className="absolute top-2 right-2 min-w-[24px] h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md px-1">{inCartCount}</div>
                  )}
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">Không có món nào</div>
          )}

          {/* Cart Details */}
          {cart.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mt-4">
              <h4 className="text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider mb-4 font-semibold flex justify-between">
                <span>Món đã chọn</span>
                <span className="text-blue-600 dark:text-blue-500">{cart.length} món</span>
              </h4>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.cartId} className="flex flex-col gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-slate-800 dark:text-white font-medium">{item.product.name}</div>
                        {(item.variant || (item.modifiers && item.modifiers.length > 0)) && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-col gap-0.5">
                            {item.variant && <span>Size: {item.variant.name}</span>}
                            {item.modifiers && item.modifiers.length > 0 && (
                              <span>+ {item.modifiers.map(m => m.name).join(', ')}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                        onClick={() => removeFromCart(item.cartId)}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateNotes(item.cartId, e.target.value)}
                      placeholder="Ghi chú (Vd: Ít cay...)"
                      className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-all"
                    />

                    <div className="flex justify-between items-center mt-1">
                      <span className="text-blue-700 dark:text-blue-500 font-bold">{(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ</span>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button 
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-white rounded-md transition-colors font-bold text-sm shadow-sm"
                          onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="w-10 text-center text-slate-800 dark:text-white text-sm font-bold">{item.quantity}</span>
                        <button 
                          className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-white rounded-md transition-colors font-bold text-sm shadow-sm"
                          onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700 mt-2">
                  <span className="text-slate-600 dark:text-slate-300 text-lg font-medium">Thành tiền:</span>
                  <span className="text-blue-700 dark:text-blue-500 text-2xl font-bold">
                    {cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0).toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 bg-slate-50 dark:bg-slate-800/50">
          <button 
            className="flex-1 bg-white border border-slate-200 dark:border-slate-600 dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white py-3 px-4 rounded-xl font-medium transition-colors shadow-sm"
            onClick={onCancel}
          >
            Đóng
          </button>
          <button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            onClick={handleSubmit}
            disabled={cart.length === 0 || adding}
          >
            {adding ? (
              <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang thêm...</>
            ) : (
              <><i className="fa-solid fa-check mr-2"></i> Xác nhận thêm ({cart.length} món)</>
            )}
          </button>
        </div>
      </div>

      {configuringProduct && (
        <ProductOptionsModal
          product={configuringProduct}
          isOpen={!!configuringProduct}
          onClose={() => setConfiguringProduct(null)}
          onConfirm={(variant, modifiers, qty, customNotes) => {
             addToCart(configuringProduct, variant, modifiers || [], qty || 1, customNotes || '');
             setConfiguringProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default AddItemDialog;