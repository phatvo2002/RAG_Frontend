import React from 'react';
import { useTranslation } from 'react-i18next';

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
  activeText,
  inactiveText,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const vi = i18n.language.startsWith('vi');
  const isInactive =
    status === false ||
    status === 'Inactive' ||
    status === 'Vô hiệu hóa' ||
    status === 'Tạm khóa' ||
    status === 'Bị khóa' ||
    status === 'Locked' ||
    status === 'Archived';

  const isArchived = status === 'Archived' || status === 'Lưu trữ';

  let text = activeText ?? (vi ? 'Hoạt động' : 'Active');
  if (typeof status === 'string' && status) {
    if (status === 'Active') text = activeText ?? (vi ? 'Hoạt động' : 'Active');
    else if (status === 'Inactive') text = inactiveText ?? (vi ? 'Tạm khóa' : 'Inactive');
    else text = status;
  } else if (isInactive) {
    text = inactiveText ?? (vi ? 'Tạm khóa' : 'Inactive');
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

