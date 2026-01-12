import api from './api';

export interface BigDataStoreRevenue {
  storeId: string;
  totalRevenue: number;
}

export interface BigDataProductSales {
  productName: string;
  totalSold: number;
}

export interface BigDataMonthlyRevenue {
  year: number;
  month: number;
  monthlySales: number;
}

const bigDataService = {
  getTopStores: async (): Promise<BigDataStoreRevenue[]> => {
    const response = await api.get<BigDataStoreRevenue[]>('/BigData/top-stores');
    return response.data;
  },

  getBestSellers: async (): Promise<BigDataProductSales[]> => {
    const response = await api.get<BigDataProductSales[]>('/BigData/best-sellers');
    return response.data;
  },

  getMonthlyTrends: async (): Promise<BigDataMonthlyRevenue[]> => {
    const response = await api.get<BigDataMonthlyRevenue[]>('/BigData/monthly-trends');
    return response.data;
  }
};

export default bigDataService;
