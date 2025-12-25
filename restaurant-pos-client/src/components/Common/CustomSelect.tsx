import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export interface Option {
    value: string | number;
    label: string;
    icon?: string; // FontAwesome class like 'fas fa-box'
}

interface CustomSelectProps {
    options: Option[];
    value: string | number | null;
    onChange: (value: any) => void;
    placeholder?: string;
    className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ 
    options, 
    value, 
    onChange, 
    placeholder = "Chọn...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Initial label logic
    const getDisplayLabel = () => {
        if (selectedOption) {
            return (
                <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    {selectedOption.icon && <i className={selectedOption.icon}></i>}
                    {selectedOption.label}
                </span>
            );
        }
        return <span style={{color: '#94a3b8'}}>{placeholder}</span>;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`custom-select-container ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <div 
                className={`custom-select-trigger ${isOpen ? 'is-open' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {getDisplayLabel()}
                <i className="fas fa-chevron-down custom-select-arrow"></i>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="custom-select-options">
                    {options.map((option) => (
                        <div 
                            key={option.value} 
                            className={`custom-option ${value === option.value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.icon && <i className={option.icon}></i>}
                            {option.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="custom-option" style={{justifyContent: 'center', color: '#94a3b8'}}>
                            Không có dữ liệu
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
