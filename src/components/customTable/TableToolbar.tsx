import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Search, X } from 'lucide-react';

export interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  variant?: 'danger' | 'warning' | 'primary' | 'secondary';
  onClick: (selectedIds: (string | number)[]) => void;
}

export interface TableToolbarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  selectedIds?: (string | number)[];
  onClearSelection?: () => void;
  bulkActions?: BulkAction[];
  filterSlot?: React.ReactNode;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: React.ReactNode;
  onClick: () => void;
  };
  totalCount?: number;
  filteredCount?: number;
  className?: string;
  isIntegratedHeader?: boolean;
}

/**
 * Enterprise SaaS Table Toolbar: Clean, Minimalist, Low Noise.
 * Seamlessly integrates Search, Filters, Count, and Primary CTA in a single unified header.
 */
export const TableToolbar: React.FC<TableToolbarProps> = ({
  searchValue = '',
  onSearchChange,
  searchPlaceholder,
  selectedIds = [],
  onClearSelection,
  bulkActions = [],
  filterSlot,
  primaryAction,
  secondaryAction,
  totalCount,
  filteredCount,
  className = '',
  isIntegratedHeader = false,
}) => {
  const { t } = useTranslation(['table', 'common']);
  const isBulkMode = selectedIds.length > 0;
  const placeholderText = searchPlaceholder || t('table:searchPlaceholder', { defaultValue: 'Tìm kiếm...' });

  const containerClasses = isIntegratedHeader
    ? `p-3.5 border-b border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3 ${className}`
    : `p-3.5 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 ${className}`;

  return (
    <div className="space-y-2 w-full">
      {/* 1. Main Search & Action Bar */}
      <div className={containerClasses}>
        {/* Left: Search Bar & Filters */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[260px] flex-wrap">
          {onSearchChange && (
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholderText}
                className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50/70 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {filterSlot}

          {totalCount !== undefined && (
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal hidden lg:inline-block ml-1">
              {filteredCount !== undefined && filteredCount !== totalCount ? (
                <span>
                  Đã lọc <strong className="font-semibold text-slate-700 dark:text-zinc-300">{filteredCount}</strong> / {totalCount}
                </span>
              ) : (
                <span>
                  Tổng <strong className="font-semibold text-slate-700 dark:text-zinc-300">{totalCount}</strong>
                </span>
              )}
            </span>
          )}
        </div>

        {/* Right: Actions (Primary CTA highlighted) */}
        <div className="flex items-center gap-2">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          )}

          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {primaryAction.icon}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Floating Minimal Bulk Actions Banner */}
      {isBulkMode && (
        <div className="px-3.5 py-2 bg-zinc-900 text-white rounded-md border border-zinc-800 shadow-md flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2.5">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[11px] font-semibold text-zinc-300 border border-zinc-700">
              Đã chọn {selectedIds.length}
            </span>
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
              >
                Bỏ chọn
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => action.onClick(selectedIds)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  action.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                }`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableToolbar;
