import React, { useState, useRef, useEffect } from 'react';

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
                <span className="flex items-center gap-2">
                    {selectedOption.icon && <i className={`${selectedOption.icon} text-gray-500 dark:text-gray-400`}></i>}
                    <span className="text-gray-800 dark:text-white">{selectedOption.label}</span>
                </span>
            );
        }
        return <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>;
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
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <div 
                className={`flex items-center justify-between w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-lg cursor-pointer transition-all duration-200 hover:border-orange-500 hover:ring-2 hover:ring-orange-500/20 ${isOpen ? 'border-orange-500 ring-2 ring-orange-500/20 dark:border-orange-500' : 'border-gray-300 dark:border-gray-700'}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {getDisplayLabel()}
                <i className={`fas fa-chevron-down text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
            </div>

            {/* Dropdown Options */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto overflow-x-hidden">
                    {options.map((option) => (
                        <div 
                            key={option.value} 
                            className={`flex items-center px-4 py-3 cursor-pointer transition-colors duration-150 gap-3 hover:bg-orange-50 dark:hover:bg-gray-700 ${value === option.value ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-500 font-medium' : 'text-gray-700 dark:text-gray-200'}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.icon && <i className={`${option.icon} ${value === option.value ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}></i>}
                            {option.label}
                        </div>
                    ))}
                    {options.length === 0 && (
                        <div className="flex items-center justify-center px-4 py-3 text-gray-400 dark:text-gray-500">
                            Không có dữ liệu
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
