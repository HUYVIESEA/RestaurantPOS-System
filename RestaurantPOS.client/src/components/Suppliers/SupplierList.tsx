import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import { supplierService } from '../../services/supplierService';
import { useToast } from '../../contexts/ToastContext';
import ConfirmDialog from '../Common/ConfirmDialog';
import SupplierForm from './SupplierFormModal';

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
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium">Đang tải danh sách nhà cung cấp...</p>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold"><i className="fas fa-truck-loading mr-2 text-blue-700 dark:text-blue-500"></i> Quản lý Nhà cung cấp</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý thông tin các nhà cung cấp nguyên liệu</p>
                </div>
                <button className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-5 py-2.5 rounded-xl shadow-sm transition-colors flex items-center gap-2" onClick={handleCreate}>
                    <i className="fas fa-plus-circle"></i>
                    Thêm nhà cung cấp
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500 text-2xl shrink-0"><i className="fas fa-building"></i></div>
                    <div>
                        <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">Tổng số</span>
                        <span className="block text-2xl font-bold">{stats.total}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500 text-2xl shrink-0"><i className="fas fa-circle-check"></i></div>
                    <div>
                        <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">Đang hoạt động</span>
                        <span className="block text-2xl font-bold">{stats.active}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 text-2xl shrink-0"><i className="fas fa-pause-circle"></i></div>
                    <div>
                        <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">Ngừng hoạt động</span>
                        <span className="block text-2xl font-bold">{stats.inactive}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm nhà cung cấp..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:text-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        Tất cả
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'active' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        onClick={() => setFilterStatus('active')}
                    >
                        Hoạt động
                    </button>
                    <button 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'inactive' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        onClick={() => setFilterStatus('inactive')}
                    >
                        Ngừng
                    </button>
                </div>
            </div>

            {/* Supplier Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nhà cung cấp</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Liên hệ</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Địa chỉ</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <i className="fas fa-inbox text-4xl mb-3 opacity-50 block"></i>
                                        <p>Không có nhà cung cấp nào</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map(supplier => (
                                    <tr key={supplier.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!supplier.isActive ? 'opacity-70 bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{supplier.name}</span>
                                                {supplier.notes && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block max-w-xs truncate">{supplier.notes}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                                                {supplier.contactPerson && (
                                                    <span className="flex items-center gap-2"><i className="fas fa-user w-4 text-slate-400"></i> {supplier.contactPerson}</span>
                                                )}
                                                {supplier.phone && (
                                                    <span className="flex items-center gap-2"><i className="fas fa-phone w-4 text-slate-400"></i> {supplier.phone}</span>
                                                )}
                                                {supplier.email && (
                                                    <span className="flex items-center gap-2"><i className="fas fa-envelope w-4 text-slate-400"></i> {supplier.email}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {supplier.address ? (
                                                <span className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                                    <i className="fas fa-map-marker-alt w-4 mt-0.5 text-slate-400"></i> <span className="max-w-[200px] line-clamp-2">{supplier.address}</span>
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${supplier.isActive ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-500 dark:border-blue-900/50' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                                                {supplier.isActive ? 'Hoạt động' : 'Ngừng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end items-center gap-2">
                                                <button 
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-500 dark:hover:bg-blue-900/40 transition-colors"
                                                    onClick={() => handleEdit(supplier)}
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="fas fa-pen-to-square"></i>
                                                </button>
                                                <button 
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${supplier.isActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40' : 'text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-500 dark:hover:bg-blue-900/40'}`}
                                                    onClick={() => handleToggleStatus(supplier)}
                                                    title={supplier.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                >
                                                    <i className={`fas fa-${supplier.isActive ? 'pause' : 'play'}`}></i>
                                                </button>
                                                <button 
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors"
                                                    onClick={() => handleDeleteClick(supplier)}
                                                    title="Xóa"
                                                >
                                                    <i className="fas fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
