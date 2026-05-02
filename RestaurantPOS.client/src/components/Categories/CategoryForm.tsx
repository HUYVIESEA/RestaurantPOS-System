import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types';
const CategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
 name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const category = await categoryService.getById(Number(id));
      setFormData({
        name: category.name,
     description: category.description || '',
      });
    } catch (err) {
      setError('Không thể tải thông tin danh mục');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (formData.name.trim().length < 2) {
      setError('Tên danh mục phải có ít nhất 2 ký tự');
      setLoading(false);
      return;
    }

    if (formData.name.length > 50) {
      setError('Tên danh mục không được quá 50 ký tự');
      setLoading(false);
      return;
    }

    try {
      const categoryData: Partial<Category> = {
  name: formData.name.trim(),
      description: formData.description.trim() || undefined,
        id: isEditMode ? Number(id) : 0,
      };

      if (isEditMode) {
     await categoryService.update(Number(id), categoryData as Category);
      } else {
   await categoryService.create(categoryData as Omit<Category, 'id'>);
      }

      navigate('/categories');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
    setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <i className={`fas ${isEditMode ? 'fa-pen-to-square-to-square' : 'fa-circle-plus'} text-blue-600`}></i>
            {isEditMode ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button 
            onClick={() => navigate('/categories')} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 rounded-r-xl flex items-start gap-3">
             <i className="fas fa-circle-exclamation mt-1"></i>
             <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                maxLength={50}
                placeholder="Nhập tên danh mục (VD: Đồ ăn, Đồ uống...)"
                autoFocus
                className="w-full pl-4 pr-16 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 dark:text-white transition-all outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">
                {formData.name.length}/50
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Mô tả
            </label>
            <div className="relative">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                maxLength={200}
                placeholder="Nhập mô tả cho danh mục (tùy chọn)"
                className="w-full pl-4 pr-4 pb-8 pt-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 dark:text-white transition-all outline-none resize-none"
              />
              <span className="absolute right-4 bottom-3 text-xs text-gray-400 dark:text-gray-500">
                {formData.description.length}/200
              </span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/80 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
              <i className="fas fa-eye text-blue-600"></i> Xem trước
            </h4>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                 <i className="fas fa-utensils text-xl"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">
                  {formData.name || <span className="text-gray-400 italic">Tên danh mục</span>}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {formData.description || <span className="italic">Chưa có mô tả</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-slate-700">
            <button 
              type="button" 
              onClick={() => navigate('/categories')} 
              className="px-6 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2.5 rounded-xl font-medium text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-2"
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</>
              ) : (
                <><i className="fas fa-save"></i> {isEditMode ? 'Cập nhật' : 'Thêm mới'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
