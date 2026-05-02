import React, { useState } from 'react';
import Analytics from '../Analytics/Analytics';
import Reports from './Reports';

const Statistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports'>('analytics');

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-4 md:p-8 space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-2">
          <i className="fas fa-chart-simple text-blue-600"></i> Thống kê & Báo cáo
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Theo dõi hiệu quả kinh doanh và xuất báo cáo chi tiết</p>
      </div>

      <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-700 w-full md:w-auto overflow-x-auto space-x-2">
        <button 
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'analytics' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-pie"></i> Tổng quan & Phân tích
        </button>
        <button 
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'reports' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-file-alt"></i> Báo cáo chi tiết
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'analytics' ? (
          <div className="animate-in fade-in duration-300">
            <Analytics />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <Reports />
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
