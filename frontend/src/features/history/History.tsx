// History Page
// 履歴画面

import { useState, useEffect } from 'react';
import { Card, ProgressBar, Loading } from '@/components/ui';
import { useAuth } from '@/contexts';
import { getHistory } from '@/services/api';
import type { HistoryItem, Subject } from '@/types';
import styles from './History.module.scss';

const SUBJECT_CONFIG: Record<Subject, { name: string; color: string }> = {
  jp: { name: '国語', color: '#4A90E2' },
  math: { name: '算数', color: '#50C878' },
  sci: { name: '理科', color: '#00A896' },
  soc: { name: '社会', color: '#FF6B6B' },
  all: { name: '全教科', color: '#9B59B6' },
};

export const History: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const response = await getHistory(user.user_id);
        if (response.success) {
          setHistory(response.history);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>学習履歴</h1>
        <Loading />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>学習履歴</h1>

      {history.length === 0 ? (
        <Card className={styles.emptyCard}>
          <p className={styles.emptyText}>まだ履歴がありません</p>
        </Card>
      ) : (
        <div className={styles.list}>
          {history.map((item) => {
            const config = SUBJECT_CONFIG[item.subject] || SUBJECT_CONFIG.all;
            const percentage = item.total_questions > 0
              ? Math.round((item.correct_count / item.total_questions) * 100)
              : 0;

            return (
              <Card key={item.session_id} className={styles.historyCard}>
                <div className={styles.cardHeader}>
                  <span
                    className={styles.subjectBadge}
                    style={{ backgroundColor: config.color }}
                  >
                    {config.name}
                  </span>
                  <span className={styles.date}>{formatDate(item.finished_at)}</span>
                </div>
                <div className={styles.scoreArea}>
                  <span className={styles.score}>
                    {item.correct_count} / {item.total_questions}
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
