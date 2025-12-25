import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Product, Category } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/priceUtils';
import { SkeletonGrid } from '../Common/Skeleton';
import CustomSelect from '../Common/CustomSelect'; 
import './InventoryList.css';

const InventoryList: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');
  
  // Modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editQuantity, setEditQuantity] = useState<string>('');

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
      showError('Không thể tải dữ liệu kho');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (product: Product, newStock: number) => {
    try {
       await productService.update(product.id, { ...product, stockQuantity: newStock });
       // Update local state
       setProducts(products.map(p => p.id === product.id ? { ...p, stockQuantity: newStock } : p));
       showSuccess(`Đã cập nhật tồn kho cho ${product.name}`);
    } catch (err) {
        showError('Lỗi cập nhật tồn kho');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi kho?')) return;
    try {
        await productService.delete(id);
        setProducts(products.filter(p => p.id !== id));
        showSuccess('Đã xóa sản phẩm');
    } catch (err) {
        showError('Không thể xóa sản phẩm');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditQuantity(String(product.stockQuantity || 0));
  };

  const saveQuantity = () => {
    if (!editingProduct) return;
    const stock = parseInt(editQuantity);
    if (!isNaN(stock)) {
        handleUpdateStock(editingProduct, stock);
        setEditingProduct(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    
    let matchesStatus = true;
    if (filterStatus === 'low') matchesStatus = (product.stockQuantity || 0) < 10 && (product.stockQuantity || 0) > 0;
    if (filterStatus === 'out') matchesStatus = (product.stockQuantity || 0) <= 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => (p.stockQuantity || 0) < 10 && (p.stockQuantity || 0) > 0).length;
  const outStockCount = products.filter(p => (p.stockQuantity || 0) <= 0).length;

  // Custom Select Options
  const statusOptions = [
      { value: 'all', label: 'Tất cả trạng thái', icon: 'fas fa-list' },
      { value: 'low', label: 'Sắp hết hàng (<10)', icon: 'fas fa-exclamation-triangle' },
      { value: 'out', label: 'Đã hết hàng', icon: 'fas fa-times-circle' }
  ];

  const categoryOptions = [
      { value: 0, label: 'Tất cả danh mục', icon: 'fas fa-tags' }, 
      ...categories.map(c => ({ value: c.id, label: c.name, icon: 'fas fa-utensils' }))
  ];

  const handleCategoryChange = (val: number) => {
      setSelectedCategory(val === 0 ? null : val);
  };

  if (loading) return <div className="inventory-container"><SkeletonGrid items={5} columns={1} /></div>;

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <div className="inventory-header-left">
            <div>
                <h2><i className="fas fa-warehouse"></i> Quản Lý Kho</h2>
                <p style={{margin: '0.5rem 0 0', opacity: 0.9, fontSize: '0.95rem'}}>Theo dõi và điều chỉnh số lượng tồn kho</p>
            </div>
            <button className="btn-add-new" onClick={() => navigate('/products/new')}>
                <i className="fas fa-plus"></i> Thêm sản phẩm
            </button>
        </div>
        <div className="stats-summary">
            <div className="stat-card total">
                <span className="label"><i className="fas fa-box"></i> Tổng SP</span>
                <span className="value">{totalProducts}</span>
            </div>
            <div className="stat-card low">
                <span className="label"><i className="fas fa-exclamation-triangle"></i> Sắp hết</span>
                <span className="value">{lowStockCount}</span>
            </div>
            <div className="stat-card out">
                <span className="label"><i className="fas fa-times-circle"></i> Hết hàng</span>
                <span className="value">{outStockCount}</span>
            </div>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
                type="text" 
                placeholder="Tìm kiếm sản phẩm theo tên..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="filters">
            <CustomSelect 
                options={statusOptions}
                value={filterStatus}
                onChange={(val) => setFilterStatus(val)}
                placeholder="Trạng thái"
            />

            <CustomSelect 
                options={categoryOptions}
                value={selectedCategory || 0}
                onChange={(val) => handleCategoryChange(Number(val))}
                placeholder="Danh mục"
            />
        </div>
      </div>

      <div className="inventory-table-wrapper">
        <table className="inventory-table">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá niêm yết</th>
                    <th style={{textAlign: 'center'}}>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th style={{textAlign: 'right'}}>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {filteredProducts.map(product => (
                    <tr key={product.id}>
                        <td className="product-col">
                            {product.imageUrl ? (
                                <img src={product.imageUrl} alt="" />
                            ) : (
                                <div style={{width: 48, height: 48, background: '#f1f5f9', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1'}}>
                                    <i className="fas fa-image"></i>
                                </div>
                            )}
                            <div>
                                <div style={{fontSize: '0.95rem'}}>{product.name}</div>
                                <div style={{fontSize: '0.8rem', color: '#64748b', fontWeight: 400}}>ID: #{product.id}</div>
                            </div>
                        </td>
                        <td>
                            <span style={{background: '#f1f5f9', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: '0.85rem', color: '#475569', fontWeight: 600}}>
                                {product.category?.name || 'Không có'}
                            </span>
                        </td>
                        <td style={{fontWeight: 600, color: '#0060C0'}}>{formatCurrency(product.price)}</td>
                        <td style={{textAlign: 'center'}}>
                            <span className="stock-value">{product.stockQuantity || 0}</span>
                        </td>
                        <td>
                                    {(product.stockQuantity || 0) < 0 ? (
                                        <span className="badge unlimited"><i className="fas fa-infinity" style={{fontSize: '0.7em'}}></i> Vô hạn</span>
                                    ) : (product.stockQuantity || 0) <= 0 ? (
                                        <span className="badge out">Hết hàng</span>
                                    ) : (product.stockQuantity || 0) < 10 ? (
                                        <span className="badge low">Sắp hết</span>
                                    ) : (
                                        <span className="badge ok">Còn hàng</span>
                                    )}
                        </td>
                        <td>
                            <div className="row-actions" style={{justifyContent: 'flex-end'}}>
                                <button 
                                    className="btn-update-stock"
                                    onClick={() => openEditModal(product)}
                                    title="Cập nhật số lượng"
                                >
                                    <i className="fas fa-pen"></i> Sửa kho
                                </button>
                                <button 
                                    className="btn-icon edit" 
                                    onClick={() => navigate(`/products/edit/${product.id}`)}
                                    title="Sửa thông tin chi tiết"
                                >
                                    <i className="fas fa-cog"></i>
                                </button>
                                <button 
                                    className="btn-icon delete" 
                                    onClick={() => handleDeleteProduct(product.id)}
                                    title="Xóa sản phẩm"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filteredProducts.length === 0 && (
            <div className="empty-state">
                <i className="fas fa-search" style={{fontSize: '3rem', marginBottom: '1rem', color: '#cbd5e1', display: 'block'}}></i>
                <p>Không tìm thấy sản phẩm nào phù hợp</p>
                <button 
                    className="btn-add-new" 
                    style={{margin: '1rem auto', background: '#0060C0', color: 'white', display: 'inline-flex'}}
                    onClick={() => { setSearchTerm(''); setFilterStatus('all'); setSelectedCategory(null); }}
                >
                    Xóa bộ lọc
                </button>
            </div>
        )}
      </div>

      {editingProduct && (
        <div className="quantity-modal-overlay" onClick={() => setEditingProduct(null)}>
            <div className="quantity-modal" onClick={e => e.stopPropagation()}>
                <h3><i className="fas fa-boxes" style={{color: '#0060C0', marginRight: '0.5rem'}}></i> Cập nhật kho</h3>
                <p style={{marginBottom: '1rem', color: '#64748b'}}>
                    Sản phẩm: <strong style={{color: '#1e293b'}}>{editingProduct.name}</strong>
                </p>
                
                <div style={{marginBottom: '1rem'}}>
                    <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem'}}>Số lượng mới</label>
                    <input 
                        type="number" 
                        value={editQuantity} 
                        onChange={e => setEditQuantity(e.target.value)}
                        autoFocus
                        placeholder="Nhập số lượng..."
                    />
                    <span className="hint"><i className="fas fa-info-circle"></i> Nhập -1 để thiết lập kho <strong>không giới hạn</strong></span>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => setEditingProduct(null)}>Đóng</button>
                    <button className="btn-confirm" onClick={saveQuantity}>Lưu thay đổi</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
export default InventoryList;
