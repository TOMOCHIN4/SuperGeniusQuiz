import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          styles.button,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          isLoading && styles.loading,
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        <span className={cn(styles.content, isLoading && styles.hidden)}>
          {children}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
