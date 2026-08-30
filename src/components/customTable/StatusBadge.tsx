import React from 'react';

export interface StatusBadgeProps {
  status: string | boolean;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

/**
 * Enterprise SaaS Minimalist Status Indicator: "● Hoạt động" / "● Tạm khóa"
 * Clean typography and subtle indicator dot, avoiding heavy colorful badges.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  activeText = 'Hoạt động',
  inactiveText = 'Tạm khóa',
  className = '',
}) => {
  const isInactive =
    status === false ||
    status === 'Inactive' ||
    status === 'Vô hiệu hóa' ||
    status === 'Tạm khóa' ||
    status === 'Bị khóa' ||
    status === 'Locked' ||
    status === 'Archived';

  const isArchived = status === 'Archived' || status === 'Lưu trữ';

  let text = activeText;
  if (typeof status === 'string' && status) {
    if (status === 'Active') text = 'Hoạt động';
    else if (status === 'Inactive') text = 'Tạm khóa';
    else text = status;
  } else if (isInactive) {
    text = inactiveText;
  }

  let dotColor = 'bg-emerald-500';
  let textColor = 'text-slate-700 dark:text-zinc-300';

  if (isArchived) {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-700 dark:text-amber-400';
  } else if (isInactive) {
    dotColor = 'bg-slate-400 dark:bg-zinc-500';
    textColor = 'text-slate-500 dark:text-zinc-400';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{text}</span>
    </span>
  );
};

export default StatusBadge;

