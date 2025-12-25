export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  category?: Category;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
  // Optional extensions for variants and stock
  variants?: ProductVariant[];
  modifiers?: ProductModifier[];
  stockQuantity: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  products?: Product[];
}

export interface Order {
  id: number;
  tableId?: number;
  table?: Table;
  orderDate: string;
  totalAmount: number;
  status: string;
  customerName?: string;
  notes?: string;
  orderItems?: OrderItem[];
  
  // ✅ NEW: Order type and grouping
  orderType?: 'DineIn' | 'Takeaway' | 'Delivery';
  parentOrderId?: number | null;
  orderGroupId?: number | null;
  
  paymentMethod?: 'CASH' | 'QR' | 'CARD';
}

export interface OrderItem {
  id: number;
  orderId: number;
  order?: Order;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  notes?: string;
  // Chosen variant/modifiers (optional)
  variantId?: number;
  modifierItemIds?: number[];
}

export interface Table {
  id: number;
  tableNumber: string;
  capacity: number;
  isAvailable: boolean;
  floor: string; // ✅ NEW: Floor/Area
  orders?: Order[];
  
  // ✅ NEW: Merging support
  isMerged?: boolean;
  mergedGroupId?: number | null;
  mergedTableNumbers?: string | null;
  
  // Optional features
  occupiedAt?: string; // ✅ Timestamp when table became occupied
}

// Optional: product variant and modifiers structures (frontend-only for now)
export interface ProductVariant {
  id: number;
  name: string; // e.g., "Suất nhỏ", "Suất đầy", "Combo 2 người"
  priceDelta?: number; // price adjustment from base
}

export interface ProductModifier {
  id: number;
  name: string; // e.g., "Đậu thêm", "Bún thêm", "Mắm tôm nhiều"
  items: ModifierItem[];
  maxChoice?: number; // optional selection limit
}

export interface ModifierItem {
  id: number;
  name: string;
  priceDelta?: number;
}

// Report Types
export interface RevenueReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dailyRevenue: DailyRevenue[];
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface ProductReport {
  productId: number;
  productName: string;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  orderCount: number;
}

export interface OrderStatistics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  completionRate: number;
  cancellationRate: number;
  averageOrderValue: number;
  averagePreparationTime: string;
}

export interface HourlyReport {
  hour: number;
  orderCount: number;
  revenue: number;
}

export interface WeeklyReport {
  dayOfWeek: string;
  orderCount: number;
  revenue: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  orderCount: number;
  revenue: number;
}

export interface TablePerformance {
  tableId: number;
  tableNumber: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  utilizationRate: number;
}

export interface CategoryReport {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalQuantitySold: number;
  totalRevenue: number;
  revenuePercentage: number;
}

export interface SalesSummary {
  reportDate: string;
  todayRevenue: number;
  yesterdayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  topProducts: ProductReport[];
  categoryBreakdown: CategoryReport[];
}

export interface ReportRequest {
  startDate: string;
  endDate: string;
  reportType?: string;
  categoryId?: number;
  productId?: number;
}

export interface ExportRequest {
  reportType: string;
  startDate: string;
  endDate: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}
