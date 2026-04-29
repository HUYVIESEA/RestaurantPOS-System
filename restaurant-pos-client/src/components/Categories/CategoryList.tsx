import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';
import { Category } from '../../types';
import { usePermissions } from '../../hooks/usePermissions';
import { useToast } from '../../contexts/ToastContext';
import { CATEGORY_MESSAGES, COMMON_MESSAGES } from '../../constants/messages';
const CategoryList: React.FC = () => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      showError(CATEGORY_MESSAGES.LOAD_ERROR);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(COMMON_MESSAGES.CONFIRM_DELETE('danh mục', name))) {
      try {
        await categoryService.delete(id);
        setCategories(categories.filter(c => c.id !== id));
        showSuccess(CATEGORY_MESSAGES.DELETE_SUCCESS);
      } catch (err) {
        showError(CATEGORY_MESSAGES.DELETE_ERROR);
        console.error('Error deleting category:', err);
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400"><p>Đang tải...</p></div>;

  return (
    <div className="w-full p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">QUẢN LÝ DANH MỤC</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Tổ chức và quản lý các nhóm thực đơn của nhà hàng</p>
<div className="flex gap-3 flex-wrap">
              <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                 <span>Tổng danh mục</span>
                 <span className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-md">{categories.length}</span>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                 <span>Đang hoạt động</span>
                 <span className="bg-green-100 dark:bg-green-800 px-2 py-0.5 rounded-md">{categories.filter(c => c.id > 0).length}</span>
              </div>
           </div>
        </div>
        
        {permissions.categories.canCreate && (
            <button className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2" onClick={() => navigate('/categories/new')}>
              <i className="fas fa-circle-plus"></i> THÊM DANH MỤC
            </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 mb-6 transition-colors">
         <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Tìm kiếm danh mục..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 dark:text-white transition-all outline-none"
            />
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map(category => (
          <div key={category.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 dark:border-slate-700 group">
            <div className="h-2 bg-blue-600"></div>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                   <i className="fas fa-utensils text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate" title={category.name}>{category.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 min-h-[40px]">{category.description || 'Chưa có mô tả'}</p>
                  
<div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 w-fit px-3 py-1.5 rounded-lg">
                      <i className="fas fa-box-open text-gray-400"></i>
                      <span className="font-medium">Sẵn sàng</span>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 bg-gray-50 dark:bg-slate-700/30 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {permissions.categories.canEdit && (
                <button 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-700 hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-blue-900/30 transition-colors" 
                  onClick={() => navigate(`/categories/edit/${category.id}`)}
                  title="Chỉnh sửa"
                >
                  <i className="fas fa-pen-to-square"></i>
                </button>
              )}
              {permissions.categories.canDelete && (
                <button 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                  onClick={() => handleDelete(category.id, category.name)}
                  title="Xóa danh mục"
                >
                  <i className="fas fa-trash-can"></i>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredCategories.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
           <div className="w-20 h-20 bg-gray-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-layer-group-open text-3xl text-gray-400 dark:text-gray-500"></i>
           </div>
           <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Không tìm thấy danh mục nào</h3>
           <p className="text-gray-500 dark:text-gray-400 mb-6">{searchTerm ? `Không có kết quả cho "${searchTerm}"` : 'Hãy tạo danh mục thực đơn đầu tiên!'}</p>
           {permissions.categories.canCreate && !searchTerm && (
            <button 
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm inline-flex items-center gap-2" 
              onClick={() => navigate('/categories/new')}
            >
              <i className="fas fa-plus-circle"></i> Tạo ngay
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
