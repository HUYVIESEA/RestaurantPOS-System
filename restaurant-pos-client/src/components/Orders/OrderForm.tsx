import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();

  // Get preselected table from location state OR URL params (for takeaway)
  const urlTableId = searchParams.get('tableId');
  const isTakeaway = searchParams.get('takeaway') === 'true'; // ✅ Detect takeaway mode
  const preselectedTableId = location.state?.tableId || (urlTableId ? parseInt(urlTableId) : null);

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

  // ✅ Sync selectedTable with URL param
  useEffect(() => {
    if (urlTableId) {
      const tableId = parseInt(urlTableId);
      if (!isNaN(tableId)) {
        setSelectedTable(tableId);
      }
    }
  }, [urlTableId]);

const fetchData = async () => {
    try {
      const [tablesData, productsData, categoriesData] = await Promise.all([
        tableService.getAll(),
productService.getAll(),
        categoryService.getAll(),
      ]);
      
      // ✅ Handle Takeaway Logic
      if (isTakeaway) {
        // Find a table specifically for takeaway if not already selected
        if (!selectedTable) {
           const takeawayTable = tablesData.find(t => 
             t.tableNumber.toLowerCase().includes('mang') || 
             t.tableNumber.toLowerCase() === 'takeaway'
           );
           if (takeawayTable) setSelectedTable(takeawayTable.id);
        }
      }

      setTables(tablesData); // ✅ Load ALL tables so we can show occupied ones too
      setProducts(productsData.filter(p => p.isAvailable));
      setCategories(categoriesData);
    } catch (err) {
      setError('Không thể tải dữ liệu');
    }
  };

  const addToCart = (product: Product) => {
    // Check stock
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const isUnlimited = product.stockQuantity !== undefined && product.stockQuantity < 0;
    
    if (!isUnlimited && product.stockQuantity !== undefined && (currentQty + 1) > product.stockQuantity) {
       setError(`Sản phẩm "${product.name}" chỉ còn ${product.stockQuantity} món`);
       return;
    }

    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, notes: '' }]);
    }
    setError(null);
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      // Check stock limit
      const item = cart.find(i => i.product.id === productId);
      if (item) {
          const isUnlimited = item.product.stockQuantity !== undefined && item.product.stockQuantity < 0;
          if (!isUnlimited && item.product.stockQuantity !== undefined && quantity > item.product.stockQuantity) {
              setError(`Không đủ số lượng trong kho`);
              return;
          }
      }

      setCart(cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
      setError(null);
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

    // ✅ Table is mandatory ONLY if NOT takeaway, or if we enforce it
    // If backend requires tableId, we must have selectedTable.
    // If it's takeaway map to a virtual table or null if backend allows.
    if (!selectedTable && !isTakeaway) {
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
        tableId: selectedTable || undefined,
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
      if (selectedTable) {
        await tableService.updateAvailability(selectedTable, false);
      }
      
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
        <h2>{isTakeaway ? '🥡 Đơn Mang Về' : '🛒 Tạo đơn hàng mới'}</h2>
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
            {filteredProducts.map(product => {
                 const isUnlimited = product.stockQuantity !== undefined && product.stockQuantity < 0;
                 const isOutOfStock = !isUnlimited && product.stockQuantity !== undefined && product.stockQuantity <= 0;
                 return (
                    <div 
                        key={product.id} 
                        className={`product-item ${isOutOfStock ? 'out-of-stock' : ''}`} 
                        onClick={() => !isOutOfStock && addToCart(product)}
                    >
                        {product.imageUrl && (
                            <img src={product.imageUrl} alt={product.name} />
                        )}
                        <div className="product-info">
                            <h4>{product.name}</h4>
                            <p className="product-price">{product.price.toLocaleString('vi-VN')} đ</p>
                            <div className="stock-info">
                                {isUnlimited ? (
                                    <span className="badge-stock unlimited">∞ Vô hạn</span>
                                ) : isOutOfStock ? (
                                    <span className="badge-stock out">Hết hàng</span>
                                ) : (
                                    <span className="badge-stock">Còn: {product.stockQuantity}</span>
                                )}
                            </div>
                        </div>
                        <button className="btn-add" disabled={isOutOfStock}>+</button>
                    </div>
                 );
            })}
          </div>
        </div>

     {/* Right: Cart & Order Info */}
    <div className="cart-section">
          <form onSubmit={handleSubmit}>
            {/* Table Selection - Hidden/Readonly for Takeaway if needed */}
            <div className="form-group">
                <label>Bàn {!isTakeaway && '*'}</label>
                {isTakeaway ? (
                    <div className="takeaway-badge">
                        <i className="fas fa-shopping-bag"></i> 
                        {selectedTable ? ' Đã chọn bàn Mang Về' : ' Mang về (Không cần bàn)'}
                    </div>
                ) : (
                    <select
                        value={selectedTable || ''}
                        onChange={(e) => setSelectedTable(Number(e.target.value))}
                        required
                    >
                        <option value="">Chọn bàn</option>
                        {tables.map(table => (
                            <option 
                                key={table.id} 
                                value={table.id}
                                disabled={!table.isAvailable && table.id !== selectedTable}
                            >
                                {table.tableNumber} - {table.floor} ({table.capacity} người) {!table.isAvailable ? '(Đang phục vụ)' : ''}
                            </option>
                        ))}
                    </select>
                )}
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
              disabled={loading || cart.length === 0 || (!selectedTable && !isTakeaway)}
            >
              {loading ? 'Đang tạo...' : isTakeaway ? '🥡 Tạo đơn Mang Về' : '✓ Tạo đơn hàng'}
            </button>
  </form>
   </div>
      </div>
    </div>
  );
};

export default OrderForm;
