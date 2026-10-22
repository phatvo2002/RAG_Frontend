import React, { useEffect } from 'react';
import { FileText, Layers3, X } from 'lucide-react';
import { DocumentListItem } from '@/api/documents.api';
import { useApp } from '@/context/AppContext';

interface DocumentDetailPanelProps {
  document: DocumentListItem;
  departmentName: string;
  onClose: () => void;
  onViewChunks: () => void;
}

export const DocumentDetailPanel: React.FC<DocumentDetailPanelProps> = ({
  document, departmentName, onClose, onViewChunks,
}) => {
  const { language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);
  const name = document.originalFileName || document.title;
  const formatDate = (value: string) => new Date(value).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
  const formatSize = (size: number) => size < 1024 * 1024
    ? `${(size / 1024).toFixed(1)} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  const status = ({
    READY: tr('Ready', 'Sẵn sàng'),
    PROCESSING: tr('Processing', 'Đang xử lý'),
    EXTRACTING: tr('Extracting', 'Đang trích xuất'),
    CHUNKING: tr('Chunking', 'Đang chia chunk'),
    INDEXING: tr('Indexing', 'Đang lập chỉ mục'),
    FAILED: tr('Failed', 'Thất bại'),
    PENDING: tr('Pending', 'Đang chờ'),
  } as Record<string, string>)[document.processingStatus] || document.processingStatus || '—';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-detail-title"
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="document-detail-title" className="truncate text-sm font-bold text-slate-900 dark:text-zinc-100" title={name}>{name}</h2>
              <p className="text-[11px] text-slate-400">{tr('Document details', 'Chi tiết tài liệu')}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-sm btn-ghost btn-circle" aria-label={tr('Close document details', 'Đóng chi tiết tài liệu')}>
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-4 overflow-y-auto p-4 text-xs">
          <dl className="space-y-3 rounded-lg border border-slate-200 p-4 dark:border-zinc-800">
            {[
              [tr('File name', 'Tên file'), name],
              [tr('Folder', 'Thư mục'), document.folderName],
              [tr('Department', 'Phòng ban'), departmentName],
              [tr('File type', 'Loại file'), document.mimeType || '—'],
              [tr('Size', 'Kích thước'), formatSize(document.sizeBytes)],
              [tr('Processing status', 'Trạng thái xử lý'), status],
              [tr('Created', 'Ngày tạo'), formatDate(document.createdAt)],
              [tr('Updated', 'Cập nhật'), formatDate(document.updatedAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="shrink-0 text-slate-500 dark:text-zinc-400">{label}</dt>
                <dd className="min-w-0 break-words text-right font-medium text-slate-800 dark:text-zinc-200">{value}</dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={onViewChunks} className="btn btn-primary btn-sm w-full gap-2 text-white">
            <Layers3 className="h-4 w-4" /> {tr('View chunks', 'Xem các chunk')}
          </button>
        </div>
      </section>
    </div>
  );
};
