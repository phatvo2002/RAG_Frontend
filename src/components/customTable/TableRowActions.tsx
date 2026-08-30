import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

export interface TableRowActionsProps {
  items: ActionMenuItem[];
  align?: 'left' | 'right';
  className?: string;
}

/**
 * Enterprise SaaS Minimalist Row Actions Menu (⋯)
 * Reduces visual noise by hiding secondary/destructive actions in a clean dropdown menu.
 */
export const TableRowActions: React.FC<TableRowActionsProps> = ({
  items,
  align = 'right',
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`dropdown ${align === 'right' ? 'dropdown-end' : ''} inline-block ${className}`}>
      <div
        tabIndex={0}
        role="button"
        onClick={(e) => e.stopPropagation()}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        title="Thao tác"
      >
        <MoreHorizontal className="w-4 h-4" />
      </div>
      <ul
        tabIndex={0}
        onClick={(e) => e.stopPropagation()}
        className="dropdown-content z-30 menu p-1 shadow-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md w-44 text-xs font-medium text-slate-700 dark:text-zinc-200 animate-in fade-in-50 zoom-in-95 duration-100"
      >
        {items.map((item, idx) => {
          const isDanger = item.variant === 'danger';

          return (
            <li key={idx}>
              <button
                type="button"
                disabled={item.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  (document.activeElement as HTMLElement)?.blur();
                  item.onClick();
                }}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-sm transition-colors cursor-pointer ${
                  isDanger
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.icon && <span className="w-3.5 h-3.5 shrink-0 opacity-80">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TableRowActions;

