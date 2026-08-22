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
}

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
}) => {
  const { t } = useTranslation(['table', 'common']);
  const isBulkMode = selectedIds.length > 0;
  const placeholderText = searchPlaceholder || t('table:searchPlaceholder', { defaultValue: 'Search data...' });

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* 1. Main Search & Action Bar */}
      <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        {/* Left Side: Search & Filter Slot */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholderText}
                className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50 dark:bg-zinc-800/90 border border-slate-200 dark:border-zinc-700/80 rounded text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 transition-colors"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {filterSlot}

          {totalCount !== undefined && (
            <span className="text-[11px] text-slate-400 dark:text-zinc-400 font-medium hidden sm:inline-block">
              {filteredCount !== undefined && filteredCount !== totalCount ? (
                <Trans
                  i18nKey="table:foundItems"
                  values={{ count: filteredCount, total: totalCount }}
                  defaults="Found <1>{{count}}</1> / {{total}} items"
                  components={{
                    1: <strong className="text-slate-700 dark:text-zinc-200 font-semibold" />,
                  }}
                />
              ) : (
                <Trans
                  i18nKey="table:totalItems"
                  values={{ total: totalCount }}
                  defaults="Total: <1>{{total}}</1> items"
                  components={{
                    1: <strong className="text-slate-700 dark:text-zinc-200 font-semibold" />,
                  }}
                />
              )}
            </span>
          )}
        </div>

        {/* Right Side: Primary & Secondary Action CTAs */}
        <div className="flex items-center gap-2">
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          )}

          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 transition-all cursor-pointer"
            >
              {primaryAction.icon}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Floating Bulk Actions Bar */}
      {isBulkMode && (
        <div className="p-2 px-3.5 bg-zinc-900 text-white border border-zinc-700 rounded-lg shadow-md flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-sm bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="font-medium text-zinc-200">
              {t('table:selectedCount', { count: selectedIds.length, defaultValue: `Selected ${selectedIds.length} items` })}
            </span>
            {onClearSelection && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-[11px] text-zinc-400 hover:text-white underline ml-2 cursor-pointer"
              >
                {t('table:deselect', { defaultValue: 'Deselect' })}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {bulkActions.map((action, idx) => {
              const bgColors = {
                danger: 'bg-rose-600 hover:bg-rose-700 text-white',
                warning: 'bg-amber-600 hover:bg-amber-700 text-white',
                primary: 'bg-blue-600 hover:bg-blue-700 text-white',
                secondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200',
              };

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => action.onClick(selectedIds)}
                  className={`px-2.5 py-1 rounded font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    bgColors[action.variant || 'secondary']
                  }`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default TableToolbar;
