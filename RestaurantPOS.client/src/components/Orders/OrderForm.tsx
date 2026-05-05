import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { tableService } from '../../services/tableService';
import { categoryService } from '../../services/categoryService';
import { Order, OrderItem, Product, Table, Category, ProductVariant, ModifierItem } from '../../types';
import Toast from '../Common/Toast';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';
import { parseVoiceOrder } from '../../utils/voiceOrderParser';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import ProductOptionsModal from './ProductOptionsModal';

interface CartItem {
  cartId: string;
  product: Product;
  quantity: number;
  notes: string;
  variant?: ProductVariant;
  modifiers?: ModifierItem[];
  unitPrice: number;
}

const OrderForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const urlTableId = searchParams.get('tableId');
  const isTakeaway = searchParams.get('takeaway') === 'true';
  const preselectedTableId = location.state?.tableId || (urlTableId ? parseInt(urlTableId) : null);

  const [selectedTable, setSelectedTable] = useState<number | null>(preselectedTableId || null);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [configuringProduct, setConfiguringProduct] = useState<Product | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { isListening, transcript, finalTranscript, start, stop, supported } = useVoiceRecognition();
  const { speak } = useTextToSpeech();
  
  const personas = ["Bếp ơi", "Em ơi", "Bạn ơi"];
  const getRandomPersona = () => personas[Math.floor(Math.random() * personas.length)];
  const [activePersona, setActivePersona] = useState("Bếp ơi");

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartListening = () => {
      try {
        console.log("Starting voice recognition...");
        const newPersona = getRandomPersona();
        setActivePersona(newPersona);
        speak(`${newPersona} đây, mời gọi món`);
        start();
      } catch (e) {
        alert("Không thể khởi động micro. Vui lòng kiểm tra quyền truy cập.");
        console.error(e);
      }
  };

  const toggleListening = () => {
      if (isListening) {
          stop();
      } else {
          handleStartListening();
      }
  };

  useEffect(() => {
      if (finalTranscript) {
          console.log("Processing voice:", finalTranscript);
          const parsedItems = parseVoiceOrder(finalTranscript, products);
          
          if (parsedItems.length > 0) {
              let addedCount = 0;
              let newCart = [...cart];
              let spokenItems: string[] = [];

              parsedItems.forEach(({ product, quantity }) => {
                   // const isUnlimited = product.stockQuantity !== undefined && product.stockQuantity < 0;
                   const modIds = '';
                   const cartId = `${product.id}-0-${modIds}`;
                   const existingIndex = newCart.findIndex(i => i.cartId === cartId);
                   
                   if (existingIndex > -1) {
                       newCart[existingIndex].quantity += quantity;
                   } else {
                       newCart.push({ cartId, product, quantity, notes: '', unitPrice: product.price });
                   }
                   addedCount++;
                   spokenItems.push(`${quantity} ${product.name}`);
              });

              setCart(newCart);
              const message = `Đã thêm ${spokenItems.join(', ')}`;
              setToastMessage(`🎤 ${message}`);
              setShowToast(true);
              speak(`Đã thêm ${spokenItems.length} món. ${activePersona} nghe rõ!`);
          }
      }
  }, [finalTranscript, products, activePersona, speak]);

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
      
      if (isTakeaway) {
        if (!selectedTable) {
           const takeawayTable = tablesData.find(t => 
             t.tableNumber.toLowerCase().includes('mang') || 
             t.tableNumber.toLowerCase() === 'takeaway'
           );
           if (takeawayTable) setSelectedTable(takeawayTable.id);
        }
      }

      setTables(tablesData);
      setProducts(productsData.filter(p => p.isAvailable));
      setCategories(categoriesData);
    } catch (err) {
      setError('Không thể tải dữ liệu');
    }
  };

  const handleProductClick = (product: Product) => {
    if ((product.variants && product.variants.length > 0) || (product.modifiers && product.modifiers.length > 0)) {
      setConfiguringProduct(product);
    } else {
      addToCart(product, undefined, [], 1, '');
    }
  };

  const addToCart = (product: Product, variant?: ProductVariant, modifiers: ModifierItem[] = [], qty: number = 1, customNotes: string = '') => {
    const modIds = modifiers.map(m => m.id).sort().join(',');
    const cartId = `${product.id}-${variant?.id || 0}-${modIds}-${customNotes}`;
    const unitPrice = product.price + (variant?.priceDelta || 0) + modifiers.reduce((sum, m) => sum + (m.priceDelta || 0), 0);

    const existing = cart.find(item => item.cartId === cartId);
    const currentQty = existing ? existing.quantity : 0;
    const isUnlimited = product.stockQuantity !== undefined && product.stockQuantity < 0;
    
    if (!isUnlimited && product.stockQuantity !== undefined && (currentQty + qty) > product.stockQuantity) {
       setError(`Sản phẩm "${product.name}" chỉ còn ${product.stockQuantity} món`);
       return;
    }

    if (existing) {
      setCart(cart.map(item =>
        item.cartId === cartId
          ? { ...item, quantity: item.quantity + qty }
          : item
      ));
    } else {
      setCart([...cart, { cartId, product, quantity: qty, notes: customNotes, variant, modifiers, unitPrice }]);
    }
    setError(null);
    setConfiguringProduct(null);
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.cartId !== cartId));
    } else {
      const item = cart.find(i => i.cartId === cartId);
      if (item) {
          const isUnlimited = item.product.stockQuantity !== undefined && item.product.stockQuantity < 0;
          if (!isUnlimited && item.product.stockQuantity !== undefined && quantity > item.product.stockQuantity) {
              setError(`Không đủ số lượng trong kho`);
              return;
          }
      }

      setCart(cart.map(item =>
        item.cartId === cartId ? { ...item, quantity } : item
      ));
      setError(null);
    }
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
            unitPrice: item.unitPrice,
            notes: item.notes || undefined,
            variantId: item.variant?.id,
            modifierItemIds: item.modifiers?.map(m => m.id),
        })) as OrderItem[],
      };

      await orderService.create(orderData as Omit<Order, 'id' | 'orderDate' | 'totalAmount'>);
      
      const selectedTableData = tables.find(t => t.id === selectedTable);
      setToastMessage(`Đã tạo đơn cho ${selectedTableData?.tableNumber || 'Mang về'}! Tổng: ${calculateTotal().toLocaleString('vi-VN')} đ`);
      setShowToast(true);
      
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
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
      {showToast && (
        <Toast 
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {configuringProduct && (
        <ProductOptionsModal
          product={configuringProduct}
          isOpen={!!configuringProduct}
          onClose={() => setConfiguringProduct(null)}
          onConfirm={(variant, modifiers, qty, notes) => addToCart(configuringProduct, variant, modifiers || [], qty || 1, notes || '')}
        />
      )}

      {supported && isListening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all" onClick={stop}>
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full mx-4 border border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-2 h-8 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">{activePersona} đang nghe...</h3>
            <p className="text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-700 p-4 rounded-xl border border-slate-100 dark:border-slate-600 min-h-[4rem] flex items-center justify-center">
              {transcript || `Hãy nói: '${activePersona}, cho 2 bún đậu...'`}
            </p>
            <button className="mt-6 px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 font-bold rounded-xl transition-colors w-full" onClick={stop}>
              🛑 Dừng lại
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
          {isTakeaway ? <><i className="fa-solid fa-box-open text-blue-600"></i> Đơn Mang Về</> : <><i className="fa-solid fa-cart-shopping text-blue-600"></i> Tạo đơn hàng mới</>}
        </h2>
        
        <div className="flex flex-wrap items-center gap-4">
          {supported && (
            <button 
              type="button" 
              className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-xl transition-all shadow-sm ${
                isListening 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 animate-pulse ring-2 ring-blue-500' 
                : 'bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
              onClick={toggleListening}
              title={`Gọi ${activePersona} hỗ trợ`}
            >
              <i className={`fas fa-microphone${isListening ? '-slash' : ''}`}></i>
              {isListening ? ` ${activePersona} đang nghe` : ` Gọi ${activePersona}`}
            </button>
          )}
          <button 
            onClick={() => navigate('/tables')} 
            className="flex items-center gap-2 px-4 py-2 font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-600 rounded-r-xl shadow-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left: Menu */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <i className="fa-solid fa-clipboard-list text-blue-600"></i> Thực đơn
            </h3>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategory === null 
                  ? 'bg-blue-700 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                Tất cả
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedCategory === cat.id 
                    ? 'bg-blue-700 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => {
                const isUnlimited = product.stockQuantity !== undefined && product.stockQuantity < 0;
                const isOutOfStock = !isUnlimited && product.stockQuantity !== undefined && product.stockQuantity <= 0;
                return (
                  <div 
                    key={product.id} 
                    className={`group relative flex flex-col justify-between bg-white dark:bg-slate-700 rounded-2xl p-4 border border-slate-100 dark:border-slate-600 transition-all ${
                      isOutOfStock 
                      ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' 
                      : 'cursor-pointer hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-600/30'
                    }`}
                    onClick={() => !isOutOfStock && handleProductClick(product)}
                  >
                    {product.imageUrl && (
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-grow">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 line-clamp-2">{product.name}</h4>
                      <p className="text-blue-700 dark:text-blue-500 font-bold mb-3">{product.price.toLocaleString('vi-VN')} đ</p>
                      <div className="mt-auto flex items-center justify-between">
                        {isUnlimited ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">∞ Vô hạn</span>
                        ) : isOutOfStock ? (
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Hết hàng</span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Còn: {product.stockQuantity}</span>
                        )}
                      </div>
                    </div>
                    {!isOutOfStock && (
                      <button className="absolute top-2 right-2 w-11 h-11 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-500 rounded-full shadow-md flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 dark:hover:bg-slate-700">
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Cart & Order Info */}
        <div className="w-full lg:w-1/3 sticky top-6">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full max-h-[calc(100vh-2rem)]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex-shrink-0">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                Thông tin đơn hàng
              </h3>
              
              {/* Table Selection */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bàn {!isTakeaway && '*'}</label>
                {isTakeaway ? (
                  <div className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-500 rounded-xl font-medium flex items-center gap-2 border border-blue-100 dark:border-blue-900/30">
                    <i className="fas fa-shopping-bag"></i> 
                    {selectedTable ? 'Đã chọn bàn Mang Về' : 'Mang về (Không cần bàn)'}
                  </div>
                ) : (
                  <select
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
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
              <div className="mb-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tên khách hàng</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Tùy chọn"
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-800/50 min-h-[300px] lg:min-h-0">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                Giỏ hàng
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-500 py-1 px-3 rounded-full text-xs">{cart.length} món</span>
              </h3>
              
              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 italic">
                  Chưa có món nào trong giỏ
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cart.map(item => (
                    <div key={item.cartId} className="bg-white dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm flex flex-col gap-2 relative">
                      <div className="flex justify-between items-start pr-6">
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.product.name}</h4>
                          {(item.variant || (item.modifiers && item.modifiers.length > 0)) && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-col gap-0.5">
                              {item.variant && <span>Size: {item.variant.name}</span>}
                              {item.modifiers && item.modifiers.length > 0 && (
                                <span>+ {item.modifiers.map(m => m.name).join(', ')}</span>
                              )}
                            </div>
                          )}
                          {item.notes && (
                             <div className="text-xs text-amber-600 dark:text-amber-500 mt-1 italic">"{item.notes}"</div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-slate-600 transition-colors"
                          onClick={() => removeFromCart(item.cartId)}
                          title="Xóa món"
                        >
                          <i className="fas fa-xmark"></i>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-blue-700 dark:text-blue-500 font-bold text-sm">{(item.unitPrice * item.quantity).toLocaleString('vi-VN')} đ</p>
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600/50">
                          <button
                            type="button"
                            className="w-10 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium transition-colors"
                            onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                          >
                            <i className="fas fa-minus text-xs"></i>
                          </button>
                          <span className="w-10 text-center text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 h-9 flex items-center justify-center border-x border-slate-200 dark:border-slate-600/50">{item.quantity}</span>
                          <button
                            type="button"
                            className="w-10 h-9 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-medium transition-colors"
                            onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                          >
                            <i className="fas fa-plus text-xs"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-800 rounded-b-2xl">
              {/* Notes */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ghi chú</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú cho đơn hàng..."
                  rows={2}
                />
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-600">
                <span className="text-slate-600 dark:text-slate-400 font-medium uppercase tracking-wide">Tổng cộng</span>
                <strong className="text-2xl text-blue-700 dark:text-blue-500 font-black">{calculateTotal().toLocaleString('vi-VN')} đ</strong>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                  loading || cart.length === 0 || (!selectedTable && !isTakeaway)
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700/50 dark:text-slate-500 shadow-none border border-slate-300 dark:border-slate-600'
                    : 'bg-blue-700 text-white hover:bg-blue-800 hover:shadow-blue-600/25 active:scale-[0.98]'
                }`}
                disabled={loading || cart.length === 0 || (!selectedTable && !isTakeaway)}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <i className="fas fa-circle-notch fa-spin"></i> Đang tạo...
                  </span>
                ) : isTakeaway ? (
                  <><i className="fa-solid fa-box-open"></i> Tạo đơn Mang Về</>
                ) : (
                  <><i className="fa-solid fa-check"></i> Tạo đơn hàng</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
