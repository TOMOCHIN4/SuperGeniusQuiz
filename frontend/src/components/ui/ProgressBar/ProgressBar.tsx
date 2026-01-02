import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import styles from './ProgressBar.module.scss';

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** 進捗率 (0-100) */
  value: number;
  /** 最大値 */
  max?: number;
  /** カスタムカラー */
  color?: string;
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** ラベルを表示するか */
  showLabel?: boolean;
  /** アニメーション有効化 */
  animated?: boolean;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value,
      max = 100,
      color,
      size = 'md',
      showLabel = false,
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(styles.wrapper, className)}
        {...props}
      >
        <div
          className={cn(styles.track, styles[size])}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={cn(styles.fill, animated && styles.animated)}
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
        {showLabel && (
          <span className={styles.label}>{Math.round(percentage)}%</span>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';
