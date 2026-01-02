// SubjectCard Component
// 教科選択カード - 各教科のクイズを開始するための入り口

import { cn } from '../../../utils/cn';
import { Card, ProgressBar } from '../../ui';
import styles from './SubjectCard.module.scss';

export type SubjectType = 'japanese' | 'math' | 'science' | 'social';

export interface SubjectCardProps {
  /** 教科タイプ */
  subject: SubjectType;
  /** 進捗率（0-100） */
  progress?: number;
  /** クリック時のコールバック */
  onClick?: () => void;
  /** カスタムクラス名 */
  className?: string;
}

// 教科設定
const SUBJECT_CONFIG: Record<
  SubjectType,
  { name: string; icon: string; color: string }
> = {
  japanese: {
    name: '国語',
    icon: '📖',
    color: '#4A90E2',
  },
  math: {
    name: '算数',
    icon: '🔢',
    color: '#50C878',
  },
  science: {
    name: '理科',
    icon: '🔬',
    color: '#00A896',
  },
  social: {
    name: '社会',
    icon: '🌍',
    color: '#FF6B6B',
  },
};

export const SubjectCard = ({
  subject,
  progress = 0,
  onClick,
  className,
}: SubjectCardProps) => {
  const config = SUBJECT_CONFIG[subject];

  return (
    <Card
      className={cn(styles.card, className)}
      onClick={onClick}
      interactive={!!onClick}
      accentColor={config.color}
    >
      <div className={styles.content}>
        <span className={styles.icon}>{config.icon}</span>
        <span className={styles.name}>{config.name}</span>
      </div>
      <div className={styles.progressArea}>
        <span className={styles.progressLabel}>進捗: {progress}%</span>
        <ProgressBar value={progress} color={config.color} size="sm" />
      </div>
    </Card>
  );
};
