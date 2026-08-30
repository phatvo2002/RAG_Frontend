import React from 'react';

export interface LoadingProps {
  type?: 'spinner' | 'dots' | 'bars' | 'ring' | 'ball' | 'infinity';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'current';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'md',
  color = 'primary',
  text,
  className = '',
  fullScreen = false,
}) => {
  const typeClasses = {
    spinner: 'loading-spinner',
    dots: 'loading-dots',
    bars: 'loading-bars',
    ring: 'loading-ring',
    ball: 'loading-ball',
    infinity: 'loading-infinity',
  };

  const sizeClasses = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    neutral: 'text-neutral',
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    current: 'text-current',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-2.5 ${className}`}>
      <span className={`loading ${typeClasses[type]} ${sizeClasses[size]} ${colorClasses[color]}`} />
      {text && (
        <span className="text-xs font-medium text-slate-500 dark:text-zinc-400 animate-pulse">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;

