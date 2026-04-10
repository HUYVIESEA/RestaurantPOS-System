import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { formatPriceInput, cleanPriceInput, formatCurrency } from '../../utils/priceUtils';
import { SkeletonForm } from '../Common/Skeleton';
import { uploadService } from '../../services/uploadService';

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: 0,
    imageUrl: '',
    isAvailable: true,
    stockQuantity: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      if (!isEditMode && data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (err) {
      setError('Không thể tải danh mục');
    }
  };

  const fetchProduct = async () => {
    try {
      const product = await productService.getById(Number(id));
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || '',
        isAvailable: product.isAvailable,
        stockQuantity: product.stockQuantity || 0,
      });
      setIsUnlimitedStock((product.stockQuantity !== undefined && product.stockQuantity < 0));
    } catch (err) {
      setError('Không thể tải thông tin thực đơn');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    const priceValue = Number(formData.price);
    let stockValue = Number(formData.stockQuantity);
    
    if (isUnlimitedStock) {
        stockValue = -1;
    }

    if (isNaN(priceValue) || priceValue < 0) {
      setError('Giá thực đơn không hợp lệ');
      setLoading(false);
      return;
    }

    if (priceValue > 100000000000) {
        setError('Giá thực đơn quá lớn (tối đa 100 tỷ)');
        setLoading(false);
        return;
    }

    if (!isUnlimitedStock && (isNaN(stockValue) || stockValue < 0)) {
        setError('Số lượng tồn kho không hợp lệ');
        setLoading(false);
        return;
    }

    try {
      const productData: Partial<Product> = {
        ...formData,
        price: priceValue,
        stockQuantity: stockValue,
        id: isEditMode ? Number(id) : 0,
      };

      if (isEditMode) {
        await productService.update(Number(id), productData as Product);
      } else {
        await productService.create(productData as Product);
      }

      navigate('/products');
    } catch (err: any) {
        console.error("Error submitting form:", err);
        let errorMessage = 'Đã xảy ra lỗi';
        if (err.response?.data) {
            if (err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response.data === 'string') {
                errorMessage = err.response.data;
            } else if (err.response.data.errors) {
                 const errors = err.response.data.errors;
                 const firstErrorKey = Object.keys(errors)[0];
                 if (firstErrorKey && errors[firstErrorKey].length > 0) {
                     errorMessage = `${errors[firstErrorKey][0]}`;
                 }
            } else if (err.response.data.title) {
                errorMessage = err.response.data.title;
            }
        }
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === 'isUnlimitedStock') {
          setIsUnlimitedStock(checked);
      } else {
          setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else if (name === 'price') {
      const cleanedPrice = cleanPriceInput(value);
      setFormData(prev => ({ ...prev, [name]: cleanedPrice }));
    } else if (name === 'stockQuantity') {
        const val = parseInt(value) || 0;
        setFormData(prev => ({ ...prev, [name]: val }));
    } else if (name === 'categoryId') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File quá lớn (Max 5MB)');
      return;
    }

    try {
      setLoading(true);
      const url = await uploadService.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-6 text-slate-800 dark:text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isEditMode ? 'Cập nhật thực đơn' : 'Thêm thực đơn mới'}
        </h2>
        <button onClick={() => navigate('/products')} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm">
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 border border-red-200 dark:border-red-800/50 shadow-sm">
           <i className="fas fa-exclamation-circle text-lg"></i>
           <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-700">
          {/* LEFT PANEL: MAIN INFO */}
          <div className="flex-1 p-6 md:p-8 space-y-6">
            <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <i className="fas fa-info-circle text-blue-500"></i> Thông tin chung
               </h3>
               
               <div className="space-y-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên thực đơn <span className="text-red-500 ml-1">*</span></label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Nhập tên món ăn..."
                      maxLength={100}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mô tả</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Thành phần, hương vị,..."
                      className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white resize-y"
                    />
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <i className="fas fa-tag text-blue-500"></i> Giá & Kho
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                 <div className="flex flex-col gap-1.5">
                   <label htmlFor="price" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Giá bán (VNĐ) <span className="text-red-500 ml-1">*</span></label>
                   <input
                     type="text"
                     id="price"
                     name="price"
                     value={formatPriceInput(formData.price)}
                     onChange={handleChange}
                     required
                     placeholder="0"
                     inputMode="numeric"
                     className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white font-medium"
                   />
                   {formData.price && (
                     <div className="mt-2 text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 w-max px-3 py-1 rounded-lg">
                       <i className="fas fa-coins"></i> {formatCurrency(formData.price)}
                     </div>
                   )}
                 </div>

                 <div className="flex flex-col gap-1.5">
                   <label htmlFor="categoryId" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Danh mục <span className="text-red-500 ml-1">*</span></label>
                   <select
                     id="categoryId"
                     name="categoryId"
                     value={formData.categoryId}
                     onChange={handleChange}
                     required
                     className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white font-medium appearance-none"
                   >
                     <option value={0}>-- Chọn danh mục --</option>
                     {categories.map(cat => (
                       <option key={cat.id} value={cat.id}>{cat.name}</option>
                     ))}
                   </select>
                 </div>
               </div>

               <div className="flex flex-col gap-1.5">
                   <label htmlFor="stockQuantity" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số lượng tồn kho</label>
                   <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                       <input
                         type="number"
                         id="stockQuantity"
                         name="stockQuantity"
                         value={isUnlimitedStock ? '' : formData.stockQuantity}
                         onChange={handleChange}
                         min="0"
                         placeholder={isUnlimitedStock ? "Vô hạn" : "0"}
                         disabled={isUnlimitedStock}
                         className="w-full sm:w-48 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all dark:text-white disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                       />
                       <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                           <input
                               type="checkbox"
                               name="isUnlimitedStock"
                               checked={isUnlimitedStock}
                               onChange={handleChange}
                               className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
                           />
                           <span>Không giới hạn</span>
                       </label>
                   </div>
               </div>
            </div>
          </div>

          {/* RIGHT PANEL: IMAGE & OPTIONS */}
          <div className="w-full lg:w-[400px] p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50 space-y-6 flex-shrink-0">
            <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <i className="fas fa-image text-blue-500"></i> Hình ảnh
               </h3>
               
               <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-4 shadow-sm">
                 <div className="h-48 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden relative group">
                   {formData.imageUrl ? (
                       <img 
                         src={formData.imageUrl} 
                         alt="Preview" 
                         className="w-full h-full object-cover" 
                         onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Error'}
                       />
                   ) : (
                       <div className="flex flex-col items-center gap-2 text-slate-400">
                           <i className="fas fa-camera text-3xl"></i>
                           <span className="text-sm font-medium">Chưa có ảnh</span>
                       </div>
                   )}
                 </div>
                 
                 <div className="flex gap-2">
                     <label className="flex-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium py-2.5 rounded-xl cursor-pointer transition-colors border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-2">
                         <i className="fas fa-upload"></i> {formData.imageUrl ? 'Thay ảnh' : 'Chọn ảnh'}
                         <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                     </label>
                     {formData.imageUrl && (
                         <button type="button" className="px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl transition-colors border border-red-200 dark:border-red-800" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} title="Xóa ảnh">
                             <i className="fas fa-trash-can"></i>
                         </button>
                     )}
                 </div>

                 <div>
                     <input
                       type="url"
                       className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all dark:text-white text-sm"
                       placeholder="Hoặc nhập URL ảnh..."
                       name="imageUrl"
                       value={formData.imageUrl}
                       onChange={handleChange}
                     />
                 </div>
               </div>
            </div>

            <div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <i className="fas fa-cog text-blue-500"></i> Thiết lập
               </h3>
               
               <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                   <label className="flex items-start gap-3 cursor-pointer select-none group">
                       <div className="mt-1">
                           <input
                               type="checkbox"
                               name="isAvailable"
                               checked={formData.isAvailable}
                               onChange={handleChange}
                               className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
                           />
                       </div>
                       <div>
                           <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Đang kinh doanh</div>
                           <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Hiển thị món này trên thực đơn bán hàng</div>
                       </div>
                   </label>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-3">
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-sm transition-colors flex justify-center items-center gap-2 text-lg">
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</>
                ) : (
                   isEditMode ? <><i className="fas fa-save"></i> Cập nhật món</> : <><i className="fas fa-circle-plus"></i> Tạo món mới</>
                )}
              </button>
              <button type="button" onClick={() => navigate('/products')} className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Hủy bỏ
              </button>
            </div>
          </div>
        </form>
      </div>

      {(!categories.length && !isEditMode) && <SkeletonForm />}
    </div>
  );
};

export default ProductForm;
