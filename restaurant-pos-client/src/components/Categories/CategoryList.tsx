import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import './CategoryList.css';

const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh mục.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await categoryService.delete(id);
        setCategories(categories.filter(c => c.id !== id));
      } catch (err) {
        setError('Không thể xóa danh mục.');
        console.error('Error deleting category:', err);
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="category-list-container">
      {/* Header Section */}
      <div className="category-header-section">
        <div className="header-content">
          <h2>QUẢN LÝ DANH MỤC</h2>
          <p>Tổ chức và quản lý các nhóm thực đơn của nhà hàng</p>
          <div className="header-stats">
             <div className="stat-badge">
                <span className="label">Tổng danh mục</span>
                <span className="value">{categories.length}</span>
             </div>
             <div className="stat-badge">
                <span className="label">Đang sử dụng</span>
                <span className="value">{categories.filter(c => c.products && c.products.length > 0).length}</span>
             </div>
          </div>
        </div>
        
        {permissions.categories.canCreate && (
            <button className="btn-add-category" onClick={() => navigate('/categories/new')}>
              <i className="fas fa-plus-circle"></i> THÊM DANH MỤC
            </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="category-toolbar">
         <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm danh mục..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {/* Grid */}
      <div className="categories-grid">
        {filteredCategories.map(category => (
          <div key={category.id} className="category-card">
            <div className="card-top-decoration"></div>
            <div className="category-content">
              <div className="category-icon-wrapper">
                 <i className="fas fa-utensils"></i>
              </div>
              <div className="category-details">
                <h3>{category.name}</h3>
                <p className="description">{category.description || 'Chưa có mô tả'}</p>
                <div className="product-count-badge">
                   <i className="fas fa-box-open"></i>
                   <span>{category.products?.length || 0} sản phẩm</span>
                </div>
              </div>
            </div>
            
            <div className="category-actions">
              {permissions.categories.canEdit && (
                <button 
                  className="btn-icon btn-edit" 
                  onClick={() => navigate(`/categories/edit/${category.id}`)}
                  title="Chỉnh sửa"
                >
                  <i className="fas fa-pen"></i>
                </button>
              )}
              {permissions.categories.canDelete && (
                <button 
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(category.id)}
                  title="Xóa danh mục"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <div className="empty-state">
           <div className="empty-icon">
              <i className="fas fa-folder-open"></i>
           </div>
           <h3>Không tìm thấy danh mục nào</h3>
           <p>{searchTerm ? `Không có kết quả cho "${searchTerm}"` : 'Hãy tạo danh mục thực đơn đầu tiên!'}</p>
           {permissions.categories.canCreate && !searchTerm && (
            <button 
              className="btn-primary" 
              onClick={() => navigate('/categories/new')}
            >
              + Tạo ngay
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
