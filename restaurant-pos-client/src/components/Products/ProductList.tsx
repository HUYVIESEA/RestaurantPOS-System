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
  
  const [products, setProducts] = useState<Product[]>([]);
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
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching data:', err);
showError('Không thể tải dữ liệu thực đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
 try {
      setLoading(true);
      const data = categoryId
        ? await productService.getByCategory(categoryId)
   : await productService.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error filtering products:', err);
      showError('Không thể lọc món ăn');
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
      setProducts(products.filter(p => p.id !== productToDelete.id));
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="product-list-container">
<div className="header">
          <h2><i className="fas fa-box"></i> Quản lý thực đơn</h2>
        </div>
   <SkeletonGrid items={6} columns={3} />
      </div>
    );
  }

  return (
    <div className="product-list-container">
      {/* Header */}
   <div className="header">
        <div className="header-left">
          <h2><i className="fas fa-box"></i> Quản lý thực đơn</h2>
       <span className="product-count">{filteredProducts.length} thực đơn</span>
        </div>
        {permissions.products.canCreate && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/products/new')}
          >
            <i className="fas fa-plus"></i> Thêm món ăn
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
   <input
    type="text"
            placeholder="Tìm kiếm thực đơn..."
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
      <div className="category-filters">
        <button
          className={`category-chip ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => handleCategoryFilter(null)}
        >
   <i className="fas fa-th-large"></i>
       Tất cả
          <span className="count">{products.length}</span>
        </button>
        {categories.map(category => (
          <button
            key={category.id}
    className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
onClick={() => handleCategoryFilter(category.id)}
>
        <i className="fas fa-tag"></i>
            {category.name}
            <span className="count">
   {products.filter(p => p.categoryId === category.id).length}
            </span>
          </button>
        ))}
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
          <i className="fas fa-eye"></i>
        </button>
  </div>
      </div>

  <div className="product-content">
          <div className="product-header">
            <h3 className="product-name">{product.name}</h3>
            <div className="status-badges">
              <span className={`availability-badge ${product.isAvailable ? 'available' : 'unavailable'}`}>
                {product.isAvailable ? (
                  <><i className="fas fa-check-circle"></i> Còn hàng</>
                ) : (
                  <><i className="fas fa-times-circle"></i> Hết hàng</>
                )}
              </span>
              {(product.stockQuantity !== undefined && product.stockQuantity < 10 && product.stockQuantity > 0) && (
                 <span className="stock-badge low-stock">
                    <i className="fas fa-exclamation-triangle"></i> Sắp hết: {product.stockQuantity}
                 </span>
              )}
               {(product.stockQuantity !== undefined && product.stockQuantity === 0) && (
                 <span className="stock-badge out-stock">
                    <i className="fas fa-ban"></i> Hết kho
                 </span>
              )}
               {(product.stockQuantity !== undefined && product.stockQuantity >= 10) && (
                 <span className="stock-badge in-stock">
                    <i className="fas fa-cubes"></i> SL: {product.stockQuantity}
                 </span>
              )}
            </div>
          </div>

     {product.description && (
      <p className="product-description">{product.description}</p>
       )}

      <div className="product-meta">
   <span className="category-tag">
            <i className="fas fa-folder"></i>
  {product.category?.name || 'Chưa phân loại'}
                  </span>
     </div>

              <div className="product-footer">
 <div className="price-section">
        <span className="price-label">Giá</span>
           <span className="price">{formatCurrency(product.price)}</span>
       </div>

     <div className="action-buttons">
              {permissions.products.canEdit && (
                <button
                  className="btn btn-sm btn-edit"
                  onClick={() => navigate(`/products/edit/${product.id}`)}
                  title="Chỉnh sửa"
                >
                  <i className="fas fa-edit"></i>
                </button>
              )}
              {permissions.products.canDelete && (
                <button
                  className="btn btn-sm btn-delete"
                  onClick={() => handleDeleteClick(product.id, product.name)}
                  disabled={deleting === product.id}
                  title="Xóa"
                >
                  {deleting === product.id ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-trash"></i>
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
        <div className="empty-state">
     <i className="fas fa-box-open"></i>
          <h3>Không tìm thấy thực đơn</h3>
     <p>
            {searchTerm 
              ? `Không có thực đơn nào khớp với "${searchTerm}"`
           : 'Chưa có thực đơn nào. Hãy thêm món ăn mới!'}
  </p>
          {!searchTerm && permissions.products.canCreate && (
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/products/new')}
            >
              <i className="fas fa-plus"></i> Thêm thực đơn đầu tiên
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
