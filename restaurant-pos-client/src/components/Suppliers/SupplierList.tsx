import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import { supplierService } from '../../services/supplierService';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../Common/ConfirmDialog';
import SupplierForm from './SupplierFormModal';
import './SupplierList.css';

const SupplierList: React.FC = () => {
    const { showSuccess, showError } = useToast();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    
    // Delete dialog
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            const data = await supplierService.getAll();
            setSuppliers(data);
        } catch (err) {
            console.error('Error loading suppliers:', err);
            showError('Không thể tải danh sách nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingSupplier(null);
        setShowForm(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setShowForm(true);
    };

    const handleDeleteClick = (supplier: Supplier) => {
        setDeletingSupplier(supplier);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingSupplier) return;
        
        try {
            await supplierService.delete(deletingSupplier.id);
            setSuppliers(suppliers.filter(s => s.id !== deletingSupplier.id));
            showSuccess(`Đã xóa nhà cung cấp "${deletingSupplier.name}"`);
        } catch (err) {
            console.error('Error deleting supplier:', err);
            showError('Không thể xóa nhà cung cấp');
        } finally {
            setShowDeleteDialog(false);
            setDeletingSupplier(null);
        }
    };

    const handleToggleStatus = async (supplier: Supplier) => {
        try {
            await supplierService.toggleStatus(supplier.id);
            setSuppliers(suppliers.map(s => 
                s.id === supplier.id ? { ...s, isActive: !s.isActive } : s
            ));
            showSuccess(`Đã ${supplier.isActive ? 'vô hiệu hóa' : 'kích hoạt'} "${supplier.name}"`);
        } catch (err) {
            console.error('Error toggling status:', err);
            showError('Không thể thay đổi trạng thái');
        }
    };

    const handleFormSubmit = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            if (editingSupplier) {
                await supplierService.update(editingSupplier.id, {
                    ...supplierData,
                    id: editingSupplier.id,
                    createdAt: editingSupplier.createdAt
                } as Supplier);
                setSuppliers(suppliers.map(s => 
                    s.id === editingSupplier.id ? { ...s, ...supplierData } : s
                ));
                showSuccess(`Đã cập nhật "${supplierData.name}"`);
            } else {
                const newSupplier = await supplierService.create(supplierData);
                setSuppliers([...suppliers, newSupplier]);
                showSuccess(`Đã thêm nhà cung cấp "${supplierData.name}"`);
            }
            setShowForm(false);
            setEditingSupplier(null);
        } catch (err) {
            console.error('Error saving supplier:', err);
            showError(editingSupplier ? 'Không thể cập nhật' : 'Không thể thêm nhà cung cấp');
        }
    };

    // Filter suppliers
    const filteredSuppliers = suppliers.filter(supplier => {
        const matchesSearch = 
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            filterStatus === 'all' ||
            (filterStatus === 'active' && supplier.isActive) ||
            (filterStatus === 'inactive' && !supplier.isActive);
        
        return matchesSearch && matchesStatus;
    });

    // Stats
    const stats = {
        total: suppliers.length,
        active: suppliers.filter(s => s.isActive).length,
        inactive: suppliers.filter(s => !s.isActive).length,
    };

    if (loading) {
        return (
            <div className="supplier-loading">
                <div className="spinner"></div>
                <p>Đang tải danh sách nhà cung cấp...</p>
            </div>
        );
    }

    return (
        <div className="supplier-container">
            {/* Header */}
            <div className="supplier-header">
                <div>
                    <h1><i className="fas fa-truck"></i> Quản lý Nhà cung cấp</h1>
                    <p className="subtitle">Quản lý thông tin các nhà cung cấp nguyên liệu</p>
                </div>
                <button className="btn-add" onClick={handleCreate}>
                    <i className="fas fa-plus"></i>
                    Thêm nhà cung cấp
                </button>
            </div>

            {/* Stats */}
            <div className="supplier-stats">
                <div className="stat-card total">
                    <div className="stat-icon"><i className="fas fa-building"></i></div>
                    <div className="stat-info">
                        <span className="stat-label">Tổng số</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>
                <div className="stat-card active">
                    <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
                    <div className="stat-info">
                        <span className="stat-label">Đang hoạt động</span>
                        <span className="stat-value">{stats.active}</span>
                    </div>
                </div>
                <div className="stat-card inactive">
                    <div className="stat-icon"><i className="fas fa-pause-circle"></i></div>
                    <div className="stat-info">
                        <span className="stat-label">Ngừng hoạt động</span>
                        <span className="stat-value">{stats.inactive}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="supplier-filters">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhà cung cấp..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        Tất cả
                    </button>
                    <button 
                        className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('active')}
                    >
                        Hoạt động
                    </button>
                    <button 
                        className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('inactive')}
                    >
                        Ngừng
                    </button>
                </div>
            </div>

            {/* Supplier Table */}
            <div className="supplier-table-wrapper">
                <table className="supplier-table">
                    <thead>
                        <tr>
                            <th>Nhà cung cấp</th>
                            <th>Liên hệ</th>
                            <th>Địa chỉ</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="empty-row">
                                    <i className="fas fa-inbox"></i>
                                    <p>Không có nhà cung cấp nào</p>
                                </td>
                            </tr>
                        ) : (
                            filteredSuppliers.map(supplier => (
                                <tr key={supplier.id} className={!supplier.isActive ? 'inactive' : ''}>
                                    <td>
                                        <div className="supplier-name">
                                            <span className="name">{supplier.name}</span>
                                            {supplier.notes && (
                                                <span className="notes">{supplier.notes}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-info">
                                            {supplier.contactPerson && (
                                                <span><i className="fas fa-user"></i> {supplier.contactPerson}</span>
                                            )}
                                            {supplier.phone && (
                                                <span><i className="fas fa-phone"></i> {supplier.phone}</span>
                                            )}
                                            {supplier.email && (
                                                <span><i className="fas fa-envelope"></i> {supplier.email}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        {supplier.address ? (
                                            <span className="address">
                                                <i className="fas fa-map-marker-alt"></i> {supplier.address}
                                            </span>
                                        ) : (
                                            <span className="no-data">-</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${supplier.isActive ? 'active' : 'inactive'}`}>
                                            {supplier.isActive ? 'Hoạt động' : 'Ngừng'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn-action edit"
                                                onClick={() => handleEdit(supplier)}
                                                title="Chỉnh sửa"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                className="btn-action toggle"
                                                onClick={() => handleToggleStatus(supplier)}
                                                title={supplier.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                            >
                                                <i className={`fas fa-${supplier.isActive ? 'pause' : 'play'}`}></i>
                                            </button>
                                            <button 
                                                className="btn-action delete"
                                                onClick={() => handleDeleteClick(supplier)}
                                                title="Xóa"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Form Modal */}
            {showForm && (
                <SupplierForm
                    supplier={editingSupplier}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingSupplier(null);
                    }}
                />
            )}

            {/* Delete Confirmation */}
            {deletingSupplier && (
                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    title="Xóa nhà cung cấp"
                    message={`Bạn có chắc muốn xóa nhà cung cấp "${deletingSupplier.name}"?`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setShowDeleteDialog(false);
                        setDeletingSupplier(null);
                    }}
                    type="danger"
                />
            )}
        </div>
    );
};

export default SupplierList;
