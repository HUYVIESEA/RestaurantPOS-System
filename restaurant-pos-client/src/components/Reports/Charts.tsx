import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import './Charts.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Common chart options
const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      cornerRadius: 8
    }
  }
};

// Revenue Chart Component
interface RevenueChartProps {
  data: {
    labels: string[];
    revenue: number[];
  };
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Doanh Thu (₫)',
        data: data.revenue,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('vi-VN').format(value) + '₫';
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
};

// Bar Chart for Products
interface ProductChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  title?: string;
}

export const ProductBarChart: React.FC<ProductChartProps> = ({ data, title }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title || 'Số Lượng Bán',
        data: data.values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(255, 102, 178, 0.6)',
          'rgba(102, 255, 178, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(255, 102, 178, 1)',
          'rgba(102, 255, 178, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={commonOptions} />
    </div>
  );
};

// Pie Chart for Categories
interface CategoryPieChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.values,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)'
        ],
        borderColor: '#ffffff',
        borderWidth: 3
      }
    ]
  };

  return (
    <div className="chart-container">
      <Pie data={chartData} options={commonOptions} />
    </div>
  );
};

// Doughnut Chart for Order Status
interface OrderStatusChartProps {
  data: {
    completed: number;
    pending: number;
    cancelled: number;
  };
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const chartData = {
    labels: ['Hoàn Thành', 'Đang Chờ', 'Đã Hủy'],
    datasets: [
      {
        data: [data.completed, data.pending, data.cancelled],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: '#ffffff',
        borderWidth: 3
      }
    ]
  };

  return (
    <div className="chart-container">
      <Doughnut data={chartData} options={commonOptions} />
    </div>
  );
};

// Multi-line Chart for Comparison
interface ComparisonChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.color,
      backgroundColor: dataset.color.replace('1)', '0.2)'),
      fill: true,
      tension: 0.4
    }))
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={commonOptions} />
    </div>
  );
};

// Hourly Bar Chart
interface HourlyChartProps {
  data: {
    hours: number[];
    revenue: number[];
  };
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ data }) => {
  const chartData = {
    labels: data.hours.map(h => `${h}:00`),
    datasets: [
      {
        label: 'Doanh Thu Theo Giờ',
        data: data.revenue,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('vi-VN').format(value) + '₫';
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Weekly Chart
interface WeeklyChartProps {
  data: {
    days: string[];
    revenue: number[];
  };
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const chartData = {
    labels: data.days,
    datasets: [
      {
        label: 'Doanh Thu Theo Ngày',
        data: data.revenue,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 2
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return new Intl.NumberFormat('vi-VN').format(value) + '₫';
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
};
