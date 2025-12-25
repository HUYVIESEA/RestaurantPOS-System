import React, { useState, useEffect } from 'react';
import { Supplier } from '../../types';
import './SupplierFormModal.css';

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
        <div className="supplier-form-overlay" onClick={onCancel}>
            <div className="supplier-form-modal" onClick={e => e.stopPropagation()}>
                <div className="form-header">
                    <h2>
                        <i className={`fas fa-${supplier ? 'edit' : 'plus-circle'}`}></i>
                        {supplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
                    </h2>
                    <button className="btn-close" onClick={onCancel}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-body">
                        <div className="form-group">
                            <label htmlFor="name">
                                Tên nhà cung cấp <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="VD: Công ty TNHH ABC"
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="contactPerson">Người liên hệ</label>
                                <input
                                    type="text"
                                    id="contactPerson"
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    placeholder="VD: Nguyễn Văn A"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phone">Số điện thoại</label>
                                <input
                                    type="text"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="VD: 0901234567"
                                    className={errors.phone ? 'error' : ''}
                                />
                                {errors.phone && <span className="error-text">{errors.phone}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="VD: contact@abc.com"
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Địa chỉ</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Ghi chú</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Ghi chú thêm về nhà cung cấp..."
                                rows={3}
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                />
                                <span className="checkmark"></span>
                                Đang hoạt động
                            </label>
                        </div>
                    </div>

                    <div className="form-footer">
                        <button type="button" className="btn-cancel" onClick={onCancel}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className="btn-submit">
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
