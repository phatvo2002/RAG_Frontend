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
        <tr key={`skeleton-row-${rowIdx}`}>
          {selectable && (
            <td className="w-10 text-center">
              <div className="skeleton w-4 h-4 rounded mx-auto" />
            </td>
          )}
          {Array.from({ length: columnsCount }).map((_, colIdx) => {
            const widths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-1/3', 'w-4/5'];
            const chosenWidth = widths[(rowIdx + colIdx) % widths.length];

            return (
              <td key={`skeleton-cell-${colIdx}`} className="py-3 px-4">
                <div className="space-y-1.5">
                  <div className={`skeleton h-3.5 rounded ${chosenWidth}`} />
                  {colIdx === 0 && <div className="skeleton h-2.5 rounded w-1/2" />}
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
