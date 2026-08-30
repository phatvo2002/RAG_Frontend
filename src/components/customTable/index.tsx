import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableSkeleton } from './TableSkeleton';
import { TableEmptyState, TableEmptyStateProps } from './TableEmptyState';

export interface Column<T> {
  id?: string;
  header: string;
  accessor?: keyof T;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
  sortKey?: string;
  className?: string;
  headerClassName?: string;
}

export interface SortConfig {
  key: string;
  order: 'asc' | 'desc';
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  totalItems?: number;
}

export interface CustomTableProps<T> {
  title?: string;
  toolbar?: React.ReactNode;
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string | number;

  // Selection
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;

  // Sorting
  sortConfig?: SortConfig;
  onSort?: (sortKey: string) => void;

  // Styling & Options
  striped?: boolean;
  compact?: boolean;
  stickyHeader?: boolean;
  className?: string;

  // States
  isLoading?: boolean;
  skeletonRowCount?: number;
  emptyState?: TableEmptyStateProps;
  emptyText?: string;

  // Interactivity
  onRowClick?: (item: T, index: number) => void;

  // Pagination
  pagination?: PaginationConfig;
}

/**
 * Enterprise SaaS Minimalist Table Component.
 * Low visual noise, clean borders, high typography clarity, and unified container.
 */
export function CustomTable<T>({
  title,
  toolbar,
  columns,
  data,
  keyExtractor = (_, idx) => idx,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  sortConfig,
  onSort,
  striped = false,
  compact = false,
  stickyHeader = false,
  className = '',
  isLoading = false,
  skeletonRowCount = 5,
  emptyState,
  emptyText,
  onRowClick,
  pagination,
}: CustomTableProps<T>) {
  const { t } = useTranslation(['table', 'common']);

  // Checkbox Select All Logic
  const allItemKeys = data.map((item, idx) => keyExtractor(item, idx));
  const isAllSelected = data.length > 0 && allItemKeys.every((key) => selectedIds.includes(key));
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allItemKeys);
    }
  };

  const handleSelectRow = (key: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedIds.includes(key)) {
      onSelectionChange(selectedIds.filter((id) => id !== key));
    } else {
      onSelectionChange([...selectedIds, key]);
    }
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  // Pagination Item Range calculation
  const currentPage = pagination?.currentPage || 1;
  const pageSize = pagination?.pageSize || 10;
  const totalItems = pagination?.totalItems ?? data.length;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`w-full bg-white dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800/90 shadow-2xs overflow-hidden transition-colors ${className}`}>
      {/* Integrated Toolbar or Title Header */}
      {toolbar ? (
        <div className="w-full">{toolbar}</div>
      ) : title ? (
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 tracking-tight">{title}</h3>
          {totalItems > 0 && (
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
              {totalItems} mục
            </span>
          )}
        </div>
      ) : null}

      {/* Main Table Content */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead
            className={`bg-slate-50/70 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800/90 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider select-none ${
              stickyHeader ? 'sticky top-0 z-10' : ''
            }`}
          >
            <tr>
              {/* Select All Checkbox */}
              {selectable && (
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
              )}

              {/* Column Headers */}
              {columns.map((col, idx) => {
                const alignClass = getAlignClass(col.align);
                const isSorted = sortConfig && (sortConfig.key === col.sortKey || sortConfig.key === String(col.accessor));
                const isSortable = col.sortable && Boolean(onSort);

                return (
                  <th
                    key={col.id || idx}
                    style={{ width: col.width }}
                    className={`px-4 py-2.5 ${alignClass} ${col.headerClassName || ''} ${col.className || ''} ${
                      isSortable ? 'cursor-pointer hover:text-slate-800 dark:hover:text-zinc-200 transition-colors' : ''
                    }`}
                    onClick={() => {
                      if (isSortable && onSort) {
                        onSort(col.sortKey || String(col.accessor));
                      }
                    }}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {isSortable && (
                        <span className="text-slate-400 dark:text-zinc-500">
                          {isSorted ? (
                            sortConfig.order === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs">
            {isLoading ? (
              <TableSkeleton
                columnsCount={columns.length}
                rowCount={skeletonRowCount}
                selectable={selectable}
              />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={selectable ? columns.length + 1 : columns.length} className="py-8">
                  <TableEmptyState
                    title={emptyState?.title}
                    description={emptyState?.description || emptyText}
                    isSearch={emptyState?.isSearch}
                    actionText={emptyState?.actionText}
                    onAction={emptyState?.onAction}
                  />
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => {
                const key = keyExtractor(item, rowIdx);
                const isSelected = selectable && selectedIds.includes(key);
                const isClickable = Boolean(onRowClick);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item, rowIdx)}
                    className={`${
                      isSelected
                        ? 'bg-blue-50/40 dark:bg-blue-950/20'
                        : striped && rowIdx % 2 === 1
                        ? 'bg-slate-50/30 dark:bg-zinc-900/20'
                        : 'bg-white dark:bg-zinc-950'
                    } ${isClickable ? 'hover:bg-slate-50/60 dark:hover:bg-zinc-900/50 cursor-pointer' : 'hover:bg-slate-50/60 dark:hover:bg-zinc-900/50'} transition-colors`}
                  >
                    {/* Row Checkbox */}
                    {selectable && (
                      <td
                        className="w-10 px-3 py-3 text-center"
                        onClick={(e) => handleSelectRow(key, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-zinc-700 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Row Cells */}
                    {columns.map((col, colIdx) => {
                      const alignClass = getAlignClass(col.align);
                      const paddingClass = compact ? 'px-3 py-2' : 'px-4 py-3';

                      return (
                        <td
                          key={col.id || colIdx}
                          className={`${alignClass} ${paddingClass} text-slate-700 dark:text-zinc-300 ${col.className || ''}`}
                        >
                          {col.render
                            ? col.render(item, rowIdx)
                            : col.accessor
                            ? String(item[col.accessor] ?? '')
                            : null}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Enterprise SaaS Minimalist Pagination Bar: "1–10 trong 128 | 10 / trang | ‹ ›" */}
      {pagination && (
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 flex flex-wrap items-center justify-between gap-3 text-xs select-none transition-colors">
          {/* Left: 1–10 trong 128 */}
          <div className="text-slate-500 dark:text-zinc-400 font-normal">
            {totalItems > 0 ? (
              <span>
                <strong className="font-semibold text-slate-700 dark:text-zinc-300">{startItem}–{endItem}</strong> trong <strong className="font-semibold text-slate-700 dark:text-zinc-300">{totalItems}</strong>
              </span>
            ) : (
              <span>0 mục</span>
            )}
          </div>

          {/* Right: Page Size & Minimal ‹ › Navigation */}
          <div className="flex items-center gap-3">
            {/* Page Size Select */}
            {pagination.onPageSizeChange && (
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
                <select
                  value={pageSize}
                  onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                  className="px-2 py-1 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                >
                  {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt} / trang
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Prev / Next ‹ › Buttons */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 mr-1 hidden sm:inline">
                {currentPage} / {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => pagination.onPageChange(currentPage - 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Trang trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => pagination.onPageChange(currentPage + 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Trang sau"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { TableToolbar } from './TableToolbar';
export { TableSkeleton } from './TableSkeleton';
export { TableEmptyState } from './TableEmptyState';
export { TableRowActions } from './TableRowActions';
export { StatusBadge } from './StatusBadge';
export default CustomTable;
