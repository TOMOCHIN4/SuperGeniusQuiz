// DoughnutChart Component
// ドーナツチャート - 総合正答率など

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import type { ChartOptions, ChartData } from 'chart.js';
import { cn } from '../../../utils/cn';
import styles from './DoughnutChart.module.scss';

// Chart.js の必要なコンポーネントを登録
ChartJS.register(ArcElement, Tooltip, Legend);

export interface DoughnutChartProps {
  /** 表示する値（パーセンテージ） */
  value: number;
  /** 中央に表示するラベル */
  label?: string;
  /** メインカラー */
  color?: string;
  /** 背景色（残りの部分） */
  backgroundColor?: string;
  /** サイズ */
  size?: number;
  /** カスタムクラス名 */
  className?: string;
}

export const DoughnutChart = ({
  value,
  label = '総合正答率',
  color = '#43e97b',
  backgroundColor = '#f0f0f0',
  size = 180,
  className,
}: DoughnutChartProps) => {
  // 値を0-100の範囲に制限
  const clampedValue = Math.max(0, Math.min(100, value));
  const remaining = 100 - clampedValue;

  const chartData: ChartData<'doughnut'> = {
    labels: ['達成', '残り'],
    datasets: [
      {
        data: [clampedValue, remaining],
        backgroundColor: [color, backgroundColor],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '75%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className={cn(styles.wrapper, className)} style={{ width: size, height: size }}>
      <div className={styles.chartContainer}>
        <Doughnut data={chartData} options={options} />
      </div>
      <div className={styles.centerLabel}>
        <span className={styles.value}>{clampedValue}%</span>
        {label && <span className={styles.label}>{label}</span>}
      </div>
    </div>
  );
};
