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

// Common container class
const chartContainerClass = "relative w-full h-[300px] md:h-[400px] bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center";

// Common chart options
const commonOptions: any = {
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
        },
        color: '#64748b' // text-slate-500
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)', // slate-900 with opacity
      padding: 12,
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 13
      },
      cornerRadius: 8,
      borderColor: 'rgba(51, 65, 85, 0.5)', // slate-700
      borderWidth: 1
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(148, 163, 184, 0.1)', // slate-400
        borderColor: 'rgba(148, 163, 184, 0.2)'
      },
      ticks: {
        color: '#64748b'
      }
    },
    y: {
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
        borderColor: 'rgba(148, 163, 184, 0.2)'
      },
      ticks: {
        color: '#64748b'
      }
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
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // blue-500
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        beginAtZero: true,
        ticks: {
          ...commonOptions.scales.y.ticks,
          callback: function(value: any) {
            return new Intl.NumberFormat('vi-VN').format(value) + '₫';
          }
        }
      }
    }
  };

  return (
    <div className={chartContainerClass}>
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
          'rgba(239, 68, 68, 0.8)',   // red-500
          'rgba(59, 130, 246, 0.8)',  // blue-500
          'rgba(245, 158, 11, 0.8)',  // amber-500
          'rgba(16, 185, 129, 0.8)',  // emerald-500
          'rgba(139, 92, 246, 0.8)',  // violet-500
          'rgba(249, 115, 22, 0.8)',  // orange-500
          'rgba(100, 116, 139, 0.8)', // slate-500
          'rgba(99, 102, 241, 0.8)',  // indigo-500
          'rgba(236, 72, 153, 0.8)',  // pink-500
          'rgba(20, 184, 166, 0.8)'   // teal-500
        ],
        borderRadius: 6,
        borderWidth: 0
      }
    ]
  };

  return (
    <div className={chartContainerClass}>
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
          'rgba(239, 68, 68, 0.8)',   // red-500
          'rgba(59, 130, 246, 0.8)',  // blue-500
          'rgba(245, 158, 11, 0.8)',  // amber-500
          'rgba(16, 185, 129, 0.8)',  // emerald-500
          'rgba(139, 92, 246, 0.8)',  // violet-500
          'rgba(249, 115, 22, 0.8)',  // orange-500
          'rgba(100, 116, 139, 0.8)', // slate-500
          'rgba(99, 102, 241, 0.8)'   // indigo-500
        ],
        borderColor: 'transparent',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const pieOptions = {
    ...commonOptions,
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  return (
    <div className={chartContainerClass}>
      <Pie data={chartData} options={pieOptions} />
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
          'rgba(16, 185, 129, 0.8)', // emerald-500 (success)
          'rgba(245, 158, 11, 0.8)', // amber-500 (warning)
          'rgba(239, 68, 68, 0.8)'   // red-500 (danger)
        ],
        borderColor: 'transparent',
        borderWidth: 2,
        hoverOffset: 4
      }
    ]
  };

  const doughnutOptions = {
    ...commonOptions,
    cutout: '70%',
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  return (
    <div className={chartContainerClass}>
      <Doughnut data={chartData} options={doughnutOptions} />
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
      backgroundColor: dataset.color.replace('1)', '0.1)'),
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: dataset.color,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: dataset.color
    }))
  };

  return (
    <div className={chartContainerClass}>
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
        backgroundColor: 'rgba(139, 92, 246, 0.8)', // violet-500
        borderRadius: 4,
        borderWidth: 0
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        beginAtZero: true,
        ticks: {
          ...commonOptions.scales.y.ticks,
          callback: function(value: any) {
            return new Intl.NumberFormat('vi-VN').format(value) + '₫';
          }
        }
      }
    }
  };

  return (
    <div className={chartContainerClass}>
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
        backgroundColor: 'rgba(249, 115, 22, 0.8)', // orange-500
        borderRadius: 4,
        borderWidth: 0
      }
    ]
  };

  const options = {
    ...commonOptions,
    scales: {
      ...commonOptions.scales,
      y: {
        ...commonOptions.scales.y,
        beginAtZero: true,
        ticks: {
          ...commonOptions.scales.y.ticks,
          callback: function(value: any) {
            return new Intl.NumberFormat('vi-VN').format(value) + '₫';
          }
        }
      }
    }
  };

  return (
    <div className={chartContainerClass}>
      <Bar data={chartData} options={options} />
    </div>
  );
};
