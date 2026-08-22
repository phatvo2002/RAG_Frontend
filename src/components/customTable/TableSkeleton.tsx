import React from 'react';

export interface TableSkeletonProps {
  columnsCount: number;
  rowCount?: number;
  selectable?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  columnsCount,
  rowCount = 5,
  selectable = false,
}) => {
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  return (
    <>
      {rows.map((rowIdx) => (
        <tr key={`skeleton-row-${rowIdx}`} className="animate-pulse">
          {selectable && (
            <td className="px-4 py-3.5 w-10">
              <div className="w-4 h-4 bg-slate-200 dark:bg-zinc-800 rounded" />
            </td>
          )}
          {Array.from({ length: columnsCount }).map((_, colIdx) => {
            const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-1/3', 'w-4/5'];
            const chosenWidth = widths[(rowIdx + colIdx) % widths.length];

            return (
              <td key={`skeleton-cell-${colIdx}`} className="px-4 py-3.5">
                <div className="space-y-1.5">
                  <div className={`h-3.5 bg-slate-200 dark:bg-zinc-800 rounded ${chosenWidth}`} />
                  {colIdx === 0 && <div className="h-2.5 bg-slate-100 dark:bg-zinc-850 rounded w-1/2" />}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};
export default TableSkeleton;
