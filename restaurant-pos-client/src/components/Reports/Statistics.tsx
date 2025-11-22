import React, { useState } from 'react';
import Analytics from '../Analytics/Analytics';
import Reports from './Reports';
import './Statistics.css';

const Statistics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports'>('analytics');

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <h1><i className="fas fa-chart-line"></i> Thống kê & Báo cáo</h1>
        <p className="statistics-subtitle">Theo dõi hiệu quả kinh doanh và xuất báo cáo chi tiết</p>
      </div>

      <div className="statistics-tabs">
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-pie"></i> Tổng quan & Phân tích
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <i className="fas fa-file-alt"></i> Báo cáo chi tiết
        </button>
      </div>

      <div className="statistics-content">
        {activeTab === 'analytics' ? (
          <div className="tab-pane fade-in">
            <Analytics />
          </div>
        ) : (
          <div className="tab-pane fade-in">
            <Reports />
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
