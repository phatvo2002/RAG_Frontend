import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'btn-primary text-white',
    secondary: 'btn-neutral bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border-slate-200 dark:border-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-700',
    outline: 'btn-outline border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800',
    danger: 'btn-error text-white',
    ghost: 'btn-ghost text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800',
    success: 'btn-success text-white',
    warning: 'btn-warning text-slate-900',
    info: 'btn-info text-white',
  };

  const sizeClasses = {
    xs: 'btn-xs text-[11px]',
    sm: 'btn-sm text-xs',
    md: 'btn-sm sm:btn-md text-xs sm:text-sm',
    lg: 'btn-lg text-base',
  };

  return (
    <button
      className={`btn cursor-pointer font-semibold transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost' | 'neutral';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  outline?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  className = '',
  outline = false,
}) => {
  const variantClasses = {
    primary: 'badge-primary text-white',
    secondary: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700',
    success: 'badge-success text-white',
    warning: 'badge-warning text-slate-900',
    danger: 'badge-error text-white',
    info: 'badge-info text-white',
    ghost: 'badge-ghost',
    neutral: 'badge-neutral',
  };

  const sizeClasses = {
    xs: 'badge-xs text-[10px] py-0.5 px-1.5',
    sm: 'badge-sm text-[11px] py-1 px-2',
    md: 'badge-md text-xs py-1.5 px-2.5',
    lg: 'badge-lg text-sm py-2 px-3',
  };

  return (
    <span
      className={`badge font-semibold ${variantClasses[variant]} ${sizeClasses[size]} ${
        outline ? 'badge-outline' : ''
      } ${className}`}
    >
      {children}
    </span>
  );
};

export default Button;
