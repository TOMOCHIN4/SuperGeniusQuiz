// Result Page
// クイズ結果画面

import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card, DoughnutChart } from '@/components/ui';
import type { SubjectType } from '@/components/features';
import styles from './Result.module.scss';

const SUBJECT_NAMES: Record<SubjectType, string> = {
  japanese: '国語',
  math: '算数',
  science: '理科',
  social: '社会',
};

export const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const score = parseInt(searchParams.get('score') || '0', 10);
  const total = parseInt(searchParams.get('total') || '0', 10);
  const subject = (searchParams.get('subject') as SubjectType) || 'japanese';

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getMessage = () => {
    if (percentage >= 80) return 'すばらしい！';
    if (percentage >= 60) return 'よくできました！';
    if (percentage >= 40) return 'もう少し！';
    return 'がんばろう！';
  };

  return (
    <div className={styles.container}>
      <Card className={styles.resultCard}>
        <h1 className={styles.title}>結果発表</h1>

        <div className={styles.chartArea}>
          <DoughnutChart
            value={percentage}
            label="正答率"
            color={percentage >= 60 ? '#43e97b' : '#FF6B6B'}
            size={160}
          />
        </div>

        <p className={styles.message}>{getMessage()}</p>

        <div className={styles.scoreDetail}>
          <span className={styles.subject}>{SUBJECT_NAMES[subject]}</span>
          <span className={styles.scoreText}>
            {score} / {total} 問正解
          </span>
        </div>
      </Card>

      <div className={styles.actions}>
        <Button onClick={() => navigate(`/quiz?subject=${subject}`)} fullWidth>
          もう一度チャレンジ
        </Button>
        <Button onClick={() => navigate('/')} variant="secondary" fullWidth>
          ホームに戻る
        </Button>
      </div>
    </div>
  );
};
