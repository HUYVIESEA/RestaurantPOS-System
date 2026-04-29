import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';

interface SupplierFormProps {
    supplier: Supplier | null;
    onSubmit: (data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ supplier, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        contactPerson: '',
        notes: '',
        isActive: true,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name,
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || '',
                contactPerson: supplier.contactPerson || '',
                notes: supplier.notes || '',
                isActive: supplier.isActive,
            });
        }
    }, [supplier]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên nhà cung cấp';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (formData.phone && !/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onCancel}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl my-8 overflow-hidden border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <i className={`fas fa-${supplier ? 'edit text-blue-600' : 'plus-circle text-blue-600'}`}></i>
                        {supplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                    </h2>
                    <button className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" onClick={onCancel}>
                        <i className="fas fa-xmark"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-5 max-h-[calc(100vh-16rem)] overflow-y-auto custom-scrollbar">
                        <div>
                            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Tên nhà cung cấp <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="VD: Công ty TNHH ABC"
                                className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all dark:text-white ${errors.name ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 dark:border-red-800' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600 focus:border-transparent'}`}
                            />
                            {errors.name && <span className="text-sm text-red-500 mt-1.5 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i> {errors.name}</span>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="contactPerson" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Người liên hệ</label>
                                <input
                                    type="text"
                                    id="contactPerson"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    placeholder="VD: Nguyễn Văn A"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:text-white transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Số điện thoại</label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="VD: 0901234567"
                                    className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all dark:text-white ${errors.phone ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 dark:border-red-800' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600 focus:border-transparent'}`}
                                />
                                {errors.phone && <span className="text-sm text-red-500 mt-1.5 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i> {errors.phone}</span>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="VD: contact@abc.com"
                                className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 transition-all dark:text-white ${errors.email ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 dark:border-red-800' : 'border-slate-300 dark:border-slate-600 focus:ring-blue-600 focus:border-transparent'}`}
                            />
                            {errors.email && <span className="text-sm text-red-500 mt-1.5 flex items-center gap-1"><i className="fas fa-exclamation-circle"></i> {errors.email}</span>}
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Địa chỉ</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:text-white transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Ghi chú</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Ghi chú thêm về nhà cung cấp..."
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent dark:text-white transition-all resize-none"
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="w-5 h-5 appearance-none border-2 border-slate-300 dark:border-slate-500 rounded-md checked:bg-blue-700 checked:border-transparent outline-none transition-colors cursor-pointer group-hover:border-blue-500"
                                    />
                                    {formData.isActive && (
                                        <i className="fas fa-check text-white text-xs absolute pointer-events-none"></i>
                                    )}
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-300 select-none">Đang hoạt động</span>
                            </label>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" onClick={onCancel}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="px-5 py-2.5 rounded-xl font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors shadow-sm flex items-center gap-2">
                            <i className="fas fa-save"></i>
                            {supplier ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierForm;
