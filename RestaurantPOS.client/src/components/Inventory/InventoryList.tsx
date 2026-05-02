import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/priceUtils';
import { SkeletonGrid } from '../Common/Skeleton';
import CustomSelect from '../Common/CustomSelect';
import { INVENTORY_MESSAGES, COMMON_MESSAGES } from '../../constants/messages';

const InventoryList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  
  // Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>('');

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
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      showError(INVENTORY_MESSAGES.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (product: Product, newStock: number) => {
    try {
       await productService.update(product.id, { ...product, stockQuantity: newStock });
       // Update local state
       setProducts(products.map(p => p.id === product.id ? { ...p, stockQuantity: newStock } : p));
       showSuccess(INVENTORY_MESSAGES.UPDATE_SUCCESS(product.name));
    } catch (err) {
        showError(INVENTORY_MESSAGES.UPDATE_ERROR);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!window.confirm(COMMON_MESSAGES.CONFIRM_DELETE('sản phẩm', name))) return;
    try {
        await productService.delete(id);
        setProducts(products.filter(p => p.id !== id));
        showSuccess(INVENTORY_MESSAGES.DELETE_SUCCESS);
    } catch (err) {
        showError(INVENTORY_MESSAGES.DELETE_ERROR);
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditQuantity(String(product.stockQuantity || 0));
  };

  const saveQuantity = () => {
    if (!editingProduct) return;
    const stock = parseInt(editQuantity);
    if (!isNaN(stock)) {
        handleUpdateStock(editingProduct, stock);
        setEditingProduct(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    
    let matchesStatus = true;
    if (filterStatus === 'low') matchesStatus = (product.stockQuantity || 0) < 10 && (product.stockQuantity || 0) > 0;
    if (filterStatus === 'out') matchesStatus = (product.stockQuantity || 0) <= 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => (p.stockQuantity || 0) < 10 && (p.stockQuantity || 0) > 0).length;
  const outStockCount = products.filter(p => (p.stockQuantity || 0) <= 0).length;

  // Custom Select Options
  const statusOptions = [
      { value: 'all', label: 'Tất cả trạng thái', icon: 'fas fa-list' },
      { value: 'low', label: 'Sắp hết hàng (<10)', icon: 'fas fa-triangle-exclamation' },
      { value: 'out', label: 'Đã hết hàng', icon: 'fas fa-xmark-circle' }
  ];

  const categoryOptions = [
      { value: 0, label: 'Tất cả danh mục', icon: 'fas fa-tags' }, 
      ...categories.map(c => ({ value: c.id, label: c.name, icon: 'fas fa-utensils' }))
  ];

  const handleCategoryChange = (val: number) => {
      setSelectedCategory(val === 0 ? null : val);
  };

  if (loading) return <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900"><SkeletonGrid items={5} columns={1} /></div>;

  return (
    <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
            <h2 className="text-2xl font-bold"><i className="fas fa-boxes mr-2 text-blue-700 dark:text-blue-500"></i> Quản Lý Kho</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Theo dõi và điều chỉnh số lượng tồn kho</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex gap-4">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center min-w-[100px] shadow-sm">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 uppercase tracking-wider"><i className="fas fa-box mr-1"></i> Tổng SP</span>
                    <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{totalProducts}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 flex flex-col items-center min-w-[100px] shadow-sm">
                    <span className="text-amber-600 dark:text-amber-500 text-xs font-semibold mb-1 uppercase tracking-wider"><i className="fas fa-triangle-exclamation mr-1"></i> Sắp hết</span>
                    <span className="text-xl font-bold text-amber-600 dark:text-amber-500">{lowStockCount}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 rounded-xl p-3 flex flex-col items-center min-w-[100px] shadow-sm">
                    <span className="text-red-600 dark:text-red-500 text-xs font-semibold mb-1 uppercase tracking-wider"><i className="fas fa-xmark-circle mr-1"></i> Hết hàng</span>
                    <span className="text-xl font-bold text-red-600 dark:text-red-500">{outStockCount}</span>
                </div>
            </div>
            
            <button className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-colors whitespace-nowrap" onClick={() => navigate('/products/new')}>
                <i className="fas fa-circle-plus mr-1.5"></i> Thêm sản phẩm
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:text-white transition-all"
                placeholder="Tìm kiếm sản phẩm theo tên..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-48">
                <CustomSelect 
                    options={statusOptions}
                    value={filterStatus}
                    onChange={(val) => setFilterStatus(val as any)}
                    placeholder="Trạng thái"
                />
            </div>

            <div className="w-full sm:w-48">
                <CustomSelect 
                    options={categoryOptions}
                    value={selectedCategory || 0}
                    onChange={(val) => handleCategoryChange(Number(val))}
                    placeholder="Danh mục"
                />
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Danh mục</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Giá niêm yết</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Tồn kho</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700" />
                                    ) : (
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                                            <i className="fas fa-image"></i>
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-slate-800 dark:text-slate-200">{product.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: #{product.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                                    {product.category?.name || 'Không có'}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-blue-700 dark:text-blue-500">
                                {formatCurrency(product.price)}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm bg-slate-100 dark:bg-slate-800 border ${
                                    (product.stockQuantity || 0) <= 0 ? 'text-red-600 border-red-200 dark:border-red-900/50 dark:text-red-400 bg-red-50 dark:bg-red-900/20' :
                                    (product.stockQuantity || 0) < 10 ? 'text-amber-600 border-amber-200 dark:border-amber-900/50 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' :
                                    'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}>
                                    {product.stockQuantity || 0}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {(product.stockQuantity || 0) < 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                        <i className="fas fa-infinity text-[0.6rem] mr-1"></i> Vô hạn
                                    </span>
                                ) : (product.stockQuantity || 0) <= 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                                        Hết hàng
                                    </span>
                                ) : (product.stockQuantity || 0) < 10 ? (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                        Sắp hết
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                                        Còn hàng
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        className="text-xs font-medium px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-500 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                        onClick={() => openEditModal(product)}
                                        title="Cập nhật số lượng"
                                    >
                                        <i className="fas fa-pen-to-square mr-1"></i> Sửa kho
                                    </button>
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors" 
                                        onClick={() => navigate(`/products/edit/${product.id}`)}
                                        title="Sửa thông tin chi tiết"
                                    >
                                        <i className="fas fa-cog"></i>
                                    </button>
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors" 
                                        onClick={() => handleDeleteProduct(product.id, product.name)}
                                        title="Xóa sản phẩm"
                                    >
                                        <i className="fas fa-trash-can"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {filteredProducts.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
                <i className="fas fa-search text-5xl text-slate-300 dark:text-slate-600 mb-4"></i>
                <p className="text-slate-500 dark:text-slate-400 mb-4">Không tìm thấy sản phẩm nào phù hợp</p>
                <button 
                    className="px-4 py-2 bg-blue-700 text-white rounded-xl font-medium hover:bg-blue-800 transition-colors"
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); setSelectedCategory(null); }}
                >
                    Xóa bộ lọc
                </button>
            </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditingProduct(null)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100"><i className="fas fa-boxes text-blue-700 mr-2"></i> Cập nhật kho</h3>
                </div>
                
                <div className="p-6">
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Sản phẩm: <strong className="text-slate-800 dark:text-slate-200 ml-1">{editingProduct.name}</strong>
                    </p>
                    
                    <div className="mb-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Số lượng mới</label>
                        <input 
                            type="number" 
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:text-white transition-all text-lg font-medium"
                            value={editQuantity} 
                            onChange={e => setEditQuantity(e.target.value)}
                            autoFocus
                            placeholder="Nhập số lượng..."
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex items-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-900/50">
                            <i className="fas fa-info-circle text-blue-600 mr-2"></i>
                            <span>Nhập <strong>-1</strong> để thiết lập kho <strong>không giới hạn</strong></span>
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    <button className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" onClick={() => setEditingProduct(null)}>Đóng</button>
                    <button className="px-5 py-2.5 rounded-xl font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-sm" onClick={saveQuantity}>Lưu thay đổi</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
export default InventoryList;
