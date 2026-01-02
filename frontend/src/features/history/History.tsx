// History Page
// 履歴画面

import { Card, ProgressBar } from '@/components/ui';
import type { SubjectType } from '@/components/features';
import styles from './History.module.scss';

interface HistoryItem {
  id: string;
  date: string;
  subject: SubjectType;
  score: number;
  total: number;
}

// 仮データ
const MOCK_HISTORY: HistoryItem[] = [
  { id: '1', date: '2026-01-02', subject: 'japanese', score: 8, total: 10 },
  { id: '2', date: '2026-01-02', subject: 'math', score: 7, total: 10 },
  { id: '3', date: '2026-01-01', subject: 'science', score: 9, total: 10 },
  { id: '4', date: '2026-01-01', subject: 'social', score: 6, total: 10 },
  { id: '5', date: '2025-12-31', subject: 'japanese', score: 10, total: 10 },
];

const SUBJECT_CONFIG: Record<SubjectType, { name: string; color: string }> = {
  japanese: { name: '国語', color: '#4A90E2' },
  math: { name: '算数', color: '#50C878' },
  science: { name: '理科', color: '#00A896' },
  social: { name: '社会', color: '#FF6B6B' },
};

export const History: React.FC = () => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>学習履歴</h1>

      {MOCK_HISTORY.length === 0 ? (
        <Card className={styles.emptyCard}>
          <p className={styles.emptyText}>まだ履歴がありません</p>
        </Card>
      ) : (
        <div className={styles.list}>
          {MOCK_HISTORY.map((item) => {
            const config = SUBJECT_CONFIG[item.subject];
            const percentage = Math.round((item.score / item.total) * 100);

            return (
              <Card key={item.id} className={styles.historyCard}>
                <div className={styles.cardHeader}>
                  <span
                    className={styles.subjectBadge}
                    style={{ backgroundColor: config.color }}
                  >
                    {config.name}
                  </span>
                  <span className={styles.date}>{formatDate(item.date)}</span>
                </div>
                <div className={styles.scoreArea}>
                  <span className={styles.score}>
                    {item.score} / {item.total}
                  </span>
                  <span className={styles.percentage}>{percentage}%</span>
                </div>
                <ProgressBar value={percentage} color={config.color} size="sm" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
