import { clsx, type ClassValue } from 'clsx';

/**
 * 条件付きクラス名を結合するユーティリティ
 * @example
 * cn(styles.button, variant === 'primary' && styles.primary)
 * cn(styles.card, { [styles.active]: isActive })
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
