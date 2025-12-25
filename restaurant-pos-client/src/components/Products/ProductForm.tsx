import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { formatPriceInput, cleanPriceInput, formatCurrency } from '../../utils/priceUtils';
import { SkeletonForm } from '../Common/Skeleton';
import { uploadService } from '../../services/uploadService'; // ✅ ADD
import './ProductForm.css';

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  /* ✅ State Declarations */
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '', // ✅ Change to empty string instead of 0
    categoryId: 0,
    imageUrl: '',
    isAvailable: true,
    stockQuantity: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ✅ NEW: Unlimited stock state */
  const [isUnlimitedStock, setIsUnlimitedStock] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    // If we switch to unlimited, update form data effectively or just rely on submit handler
  }, [isUnlimitedStock]);

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
      // ✅ Check if stock is unlimited (-1)
      setIsUnlimitedStock((product.stockQuantity !== undefined && product.stockQuantity < 0));
    } catch (err) {
      setError('Không thể tải thông tin thực đơn');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submission

    setLoading(true);
    setError(null);

    /* ✅ Validate price and stock */
    const priceValue = Number(formData.price);
    let stockValue = Number(formData.stockQuantity);
    
    // If unlimited stock is checked, set stock to -1
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

    // Only validate positive stock if NOT unlimited
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
        // Enhanced error handling
        let errorMessage = 'Đã xảy ra lỗi';
        if (err.response?.data) {
            if (err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (typeof err.response.data === 'string') {
                errorMessage = err.response.data;
            } else if (err.response.data.errors) {
                 // Handle ASP.NET Core validation errors dictionary
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

    // Validate size/type
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
    <div className="product-form-container">
      <div className="form-header">
        <h2>{isEditMode ? 'Cập nhật thực đơn' : 'Thêm thực đơn mới'}</h2>
        <button onClick={() => navigate('/products')} className="btn-back">
          <i className="fas fa-arrow-left"></i> Quay lại
        </button>
      </div>

      {error && (
        <div className="error-message">
           <i className="fas fa-exclamation-circle"></i>
           <span>{error}</span>
        </div>
      )}

      <div className="form-content">
        <form onSubmit={handleSubmit} className="product-form">
          {/* LEFT PANEL: MAIN INFO */}
          <div className="form-left-panel">
            <h3 className="form-section-title"><i className="fas fa-info-circle"></i> Thông tin chung</h3>
            
            <div className="form-group">
              <label htmlFor="name">Tên thực đơn <span className="required">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nhập tên món ăn..."
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Thành phần, hương vị,..."
              />
            </div>

            <h3 className="form-section-title" style={{marginTop: '1rem'}}><i className="fas fa-tag"></i> Giá & Kho</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Giá bán (VNĐ) <span className="required">*</span></label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  value={formatPriceInput(formData.price)}
                  onChange={handleChange}
                  required
                  placeholder="0"
                  inputMode="numeric"
                />
                {formData.price && (
                  <div className="price-preview">
                    <i className="fas fa-coins"></i> {formatCurrency(formData.price)}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="categoryId">Danh mục <span className="required">*</span></label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                >
                  <option value={0}>-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
                <label htmlFor="stockQuantity">Số lượng tồn kho</label>
                <div className="stock-input-group">
                    <input
                      type="number"
                      id="stockQuantity"
                      name="stockQuantity"
                      value={isUnlimitedStock ? '' : formData.stockQuantity}
                      onChange={handleChange}
                      min="0"
                      placeholder={isUnlimitedStock ? "Đang đặt là vô hạn..." : "0"}
                      disabled={isUnlimitedStock}
                    />
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="isUnlimitedStock"
                            checked={isUnlimitedStock}
                            onChange={handleChange}
                        />
                        <span>Không giới hạn</span>
                    </label>
                </div>
            </div>
          </div>

          {/* RIGHT PANEL: IMAGE & OPTIONS */}
          <div className="form-right-panel">
            <h3 className="form-section-title"><i className="fas fa-image"></i> Hình ảnh</h3>
            
            <div className="image-upload-card">
              <div className="image-preview-wrapper">
                {formData.imageUrl ? (
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="preview-image" 
                      onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Error'}
                    />
                ) : (
                    <div className="placeholder-content">
                        <i className="fas fa-camera"></i>
                        <span>Chưa có ảnh</span>
                    </div>
                )}
              </div>
              
              <div className="upload-buttons">
                  <label className="btn-select-image">
                      <i className="fas fa-upload"></i> {formData.imageUrl ? 'Thay ảnh khác' : 'Chọn ảnh'}
                      <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </label>
                  {formData.imageUrl && (
                      <button type="button" className="btn-remove-image" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} style={{borderRadius: '8px', padding: '0.75rem'}}>
                          <i className="fas fa-trash-alt"></i>
                      </button>
                  )}
              </div>

              <div className="url-input-container">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="Hoặc nhập URL ảnh..."
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1'}}
                  />
              </div>
            </div>

            <h3 className="form-section-title"><i className="fas fa-cog"></i> Thiết lập</h3>
            
            <div className="options-card">
                <label className="checkout-option">
                    <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleChange}
                    />
                    <div>
                        <div style={{fontWeight: 600, color: '#1e293b'}}>Đang kinh doanh</div>
                        <div style={{fontSize: '0.85rem', color: '#64748b'}}>Hiển thị món này trên thực đơn bán hàng</div>
                    </div>
                </label>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Đang xử lý...</>
                ) : (
                   isEditMode ? <><i className="fas fa-save"></i> Cập nhật</> : <><i className="fas fa-plus-circle"></i> Tạo món mới</>
                )}
              </button>
              <button type="button" onClick={() => navigate('/products')} className="btn-cancel">
                <i className="fas fa-times"></i> Hủy bỏ
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
