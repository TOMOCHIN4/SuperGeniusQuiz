import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import styles from './Loading.module.scss';

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** カスタムカラー */
  color?: string;
  /** フルスクリーン表示 */
  fullScreen?: boolean;
  /** ローディングテキスト */
  text?: string;
}

export const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      size = 'md',
      color,
      fullScreen = false,
      text,
      className,
      ...props
    },
    ref
  ) => {
    const spinner = (
      <div
        className={cn(styles.spinner, styles[size])}
        style={{ borderTopColor: color }}
        role="status"
        aria-label="読み込み中"
      />
    );

    if (fullScreen) {
      return (
        <div ref={ref} className={cn(styles.fullScreen, className)} {...props}>
          <div className={styles.content}>
            {spinner}
            {text && <span className={styles.text}>{text}</span>}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(styles.wrapper, className)}
        {...props}
      >
        {spinner}
        {text && <span className={styles.text}>{text}</span>}
      </div>
    );
  }
);

Loading.displayName = 'Loading';
