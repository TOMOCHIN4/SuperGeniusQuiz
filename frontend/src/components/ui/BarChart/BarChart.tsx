// BarChart Component
// 棒グラフ - 今週の学習時間など

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import { cn } from '../../../utils/cn';
import styles from './BarChart.module.scss';

// Chart.js の必要なコンポーネントを登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface BarChartDataItem {
  label: string;
  value: number;
}

export interface BarChartProps {
  /** グラフのタイトル */
  title?: string;
  /** データ配列 */
  data: BarChartDataItem[];
  /** グラデーション開始色 */
  gradientStart?: string;
  /** グラデーション終了色 */
  gradientEnd?: string;
  /** 縦軸の単位（例: "分"） */
  unit?: string;
  /** 高さ */
  height?: number;
  /** カスタムクラス名 */
  className?: string;
}

export const BarChart = ({
  title,
  data,
  gradientStart = '#4facfe',
  gradientEnd = '#00f2fe',
  unit = '',
  height = 200,
  className,
}: BarChartProps) => {
  const labels = data.map((item) => item.label);
  const values = data.map((item) => item.value);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: (context: { chart: ChartJS }) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;

          if (!chartArea) {
            return gradientStart;
          }

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, gradientEnd);
          gradient.addColorStop(1, gradientStart);
          return gradient;
        },
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#666666',
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666666',
          font: {
            size: 12,
          },
          callback: (value) => `${value}${unit}`,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={cn(styles.wrapper, className)}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.chartContainer} style={{ height }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
