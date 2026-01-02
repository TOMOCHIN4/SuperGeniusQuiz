// DashboardMetrics Component
// ダッシュボードエリア - 学習状況を視覚的に表示

import { cn } from '../../../utils/cn';
import { Card, BarChart, DoughnutChart } from '../../ui';
import type { BarChartDataItem } from '../../ui';
import styles from './DashboardMetrics.module.scss';

export interface DashboardMetricsProps {
  /** 今週の学習時間データ（曜日別） */
  weeklyStudyTime?: BarChartDataItem[];
  /** 総合正答率（0-100） */
  totalAccuracy?: number;
  /** カスタムクラス名 */
  className?: string;
}

// デフォルトの曜日別学習時間データ
const DEFAULT_WEEKLY_DATA: BarChartDataItem[] = [
  { label: '月', value: 0 },
  { label: '火', value: 0 },
  { label: '水', value: 0 },
  { label: '木', value: 0 },
  { label: '金', value: 0 },
  { label: '土', value: 0 },
  { label: '日', value: 0 },
];

export const DashboardMetrics = ({
  weeklyStudyTime = DEFAULT_WEEKLY_DATA,
  totalAccuracy = 0,
  className,
}: DashboardMetricsProps) => {
  return (
    <section className={cn(styles.metrics, className)}>
      {/* 今週の学習時間 */}
      <Card className={styles.card}>
        <BarChart
          title="今週の学習時間"
          data={weeklyStudyTime}
          unit="分"
          height={160}
          gradientStart="#4facfe"
          gradientEnd="#00f2fe"
        />
      </Card>

      {/* 総合正答率 */}
      <Card className={styles.card}>
        <div className={styles.accuracyWrapper}>
          <DoughnutChart
            value={totalAccuracy}
            label="総合正答率"
            color="#43e97b"
            size={140}
          />
        </div>
      </Card>
    </section>
  );
};
