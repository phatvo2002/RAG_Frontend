import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  danger?: boolean;
  disabled?: boolean;
}

export interface TableRowActionsProps {
  items: ActionMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

/** Display every row action as a labeled icon button. */
export const TableRowActions: React.FC<TableRowActionsProps> = ({
  items,
  align = 'right',
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`inline-flex items-center gap-1 whitespace-nowrap ${align === 'right' ? 'justify-end' : 'justify-start'} ${className}`}>
      {items.map((item, idx) => {
        const isDanger = item.variant === 'danger' || item.danger;

        return (
          <button
            key={idx}
            type="button"
            aria-label={item.label}
            title={item.label}
            disabled={item.disabled}
            onClick={(event) => {
              event.stopPropagation();
              item.onClick();
            }}
            className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 ${
              isDanger
                ? 'text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:hover:border-rose-900 dark:hover:bg-rose-950/40'
                : 'text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:border-blue-900 dark:hover:bg-blue-950/40 dark:hover:text-blue-400'
            }`}
          >
            {item.icon ?? <MoreHorizontal className="h-4 w-4" />}
          </button>
        );
      })}
    </div>
  );
};

export default TableRowActions;
