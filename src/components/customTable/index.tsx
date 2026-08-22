import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react';
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

export function CustomTable<T>({
  title,
  columns,
  data,
  keyExtractor = (_, idx) => idx,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  sortConfig,
  onSort,
  striped = true,
  compact = false,
  stickyHeader = false,
  className = '',
  isLoading = false,
  skeletonRowCount = 5,
  emptyState,
  emptyText = 'Không có dữ liệu',
  onRowClick,
  pagination,
}: CustomTableProps<T>) {
  const [jumpPageInput, setJumpPageInput] = useState('');

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

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pagination) return;
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= pagination.totalPages) {
      pagination.onPageChange(p);
      setJumpPageInput('');
    }
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  const paddingClass = compact ? 'px-3 py-2.5' : 'px-4 py-3.5';

  return (
    <div className={`w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors ${className}`}>
      {/* Table Title if provided */}
      {title && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
        </div>
      )}

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200 border-collapse">
          {/* Header */}
          <thead
            className={`bg-slate-50/80 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs select-none ${
              stickyHeader ? 'sticky top-0 z-10' : ''
            }`}
          >
            <tr>
              {/* Select All Checkbox */}
              {selectable && (
                <th className="px-3 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
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
                    className={`${paddingClass} ${alignClass} ${col.headerClassName || ''} ${col.className || ''} ${
                      isSortable ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' : ''
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
                        <span className="text-slate-400 dark:text-slate-500">
                          {isSorted ? (
                            sortConfig.order === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 font-bold" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 font-bold" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-40" />
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {isLoading ? (
              <TableSkeleton
                columnsCount={columns.length}
                rowCount={skeletonRowCount}
                selectable={selectable}
              />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={selectable ? columns.length + 1 : columns.length}>
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

                // Alternating zebra row background like in sample image
                const isEvenRow = rowIdx % 2 === 1;
                const rowBg = isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-950/50'
                  : striped && isEvenRow
                  ? 'bg-slate-50/60 dark:bg-slate-800/30'
                  : 'bg-white dark:bg-slate-900';

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item, rowIdx)}
                    className={`${rowBg} transition-colors ${
                      isClickable ? 'hover:bg-blue-50/50 dark:hover:bg-blue-950/30 cursor-pointer' : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {/* Row Checkbox */}
                    {selectable && (
                      <td
                        className="px-3 py-3 w-10 text-center"
                        onClick={(e) => handleSelectRow(key, e)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                      </td>
                    )}

                    {/* Row Cells */}
                    {columns.map((col, colIdx) => {
                      const alignClass = getAlignClass(col.align);

                      return (
                        <td
                          key={col.id || colIdx}
                          className={`${paddingClass} ${alignClass} ${col.className || ''}`}
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

      {/* Exact Pagination Bar matching the sample image */}
      {pagination && (
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs select-none transition-colors">
          {/* Left Controls: Prev, Page buttons, Next, Đi đến trang [ ] [->] */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Prev Page Button */}
            <button
              type="button"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                // Show first, last, and pages around current page
                return (
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.currentPage) <= 1
                );
              })
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                const isActive = p === pagination.currentPage;

                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                    <button
                      type="button"
                      onClick={() => pagination.onPageChange(p)}
                      className={`w-8 h-8 rounded-lg font-semibold text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-2xs shadow-blue-500/30'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            {/* Next Page Button */}
            <button
              type="button"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Jump to Page Form */}
            <form onSubmit={handleJumpPage} className="flex items-center gap-1.5 ml-2">
              <span className="text-slate-500 dark:text-slate-400 text-xs">Đi đến trang</span>
              <input
                type="number"
                min={1}
                max={pagination.totalPages}
                value={jumpPageInput}
                onChange={(e) => setJumpPageInput(e.target.value)}
                className="w-12 h-8 px-2 text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-2xs shadow-blue-500/20 cursor-pointer transition-colors"
                title="Chuyển đến trang"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Right Controls: Hiển thị [ 20 v ] hàng */}
          {pagination.onPageSizeChange && (
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-xs">
              <span>Hiển thị</span>
              <select
                value={pagination.pageSize || 20}
                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                className="h-8 px-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 cursor-pointer shadow-2xs"
              >
                {(pagination.pageSizeOptions || [10, 20, 50, 100]).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span>hàng</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { TableToolbar } from './TableToolbar';
export { TableSkeleton } from './TableSkeleton';
export { TableEmptyState } from './TableEmptyState';
export default CustomTable;
