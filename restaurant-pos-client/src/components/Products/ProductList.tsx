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
import './ProductList.css';

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
      showError('Không thể tải dữ liệu thực đơn');
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
      showSuccess('Đã xóa món ăn thành công');
    } catch (err) {
      console.error('Error deleting product:', err);
      showError('Không thể xóa món ăn');
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
      <div className="product-list-container">
        <div className="product-header-section">
          <div className="header-content">
             <h2><i className="fas fa-box"></i> QUẢN LÝ THỰC ĐƠN</h2>
          </div>
        </div>
        <SkeletonGrid items={6} columns={3} />
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {/* Header Section */}
      <div className="product-header-section">
        <div className="header-content">
          <h2>QUẢN LÝ THỰC ĐƠN</h2>
          <p>Quản lý danh sách món ăn, giá cả và tình trạng kho</p>
          <div className="header-stats">
             <div className="stat-badge">
                <span className="label">Tổng món</span>
                <span className="value">{stats.total}</span>
             </div>
             <div className="stat-badge success">
                <span className="label">Đang bán</span>
                <span className="value">{stats.active}</span>
             </div>
             <div className="stat-badge warning">
                <span className="label">Sắp hết</span>
                <span className="value">{stats.lowStock}</span>
             </div>
             <div className="stat-badge danger">
                <span className="label">Hết hàng</span>
                <span className="value">{stats.outOfStock}</span>
             </div>
          </div>
        </div>
        
        {permissions.products.canCreate && (
          <button 
            className="btn-add-product"
            onClick={() => navigate('/products/new')}
          >
            <i className="fas fa-plus"></i> THÊM MÓN MỚI
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="product-toolbar">
         <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm món ăn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                   <i className="fas fa-times"></i>
                </button>
            )}
         </div>

         <div className="view-toggle">
            <button
               className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
               onClick={() => setViewMode('grid')}
               title="Dạng lưới"
            >
               <i className="fas fa-th"></i>
            </button>
            <button
               className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
               onClick={() => setViewMode('list')}
               title="Dạng danh sách"
            >
               <i className="fas fa-list"></i>
            </button>
         </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters-scroll">
         <div className="category-filters">
            <button
               className={`category-chip ${selectedCategory === null ? 'active' : ''}`}
               onClick={() => setSelectedCategory(null)}
            >
               <i className="fas fa-utensils"></i>
               Tất cả
               <span className="count">{allProducts.length}</span>
            </button>
            {categories.map(category => (
               <button
                  key={category.id}
                  className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
               >
                  <i className="fas fa-tag"></i>
                  {category.name}
                  <span className="count">
                     {allProducts.filter(p => p.categoryId === category.id).length}
                  </span>
               </button>
            ))}
         </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className={`products-view ${viewMode}`}>
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} />
                ) : (
                  <div className="no-image">
                     <i className="fas fa-image"></i>
                     <span>Không có ảnh</span>
                  </div>
                )}
                <div className="image-overlay">
                   <button
                     className="quick-view-btn"
                     onClick={() => navigate(`/products/edit/${product.id}`)}
                   >
                     <i className="fas fa-pen"></i> Chỉnh sửa
                   </button>
                </div>
                {/* Stock Badge Overlay */}
                <div className="stock-overlay-badge">
                   {(product.stockQuantity !== undefined) && (
                     product.stockQuantity < 0 ? (
                        <span className="badge infinite"><i className="fas fa-infinity"></i></span>
                     ) : product.stockQuantity === 0 ? (
                        <span className="badge out">Hết hàng</span>
                     ) : product.stockQuantity < 10 ? (
                        <span className="badge low">{product.stockQuantity}</span>
                     ) : null
                   )}
                </div>
              </div>

              <div className="product-content">
                  <div className="product-main">
                     <div className="product-header-row">
                        <h3 className="product-name">{product.name}</h3>
                        <span className="price">{formatCurrency(product.price)}</span>
                     </div>
                     <p className="product-category">
                        {categories.find(c => c.id === product.categoryId)?.name || 'Chưa phân loại'}
                     </p>
                  </div>

                  {product.description && (
                     <p className="product-description">{product.description}</p>
                  )}

                  <div className={`status-bar ${product.isAvailable ? 'available' : 'unavailable'}`}>
                     <span className="status-text">
                        <i className={`fas fa-${product.isAvailable ? 'check-circle' : 'times-circle'}`}></i>
                        {product.isAvailable ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                     </span>
                  </div>

                  <div className="action-row">
                     {permissions.products.canEdit && (
                       <button
                         className="btn-icon btn-edit"
                         onClick={() => navigate(`/products/edit/${product.id}`)}
                         title="Chỉnh sửa"
                       >
                         <i className="fas fa-edit"></i>
                       </button>
                     )}
                     {permissions.products.canDelete && (
                       <button
                         className="btn-icon btn-delete"
                         onClick={() => handleDeleteClick(product.id, product.name)}
                         disabled={deleting === product.id}
                         title="Xóa"
                       >
                         {deleting === product.id ? (
                           <i className="fas fa-spinner fa-spin"></i>
                         ) : (
                           <i className="fas fa-trash-alt"></i>
                         )}
                       </button>
                     )}
                  </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
           <div className="empty-icon">
              <i className="fas fa-box-open"></i>
           </div>
           <h3>Không tìm thấy món ăn</h3>
           <p>
            {searchTerm 
              ? `Không có kết quả nào khớp với "${searchTerm}"`
              : (selectedCategory ? 'Danh mục này chưa có món ăn nào' : 'Chưa có dữ liệu thực đơn')}
           </p>
           {permissions.products.canCreate && !searchTerm && !selectedCategory && (
             <button 
               className="btn-primary"
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
        title="Xác nhận xóa thực đơn"
        message={`Bạn có chắc chắn muốn xóa thực đơn "${productToDelete?.name}"? Hành động này không thể hoàn tác.`}
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
