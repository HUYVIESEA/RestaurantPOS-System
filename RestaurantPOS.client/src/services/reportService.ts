import api from './api';
import {
  RevenueReport,
  DailyRevenue,
  MonthlyReport,
  ProductReport,
  OrderStatistics,
  HourlyReport,
  WeeklyReport,
  TablePerformance,
  CategoryReport,
  SalesSummary,
  ExportRequest
} from '../types';

const reportService = {
  // Revenue Reports
  getRevenueReport: async (startDate: string, endDate: string): Promise<RevenueReport> => {
    const response = await api.get('/reports/revenue', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getDailyRevenue: async (startDate: string, endDate: string): Promise<DailyRevenue[]> => {
    const response = await api.get('/reports/revenue/daily', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getMonthlyRevenue: async (year: number): Promise<MonthlyReport[]> => {
    const response = await api.get('/reports/revenue/monthly', {
      params: { year }
    });
    return response.data;
  },

  // Product Reports
  getTopSellingProducts: async (
    startDate: string,
    endDate: string,
    topCount: number = 10
  ): Promise<ProductReport[]> => {
    const response = await api.get('/reports/products/top-selling', {
      params: { startDate, endDate, topCount }
    });
    return response.data;
  },

  getProductPerformance: async (startDate: string, endDate: string): Promise<ProductReport[]> => {
    const response = await api.get('/reports/products/performance', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getProductReport: async (
    productId: number,
    startDate: string,
    endDate: string
  ): Promise<ProductReport> => {
    const response = await api.get(`/reports/products/${productId}`, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Order Statistics
  getOrderStatistics: async (startDate: string, endDate: string): Promise<OrderStatistics> => {
    const response = await api.get('/reports/orders/statistics', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getHourlyOrders: async (date: string): Promise<HourlyReport[]> => {
    const response = await api.get('/reports/orders/hourly', {
      params: { date }
    });
    return response.data;
  },

  getWeeklyOrders: async (startDate: string): Promise<WeeklyReport[]> => {
    const response = await api.get('/reports/orders/weekly', {
      params: { startDate }
    });
    return response.data;
  },

  // Table Reports
  getTablePerformance: async (startDate: string, endDate: string): Promise<TablePerformance[]> => {
    const response = await api.get('/reports/tables/performance', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Category Reports
  getCategoryReport: async (startDate: string, endDate: string): Promise<CategoryReport[]> => {
    const response = await api.get('/reports/categories', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Sales Summary
  getSalesSummary: async (): Promise<SalesSummary> => {
    const response = await api.get('/reports/summary');
    return response.data;
  },

  // Export Functions
  exportToPdf: async (request: ExportRequest): Promise<Blob> => {
    const response = await api.post('/reports/export/pdf', request, {
      responseType: 'blob'
    });
    return response.data;
  },

  exportToExcel: async (request: ExportRequest): Promise<Blob> => {
    const response = await api.post('/reports/export/excel', request, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default reportService;
