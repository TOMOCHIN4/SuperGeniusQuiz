// Dashboard Page
// トップ画面（ダッシュボード）

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeroMessage,
  SubjectCard,
  DashboardMetrics,
} from '@/components/features';
import type { SubjectType } from '@/components/features';
import { useAuth } from '@/contexts';
import { getStats } from '@/services/api';
import type { UserStats, Subject } from '@/types';
import styles from './Dashboard.module.scss';

// 仮データ（週間学習時間 - 将来的にAPIから取得）
const MOCK_WEEKLY_DATA = [
  { label: '月', value: 15 },
  { label: '火', value: 20 },
  { label: '水', value: 10 },
  { label: '木', value: 25 },
  { label: '金', value: 30 },
  { label: '土', value: 45 },
  { label: '日', value: 35 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  // 統計情報を取得
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const response = await getStats(user.user_id);
        if (response.success) {
          setStats(response.stats);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  const handleSubjectClick = (subject: SubjectType) => {
    // フロントエンドの教科タイプをAPIの教科コードに変換
    const subjectCodeMap: Record<SubjectType, Subject> = {
      japanese: 'jp',
      math: 'math',
      science: 'sci',
      social: 'soc',
    };
    navigate(`/quiz?subject=${subjectCodeMap[subject]}`);
  };

  // 教科別の正答率を計算
  const getSubjectAccuracy = (subject: Subject): number => {
    if (!stats?.by_subject?.[subject]) return 0;
    const subjectStats = stats.by_subject[subject];
    if (subjectStats.total === 0) return 0;
    return Math.round((subjectStats.correct / subjectStats.total) * 100);
  };

  // 総合正答率
  const totalAccuracy = stats
    ? Math.round(stats.overall_accuracy * 100)
    : 0;

  return (
    <div className={styles.container}>
      {/* メインメッセージ */}
      <HeroMessage userName={user?.username} />

      {/* ダッシュボードメトリクス */}
      <DashboardMetrics
        weeklyStudyTime={MOCK_WEEKLY_DATA}
        totalAccuracy={totalAccuracy}
      />

      {/* 教科選択 */}
      <section className={styles.subjects}>
        <h2 className={styles.sectionTitle}>教科を選ぶ</h2>
        <div className={styles.subjectGrid}>
          <SubjectCard
            subject="japanese"
            progress={getSubjectAccuracy('jp')}
            onClick={() => handleSubjectClick('japanese')}
          />
          <SubjectCard
            subject="math"
            progress={getSubjectAccuracy('math')}
            onClick={() => handleSubjectClick('math')}
          />
          <SubjectCard
            subject="science"
            progress={getSubjectAccuracy('sci')}
            onClick={() => handleSubjectClick('science')}
          />
          <SubjectCard
            subject="social"
            progress={getSubjectAccuracy('soc')}
            onClick={() => handleSubjectClick('social')}
          />
        </div>
      </section>
    </div>
  );
};
