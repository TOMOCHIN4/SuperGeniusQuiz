// HeroMessage Component
// メインメッセージエリア - 児童のやる気を引き出すキャッチコピー

import { cn } from '../../../utils/cn';
import styles from './HeroMessage.module.scss';

export interface HeroMessageProps {
  /** ユーザー名（オプション） */
  userName?: string;
  /** カスタムメッセージ */
  message?: string;
  /** カスタムクラス名 */
  className?: string;
}

export const HeroMessage = ({
  userName,
  message = 'ようこそ、未来の天才たち',
  className,
}: HeroMessageProps) => {
  // ユーザー名がある場合はパーソナライズ
  const displayMessage = userName
    ? `${userName}さん、今日も頑張ろう！`
    : message;

  return (
    <section className={cn(styles.hero, className)}>
      <h1 className={styles.message}>{displayMessage}</h1>
    </section>
  );
};
