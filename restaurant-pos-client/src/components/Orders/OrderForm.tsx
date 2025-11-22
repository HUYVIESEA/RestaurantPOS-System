import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { tableService } from '../../services/tableService';
import { categoryService } from '../../services/categoryService';
import { Order, OrderItem, Product, Table, Category } from '../../types';
import Toast from '../Common/Toast';
import './OrderForm.css';

interface CartItem {
  product: Product;
  quantity: number;
  notes: string;
}

const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get preselected table from location state
  const preselectedTableId = location.state?.tableId;

  const [selectedTable, setSelectedTable] = useState<number | null>(preselectedTableId || null);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false); // ✅ Toast state
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
    try {
      const [tablesData, productsData, categoriesData] = await Promise.all([
        tableService.getAll(),
productService.getAll(),
        categoryService.getAll(),
      ]);
      setTables(tablesData.filter(t => t.isAvailable));
      setProducts(productsData.filter(p => p.isAvailable));
    setCategories(categoriesData);
    } catch (err) {
      setError('Không thể tải dữ liệu');
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
if (existing) {
      setCart(cart.map(item =>
  item.product.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
  } else {
      setCart([...cart, { product, quantity: 1, notes: '' }]);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
 } else {
      setCart(cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
 setError(null);

    if (!selectedTable) {
      setError('Vui lòng chọn bàn');
    setLoading(false);
   return;
    }

    if (cart.length === 0) {
      setError('Vui lòng thêm ít nhất 1 món');
      setLoading(false);
      return;
    }

  try {
      const orderData: Partial<Order> = {
        tableId: selectedTable,
customerName: customerName.trim() || undefined,
        notes: notes.trim() || undefined,
 status: 'Pending',
        orderItems: cart.map(item => ({
  id: 0,
   orderId: 0,
    productId: item.product.id,
        quantity: item.quantity,
          unitPrice: item.product.price,
       notes: item.notes || undefined,
        })) as OrderItem[],
      };

      await orderService.create(orderData as Omit<Order, 'id' | 'orderDate' | 'totalAmount'>);
      
      // Mark table as occupied
      await tableService.updateAvailability(selectedTable, false);
      
      // ✅ Show toast notification
      const selectedTableData = tables.find(t => t.id === selectedTable);
      setToastMessage(`✅ Đã tạo đơn cho ${selectedTableData?.tableNumber}! Tổng: ${calculateTotal().toLocaleString('vi-VN')} đ`);
 setShowToast(true);
      
      // ✅ Redirect to Tables after short delay
      setTimeout(() => {
     navigate('/tables');
   }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="order-form-container">
      {/* ✅ Toast Notification */}
      {showToast && (
   <Toast 
          message={toastMessage}
          type="success"
    onClose={() => setShowToast(false)}
        />
      )}

      <div className="form-header">
<h2>🛒 Tạo đơn hàng mới</h2>
     <button onClick={() => navigate('/tables')} className="btn-back">
          ← Quay lại
    </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="order-layout">
        {/* Left: Menu */}
        <div className="menu-section">
          <h3>📋 Thực đơn</h3>
  
          {/* Category Filter */}
       <div className="category-filters">
  <button
     className={`cat-btn ${selectedCategory === null ? 'active' : ''}`}
   onClick={() => setSelectedCategory(null)}
            >
              Tất cả
      </button>
            {categories.map(cat => (
    <button
                key={cat.id}
       className={`cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
        onClick={() => setSelectedCategory(cat.id)}
>
         {cat.name}
  </button>
            ))}
          </div>

          {/* Products Grid */}
       <div className="products-grid">
            {filteredProducts.map(product => (
       <div key={product.id} className="product-item" onClick={() => addToCart(product)}>
                {product.imageUrl && (
    <img src={product.imageUrl} alt={product.name} />
)}
    <div className="product-info">
              <h4>{product.name}</h4>
         <p className="product-price">{product.price.toLocaleString('vi-VN')} đ</p>
     </div>
      <button className="btn-add">+</button>
       </div>
         ))}
          </div>
        </div>

     {/* Right: Cart & Order Info */}
    <div className="cart-section">
          <form onSubmit={handleSubmit}>
            {/* Table Selection */}
     <div className="form-group">
       <label>Bàn *</label>
              <select
   value={selectedTable || ''}
           onChange={(e) => setSelectedTable(Number(e.target.value))}
       required
        >
  <option value="">Chọn bàn</option>
            {tables.map(table => (
   <option key={table.id} value={table.id}>
       {table.tableNumber} - {table.floor} ({table.capacity} người)
         </option>
   ))}
       </select>
            </div>

            {/* Customer Name */}
            <div className="form-group">
<label>Tên khách hàng</label>
  <input
type="text"
       value={customerName}
  onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tùy chọn"
     />
      </div>

     {/* Cart Items */}
     <div className="cart-items">
   <h3>🛒 Giỏ hàng ({cart.length})</h3>
         {cart.length === 0 ? (
   <p className="empty-cart">Chưa có món nào</p>
     ) : (
     <div className="cart-list">
 {cart.map(item => (
     <div key={item.product.id} className="cart-item">
       <div className="item-info">
       <h4>{item.product.name}</h4>
   <p className="item-price">{item.product.price.toLocaleString('vi-VN')} đ</p>
     </div>
   <div className="item-controls">
              <button
          type="button"
            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
               >
       -
     </button>
     <span>{item.quantity}</span>
               <button
     type="button"
          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
         >
+
              </button>
           <button
   type="button"
        className="btn-remove"
        onClick={() => removeFromCart(item.product.id)}
           >
       ✕
                </button>
  </div>
           <p className="item-total">
               {(item.product.price * item.quantity).toLocaleString('vi-VN')} đ
     </p>
  </div>
       ))}
     </div>
          )}
</div>

            {/* Notes */}
    <div className="form-group">
       <label>Ghi chú</label>
      <textarea
       value={notes}
    onChange={(e) => setNotes(e.target.value)}
       placeholder="Ghi chú cho đơn hàng"
          rows={2}
   />
            </div>

  {/* Total */}
       <div className="order-total">
              <span>Tổng cộng:</span>
      <strong>{calculateTotal().toLocaleString('vi-VN')} đ</strong>
    </div>

       {/* Submit */}
            <button
  type="submit"
   className="btn-submit"
      disabled={loading || cart.length === 0 || !selectedTable}
      >
        {loading ? 'Đang tạo...' : '✓ Tạo đơn hàng'}
         </button>
  </form>
   </div>
      </div>
    </div>
  );
};

export default OrderForm;
