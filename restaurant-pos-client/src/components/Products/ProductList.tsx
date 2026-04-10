import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { formatCurrency } from '../../utils/priceUtils';
import { SkeletonGrid, LoadingOverlay } from '../Common/Skeleton';
import { useToast } from '../../contexts/ToastContext';
import { usePermissions } from '../../hooks/usePermissions';
import ConfirmDialog from '../Common/ConfirmDialog';
import { PRODUCT_MESSAGES, COMMON_MESSAGES } from '../../constants/messages';

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const permissions = usePermissions();
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Confirm dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);

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
      setAllProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      showError(PRODUCT_MESSAGES.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setProductToDelete({ id, name });
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(productToDelete.id);
      await productService.delete(productToDelete.id);
      setAllProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      showSuccess(PRODUCT_MESSAGES.DELETE_SUCCESS);
    } catch (err) {
      console.error('Error deleting product:', err);
      showError(PRODUCT_MESSAGES.DELETE_ERROR);
    } finally {
      setDeleting(null);
      setShowConfirmDialog(false);
      setProductToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setProductToDelete(null);
  };

  // ✅ Client-side filtering logic
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === null || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ✅ Compute Stats
  const stats = {
    total: allProducts.length,
    active: allProducts.filter(p => p.isAvailable).length,
    outOfStock: allProducts.filter(p => p.stockQuantity === 0).length,
    lowStock: allProducts.filter(p => p.stockQuantity !== undefined && p.stockQuantity > 0 && p.stockQuantity < 10).length
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i className="fas fa-hamburger"></i> QUẢN LÝ THỰC ĐƠN
          </h2>
        </div>
        <SkeletonGrid items={6} columns={3} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">QUẢN LÝ THỰC ĐƠN</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý danh sách món ăn, giá cả và tình trạng kho</p>
          <div className="flex gap-3 mt-3 flex-wrap">
             <div className="px-3 py-1.5 rounded-xl text-sm font-medium border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex gap-2 items-center">
                <span className="text-slate-500 dark:text-slate-400">Tổng món</span>
                <span className="text-slate-900 dark:text-white font-bold">{stats.total}</span>
             </div>
             <div className="px-3 py-1.5 rounded-xl text-sm font-medium border bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50 flex gap-2 items-center">
                <span>Đang bán</span>
                <span className="font-bold">{stats.active}</span>
             </div>
             <div className="px-3 py-1.5 rounded-xl text-sm font-medium border bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800/50 flex gap-2 items-center">
                <span>Sắp hết</span>
                <span className="font-bold">{stats.lowStock}</span>
             </div>
             <div className="px-3 py-1.5 rounded-xl text-sm font-medium border bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50 flex gap-2 items-center">
                <span>Hết hàng</span>
                <span className="font-bold">{stats.outOfStock}</span>
             </div>
          </div>
        </div>
        
        {permissions.products.canCreate && (
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
            onClick={() => navigate('/products/new')}
          >
            <i className="fas fa-circle-plus"></i> THÊM MÓN MỚI
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
         <div className="relative w-full sm:w-96 flex items-center">
            <i className="fas fa-search absolute left-3.5 text-slate-400"></i>
            <input 
              type="text" 
              className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white"
              placeholder="Tìm kiếm món ăn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button 
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" 
                  onClick={() => setSearchTerm('')}
                >
                   <i className="fas fa-xmark"></i>
                </button>
            )}
         </div>

         <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
               className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
               onClick={() => setViewMode('grid')}
               title="Dạng lưới"
            >
               <i className="fas fa-th"></i>
            </button>
            <button
               className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'}`}
               onClick={() => setViewMode('list')}
               title="Dạng danh sách"
            >
               <i className="fas fa-list"></i>
            </button>
         </div>
      </div>

      {/* Category Filters */}
      <div className="overflow-x-auto pb-2 mb-6 scrollbar-hide">
         <div className="flex gap-2 min-w-max">
            <button
               className={`whitespace-nowrap px-4 py-2 rounded-xl border font-medium text-sm transition-all flex items-center gap-2 ${selectedCategory === null ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300'}`}
               onClick={() => setSelectedCategory(null)}
            >
               <i className="fas fa-utensils"></i>
               Tất cả
               <span className={`px-2 py-0.5 rounded-full text-xs ${selectedCategory === null ? 'bg-blue-100 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-700'}`}>{allProducts.length}</span>
            </button>
            {categories.map(category => {
               const isActive = selectedCategory === category.id;
               const count = allProducts.filter(p => p.categoryId === category.id).length;
               return (
                 <button
                    key={category.id}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl border font-medium text-sm transition-all flex items-center gap-2 ${isActive ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 text-slate-700 dark:text-slate-300'}`}
                    onClick={() => setSelectedCategory(category.id)}
                 >
                    <i className="fas fa-tag"></i>
                    {category.name}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-blue-100 dark:bg-blue-800' : 'bg-slate-100 dark:bg-slate-700'}`}>
                       {count}
                    </span>
                 </button>
               );
            })}
         </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
          {filteredProducts.map(product => (
            <div key={product.id} className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'}`}>
              <div className={`relative bg-slate-100 dark:bg-slate-900 flex-shrink-0 group ${viewMode === 'list' ? 'w-48 h-auto' : 'h-48 w-full'}`}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                     <i className="fas fa-image text-3xl"></i>
                     <span className="text-sm">Không có ảnh</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button
                     className="bg-white text-slate-900 px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                     onClick={() => navigate(`/products/edit/${product.id}`)}
                   >
                     <i className="fas fa-pen-to-square"></i> Chỉnh sửa
                   </button>
                </div>
                {/* Stock Badge Overlay */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                   {(product.stockQuantity !== undefined) && (
                     product.stockQuantity < 0 ? (
                        <span className="bg-blue-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"><i className="fas fa-infinity"></i></span>
                     ) : product.stockQuantity === 0 ? (
                        <span className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">Hết hàng</span>
                     ) : product.stockQuantity < 10 ? (
                        <span className="bg-orange-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">Còn {product.stockQuantity}</span>
                     ) : null
                   )}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                  <div className="flex-grow">
                     <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight">{product.name}</h3>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0 text-lg">{formatCurrency(product.price)}</span>
                     </div>
                     <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        {categories.find(c => c.id === product.categoryId)?.name || 'Chưa phân loại'}
                     </p>
                  </div>

                  {product.description && (
                     <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 leading-relaxed">{product.description}</p>
                  )}

                  <div className="mt-auto">
                      <div className={`flex items-center gap-1.5 text-sm font-medium mb-4 ${product.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                         <i className={`fas fa-${product.isAvailable ? 'check-circle' : 'times-circle'}`}></i>
                         {product.isAvailable ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                      </div>

                      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                         {permissions.products.canEdit && (
                           <button
                             className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition-colors"
                             onClick={() => navigate(`/products/edit/${product.id}`)}
                             title="Chỉnh sửa"
                           >
                             <i className="fas fa-pen-to-square"></i>
                           </button>
                         )}
                         {permissions.products.canDelete && (
                           <button
                             className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-colors"
                             onClick={() => handleDeleteClick(product.id, product.name)}
                             disabled={deleting === product.id}
                             title="Xóa"
                           >
                             {deleting === product.id ? (
                               <i className="fas fa-spinner fa-spin"></i>
                             ) : (
                               <i className="fas fa-trash-can"></i>
                             )}
                           </button>
                         )}
                      </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
           <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 text-2xl mb-4">
              <i className="fas fa-hamburger-open"></i>
           </div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Không tìm thấy món ăn</h3>
           <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">
            {searchTerm 
              ? `Không có kết quả nào khớp với "${searchTerm}"`
              : (selectedCategory ? 'Danh mục này chưa có món ăn nào' : 'Chưa có dữ liệu thực đơn')}
           </p>
           {permissions.products.canCreate && !searchTerm && !selectedCategory && (
             <button 
               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors"
               onClick={() => navigate('/products/new')}
             >
               + Thêm món đầu tiên
             </button>
           )}
        </div>
      )}

      {deleting && <LoadingOverlay message="Đang xóa thực đơn..." transparent />}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={PRODUCT_MESSAGES.CONFIRM_DELETE_TITLE}
        message={COMMON_MESSAGES.CONFIRM_DELETE('món ăn', productToDelete?.name)}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default ProductList;
