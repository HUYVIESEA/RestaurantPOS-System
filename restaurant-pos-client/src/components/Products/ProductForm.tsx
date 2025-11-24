import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { formatPriceInput, cleanPriceInput, formatCurrency } from '../../utils/priceUtils';
import { SkeletonForm, LoadingOverlay } from '../Common/Skeleton'; // ✅ ADD
import './ProductForm.css';

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '', // ✅ Change to empty string instead of 0
    categoryId: 0,
    imageUrl: '',
    isAvailable: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        price: product.price.toString(), // ✅ Convert to string
        categoryId: product.categoryId,
        imageUrl: product.imageUrl || '',
        isAvailable: product.isAvailable,
      });
    } catch (err) {
      setError('Không thể tải thông tin thực đơn');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ✅ Validate price
    const priceValue = Number(formData.price);
    if (isNaN(priceValue) || priceValue < 0) {
      setError('Giá thực đơn không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      const productData: Partial<Product> = {
        ...formData,
        price: priceValue, // ✅ Convert to number
        id: isEditMode ? Number(id) : 0,
      };

      if (isEditMode) {
        await productService.update(Number(id), productData as Product);
      } else {
        await productService.create(productData as Product);
      }

      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'price') {
      // ✅ Use price utility for clean input
      const cleanedPrice = cleanPriceInput(value);
      setFormData(prev => ({ ...prev, [name]: cleanedPrice }));
    } else if (name === 'categoryId') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h2>{isEditMode ? 'Cập nhật thực đơn' : 'Thêm thực đơn mới'}</h2>
        <button onClick={() => navigate('/products')} className="btn-back">
          ← Quay lại
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Tên thực đơn *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Nhập tên thực đơn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Nhập mô tả thực đơn"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Giá (VNĐ) *</label>
            <input
              type="text"
              id="price"
              name="price"
              value={formatPriceInput(formData.price)} // ✅ Format for display
              onChange={handleChange}
              required
              placeholder="0"
              inputMode="numeric"
            />
            {formData.price && (
              <small className="price-preview">
                💰 {formatCurrency(formData.price)} {/* ✅ Use utility */}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Danh mục *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            >
              <option value={0}>Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="imageUrl">URL hình ảnh</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
            />
            <span>Còn hàng</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/products')} className="btn-cancel">
            Hủy
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>

      {(loading && <LoadingOverlay />) /* ✅ Show loading overlay */}
      {/* ✅ Show skeleton form when loading categories or product */}
      {(!categories.length && !isEditMode) && <SkeletonForm />}
    </div>
  );
};

export default ProductForm;
