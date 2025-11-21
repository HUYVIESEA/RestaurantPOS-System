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

  if (loading) return <div className="loading">Đang tải...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="category-list-container">
      <div className="header">
        <h2>Quản lý Danh mục</h2>
        {permissions.categories.canCreate && (
          <button className="btn btn-primary" onClick={() => navigate('/categories/new')}>
            + Thêm danh mục
          </button>
        )}
      </div>

      <div className="category-grid">
        {categories.map(category => (
          <div key={category.id} className="category-card">
            <div className="category-icon">📁</div>
            <div className="category-info">
              <h3>{category.name}</h3>
              <p>{category.description || 'Chưa có mô tả'}</p>
            </div>
            <div className="category-actions">
              {permissions.categories.canEdit && (
                <button 
                  className="btn btn-edit" 
                  onClick={() => navigate(`/categories/edit/${category.id}`)}
                >
                  Sửa
                </button>
              )}
              {permissions.categories.canDelete && (
                <button 
                  className="btn btn-delete"
                  onClick={() => handleDelete(category.id)}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="empty-state">
          <p>📁 Chưa có danh mục nào</p>
          {permissions.categories.canCreate && (
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/categories/new')}
            >
              + Tạo danh mục đầu tiên
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
