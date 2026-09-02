import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchX, Inbox, Plus } from 'lucide-react';

export interface TableEmptyStateProps {
  title?: string;
  description?: string;
  isSearch?: boolean;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  title,
  description,
  isSearch = false,
  actionText,
  onAction,
  className = '',
}) => {
  const { t } = useTranslation(['table', 'common']);

  const defaultTitle = isSearch
    ? t('table:empty.searchTitle', { defaultValue: 'No matching results found' })
    : t('table:empty.title', { defaultValue: 'No data found' });

  const defaultDesc = isSearch
    ? t('table:empty.searchDescription', { defaultValue: 'Try adjusting your search query or clear active filters.' })
    : t('table:empty.description', { defaultValue: 'No data available in this list.' });

  return (
    <div className={`py-12 px-4 flex flex-col items-center justify-center text-center select-none ${className}`}>
      <div className="w-10 h-10 rounded bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-400 flex items-center justify-center mb-2.5 shadow-2xs">
        {isSearch ? <SearchX className="w-5 h-5 stroke-[1.75]" /> : <Inbox className="w-5 h-5 stroke-[1.75]" />}
      </div>
      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 tracking-tight">
        {title || defaultTitle}
      </h4>
      <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-xs mt-0.5 leading-relaxed">
        {description || defaultDesc}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-2xs shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
export default TableEmptyState;
