import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';

interface AddItemDialogProps {
  onAdd: (productId: number, quantity: number, notes: string) => void;
  onCancel: () => void;
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({ onAdd, onCancel }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [_loading, setLoading] = useState(true);

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

  const handleSubmit = () => {
    if (!selectedProduct) {
      alert('Vui lòng chọn món');
      return;
    }
    if (quantity < 1) {
      alert('Số lượng phải >= 1');
      return;
    }
    onAdd(selectedProduct.id, quantity, notes);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">➕ Thêm món</h3>
          <button className="text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700" onClick={onCancel}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* Category Filter */}
          <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar">
            <button
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === null ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => handleCategoryFilter(null)}
            >
              Tất cả
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === category.id ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(product => (
              <div
                key={product.id}
                className={`relative bg-gray-700/50 rounded-xl p-4 cursor-pointer transition-all border-2 ${selectedProduct?.id === product.id ? 'border-amber-500 bg-gray-700 shadow-md scale-[1.02]' : 'border-transparent hover:border-gray-600 hover:bg-gray-700'}`}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="text-gray-100 font-medium mb-1 truncate">{product.name}</div>
                <div className="text-amber-400 text-sm font-bold">{product.price.toLocaleString('vi-VN')} đ</div>
                {selectedProduct?.id === product.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">✓</div>
                )}
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-8 text-gray-400">Không có món nào</div>
          )}

          {/* Selected Product Details */}
          {selectedProduct && (
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-700 mt-4">
              <h4 className="text-gray-400 text-sm uppercase tracking-wider mb-4 font-semibold">Món đã chọn</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Tên món:</span>
                  <span className="text-white font-medium text-right">{selectedProduct.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Đơn giá:</span>
                  <span className="text-amber-400 font-bold">{selectedProduct.price.toLocaleString('vi-VN')} đ</span>
                </div>
                
                {/* Quantity Input */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Số lượng:</span>
                  <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
                    <button 
                      className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors font-bold text-lg"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 h-10 bg-transparent text-white text-center font-bold focus:outline-none appearance-none"
                    />
                    <button 
                      className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors font-bold text-lg"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-2">
                  <span className="text-gray-300">Ghi chú:</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ví dụ: Ít cay, nhiều rau..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all resize-none"
                    rows={2}
                  />
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-700 mt-4">
                  <span className="text-gray-300 text-lg font-medium">Thành tiền:</span>
                  <span className="text-amber-500 text-2xl font-bold">{(selectedProduct.price * quantity).toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex gap-3 bg-gray-800/50">
          <button 
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button 
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20"
            onClick={handleSubmit}
            disabled={!selectedProduct}
          >
            ✓ Thêm món ({quantity})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemDialog;