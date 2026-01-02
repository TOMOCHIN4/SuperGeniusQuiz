import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import styles from './Input.module.scss';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** エラー状態 */
  error?: boolean;
  /** エラーメッセージ */
  errorMessage?: string;
  /** ラベル */
  label?: string;
  /** フルwidthにする */
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error = false,
      errorMessage,
      label,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={cn(styles.wrapper, fullWidth && styles.fullWidth)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            styles.input,
            error && styles.error,
            className
          )}
          aria-invalid={error}
          aria-describedby={errorMessage ? `${inputId}-error` : undefined}
          {...props}
        />
        {errorMessage && (
          <span id={`${inputId}-error`} className={styles.errorMessage} role="alert">
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
