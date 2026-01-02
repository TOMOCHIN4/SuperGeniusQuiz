import type { HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import styles from './Card.module.scss';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** インタラクティブなカード（ホバー効果あり） */
  interactive?: boolean;
  /** 上部にカラーバーを表示 */
  accentColor?: string;
  /** パディングサイズ */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      interactive = false,
      accentColor,
      padding = 'md',
      className,
      style,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          styles.card,
          interactive && styles.interactive,
          styles[`padding${padding.charAt(0).toUpperCase()}${padding.slice(1)}`],
          className
        )}
        style={{
          ...style,
          '--accent-color': accentColor,
        } as React.CSSProperties}
        {...props}
      >
        {accentColor && <div className={styles.accentBar} />}
        <div className={styles.content}>{children}</div>
      </div>
    );
  }
);

Card.displayName = 'Card';
