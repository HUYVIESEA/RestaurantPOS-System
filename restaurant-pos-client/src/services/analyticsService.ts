/**
 * Analytics Service
 * Provides business insights and statistics
 */

import { orderService } from './orderService';
import { productService } from './productService';
import { tableService } from './tableService';

export interface AnalyticsData {
  // Revenue
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  revenueGrowth: number;

  // Orders
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;

  // Products
  topProducts: Array<{ name: string; quantity: number; revenue: number }>;
  lowStockProducts: Array<{ name: string; stock: number }>;

  // Tables
  tableOccupancyRate: number;
  averageTableTurnover: number;

  // Time analysis
  peakHours: Array<{ hour: number; orders: number }>;
  revenueByDay: Array<{ day: string; revenue: number }>;
}

export const analyticsService = {
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const [orders, products, tables] = await Promise.all([
      orderService.getAll(),
        productService.getAll(),
  tableService.getAll()
  ]);

      // Calculate revenue
      const completedOrders = orders.filter(o => o.status === 'Completed');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = completedOrders.filter(o => new Date(o.orderDate) >= today);
      const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      const weekAgo = new Date(today);
 weekAgo.setDate(weekAgo.getDate() - 7);
      const weekOrders = completedOrders.filter(o => new Date(o.orderDate) >= weekAgo);
      const weekRevenue = weekOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthOrders = completedOrders.filter(o => new Date(o.orderDate) >= monthAgo);
      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      // Calculate growth
  const lastWeekRevenue = completedOrders
    .filter(o => {
          const date = new Date(o.orderDate);
  const twoWeeksAgo = new Date(weekAgo);
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
          return date >= twoWeeksAgo && date < weekAgo;
        })
.reduce((sum, o) => sum + o.totalAmount, 0);

      const revenueGrowth = lastWeekRevenue > 0 
        ? ((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 
        : 0;

      // Top products
      const productSales = new Map<number, { name: string; quantity: number; revenue: number }>();
      
completedOrders.forEach(order => {
order.items?.forEach((item: any) => {
          const existing = productSales.get(item.productId) || { name: item.product?.name || 'Unknown', quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
 existing.revenue += item.price * item.quantity;
          productSales.set(item.productId, existing);
        });
      });

   const topProducts = Array.from(productSales.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Peak hours
  const hourlyOrders = new Map<number, number>();
   completedOrders.forEach(order => {
  const hour = new Date(order.orderDate).getHours();
        hourlyOrders.set(hour, (hourlyOrders.get(hour) || 0) + 1);
      });

      const peakHours = Array.from(hourlyOrders.entries())
        .map(([hour, orders]) => ({ hour, orders }))
  .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

      // Revenue by day (last 7 days)
const revenueByDay = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

const dayRevenue = completedOrders
      .filter(o => {
 const orderDate = new Date(o.orderDate);
   return orderDate >= dayStart && orderDate <= dayEnd;
          })
   .reduce((sum, o) => sum + o.totalAmount, 0);

     revenueByDay.push({
          day: date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
 revenue: dayRevenue
        });
      }

      // Table occupancy
      const occupiedTables = tables.filter(t => !t.isAvailable).length;
      const tableOccupancyRate = tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0;

      return {
        totalRevenue,
        todayRevenue,
        weekRevenue,
     monthRevenue,
        revenueGrowth,
      totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'Pending').length,
  completedOrders: completedOrders.length,
        cancelledOrders: orders.filter(o => o.status === 'Cancelled').length,
      averageOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
        topProducts,
        lowStockProducts: [],
        tableOccupancyRate,
        averageTableTurnover: completedOrders.length / tables.length,
        peakHours,
        revenueByDay
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
};
