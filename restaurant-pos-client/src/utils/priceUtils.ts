/**
 * Price Formatting Utilities for Restaurant POS
 * Handles Vietnamese currency formatting (VND)
 */

/**
 * Format number to Vietnamese currency display
 * @param value - Number or string to format
 * @param includeSymbol - Whether to include '₫' symbol
 * @returns Formatted price string (e.g., "50.000 ₫")
 */
export const formatPrice = (value: number | string, includeSymbol: boolean = false): string => {
  if (value === '' || value === null || value === undefined) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  const formatted = numValue.toLocaleString('vi-VN');
  return includeSymbol ? `${formatted} ₫` : formatted;
};

/**
 * Format price for display in tables/lists
 * Always includes currency symbol
 */
export const formatCurrency = (value: number | string): string => {
  return formatPrice(value, true);
};

/**
 * Parse formatted price string back to number
 * Removes commas, dots, and currency symbols
 * @param value - Formatted price string
 * @returns Parsed number
 */
export const parsePrice = (value: string): number => {
  if (!value) return 0;
  
  // Remove all non-numeric characters except decimal point
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
};

/**
 * Handle price input change
 * Strips formatting for state storage
 * @param value - Input value
 * @returns Clean numeric string
 */
export const cleanPriceInput = (value: string): string => {
  // Remove all non-numeric characters
  const cleaned = value.replace(/[^\d]/g, '');
  return cleaned;
};

/**
 * Validate price input
 * @param value - Price value to validate
 * @param min - Minimum allowed value (default 0)
 * @param max - Maximum allowed value (optional)
 * @returns Validation result
 */
export const validatePrice = (
  value: number | string,
  min: number = 0,
  max?: number
): { isValid: boolean; message?: string } => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return { isValid: false, message: 'Giá không hợp lệ' };
  }
  
  if (numValue < min) {
  return { isValid: false, message: `Giá phải lớn hơn hoặc bằng ${formatCurrency(min)}` };
  }
  
  if (max !== undefined && numValue > max) {
    return { isValid: false, message: `Giá không được vượt quá ${formatCurrency(max)}` };
  }
  
  return { isValid: true };
};

/**
 * Format price for input fields (no symbol, with separators)
 * Used in controlled inputs
 */
export const formatPriceInput = (value: string | number): string => {
  if (!value) return '';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  return numValue.toLocaleString('vi-VN');
};

/**
 * Calculate discount
 * @param originalPrice - Original price
 * @param discountPercent - Discount percentage (0-100)
 * @returns Discounted price
 */
export const calculateDiscount = (
  originalPrice: number,
  discountPercent: number
): number => {
  return originalPrice * (1 - discountPercent / 100);
};

/**
 * Calculate total from items
 * @param items - Array of items with price and quantity
 * @returns Total amount
 */
export const calculateTotal = (
  items: Array<{ price: number; quantity: number }>
): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

/**
 * Format compact price for mobile display
 * Shows 'K' for thousands, 'M' for millions
 * @param value - Price value
 * @returns Compact formatted string (e.g., "50K", "1.5M")
 */
export const formatCompactPrice = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace('.0', '')}M ₫`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K ₫`;
  }
  return formatCurrency(value);
};

/**
 * Price input handler for React components
 * Returns cleaned value for state
 */
export const handlePriceChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  callback: (value: string) => void
): void => {
  const value = e.target.value.replace(/[^\d]/g, '');
  callback(value);
};

// Export default object with all utilities
export default {
  formatPrice,
  formatCurrency,
  parsePrice,
  cleanPriceInput,
  validatePrice,
  formatPriceInput,
  calculateDiscount,
  calculateTotal,
  formatCompactPrice,
  handlePriceChange
};
