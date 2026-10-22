import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi, documentsQueryKeys } from '@/api/documents.api';
import type { DocumentProgressItem } from '@/api/documents.api';
import { useApp } from '@/context/AppContext';
import { ConfirmModal } from '@/components/disclosure';

const isActive = (item: DocumentProgressItem) =>
  item.processingStatus !== 'FAILED' && item.processingStatus !== 'STOPPED' && item.failureCode !== 'REINDEX_FAILED' &&
  (item.processingStatus !== 'READY' || item.reindexing || item.indexStatus === 'BUILDING');

export const DocumentProcessingProgress: React.FC<{ enabled: boolean; documentId?: string | null }> = ({ enabled, documentId }) => {
  const { language, showToast } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const queryClient = useQueryClient();
  const [stopTarget, setStopTarget] = useState<DocumentProgressItem | null>(null);
  const stopMutation = useMutation({
    mutationFn: documentsApi.stop,
    onSuccess: async () => {
      setStopTarget(null);
      showToast(tr('Stop requested.', 'Đã yêu cầu dừng xử lý.'), 'success');
      await queryClient.invalidateQueries({ queryKey: documentsQueryKeys.progress() });
    },
    onError: (error) => showToast(error instanceof Error ? error.message : tr('Could not stop processing.', 'Không thể dừng xử lý.'), 'error'),
  });
  const restartMutation = useMutation({
    mutationFn: documentsApi.restart,
    onSuccess: async () => {
      showToast(tr('Processing restarted.', 'Đã bắt đầu xử lý lại.'), 'success');
      await queryClient.invalidateQueries({ queryKey: documentsQueryKeys.progress() });
      await queryClient.invalidateQueries({ queryKey: documentsQueryKeys.lists() });
    },
    onError: (error) => showToast(error instanceof Error ? error.message : tr('Could not restart processing.', 'Không thể xử lý lại.'), 'error'),
  });
  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: documentsQueryKeys.progress(),
    queryFn: documentsApi.getProgress,
    enabled,
    refetchInterval: (query) => {
      const current = query.state.data as DocumentProgressItem[] | undefined;
      return enabled && (!current || current.some((item) => (!documentId || item.documentId === documentId) && isActive(item))) ? 5000 : false;
    },
  });

  if (isLoading) return <p className="py-4 text-slate-500">{tr('Loading progress...', 'Đang tải tiến trình...')}</p>;
  if (isError) return <button type="button" onClick={() => refetch()} className="py-4 text-rose-600">
    {tr('Could not load progress. Retry', 'Không tải được tiến trình. Thử lại')}
  </button>;
  const visibleItems = documentId ? items.filter((item) => item.documentId === documentId) : items;
  if (visibleItems.length === 0) return <p className="py-4 text-slate-500">
    {documentId ? tr('No processing progress available for this document.', 'Chưa có tiến trình xử lý cho tài liệu này.') : tr('No documents yet.', 'Chưa có tài liệu.')}
  </p>;

  return <div className="space-y-3" aria-live="polite">
    {visibleItems.map((item) => {
      const chunking = item.processingStatus === 'CHUNKING' ? item.chunkingProgress : null;
      const chunkingPercentage = chunking && chunking.phase !== 'BUILDING' && chunking.total > 0
        ? Math.min(100, Math.max(0, Math.round(chunking.completed / chunking.total * 100)))
        : null;
      const percentage = item.processingStatus === 'CHUNKING' ? chunkingPercentage : item.totalChunks > 0
        ? Math.min(100, Math.max(0, Math.round(item.indexedChunks / item.totalChunks * 100))) : null;
      const chunkingDetail = chunking?.phase === 'ANALYZING'
        ? tr(`Semantic analysis: ${chunking.completed}/${chunking.total} sentences embedded`,
            `Phân tích ngữ nghĩa: đã tạo embedding ${chunking.completed}/${chunking.total} câu`)
        : chunking?.phase === 'BUILDING'
          ? tr('Finding chunk boundaries', 'Đang xác định ranh giới chunk')
          : chunking?.phase === 'SAVING'
            ? tr(`Writing chunks: ${chunking.completed}/${chunking.total}`,
                `Đang ghi chunk: ${chunking.completed}/${chunking.total}`)
            : tr('Preparing chunk analysis', 'Đang chuẩn bị phân tích chunk');
      const complete = item.processingStatus === 'READY' && !item.reindexing && item.indexStatus === 'ACTIVE';
      const failed = item.processingStatus === 'FAILED' || item.failureCode === 'REINDEX_FAILED';
      const stage = item.failureCode === 'REINDEX_FAILED'
        ? tr('Reindexing failed', 'Lập lại chỉ mục thất bại')
        : item.processingStatus === 'STOPPING'
          ? tr('Stopping...', 'Đang dừng...')
          : item.processingStatus === 'STOPPED'
            ? tr('Stopped', 'Đã dừng')
        : item.waitingForQuota
        ? tr('Waiting for embedding quota', 'Đang chờ hạn mức embedding')
        : item.reindexing
          ? tr(`Reindexing with ${item.provider}`, `Đang lập lại chỉ mục bằng ${item.provider}`)
          : item.processingStatus === 'READY' && item.indexStatus === 'BUILDING'
            ? tr('Waiting for index switch', 'Đang chờ chuyển chỉ mục')
          : item.processingStatus === 'FAILED'
            ? tr('Processing failed', 'Xử lý thất bại')
            : complete
              ? tr('Completed', 'Hoàn tất')
              : item.processingStatus === 'QUEUED'
                ? tr('Queued', 'Đang xếp hàng')
                : item.processingStatus === 'EXTRACTING'
                  ? tr('Extracting text', 'Đang trích xuất văn bản')
                  : item.processingStatus === 'CHUNKING'
                    ? tr('Splitting into chunks', 'Đang chia chunk')
                    : tr('Indexing', 'Đang lập chỉ mục');
      return <div key={item.versionId} className="rounded-xl border border-[var(--nexora-border)] bg-[var(--nexora-surface)] p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate font-semibold text-[var(--nexora-ink)]" title={item.fileName}>{item.fileName}</div>
            <div className="mt-1 text-[var(--nexora-ink-muted)]">{item.provider}</div>
          </div>
          {percentage !== null && <span className={`shrink-0 text-2xl font-bold leading-none tabular-nums ${failed ? 'text-[var(--nexora-danger)]' : complete ? 'text-[var(--nexora-success)]' : 'text-[var(--nexora-accent)]'}`}>
            {percentage}%
          </span>}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[var(--nexora-ink-muted)]">
          <span className={failed ? 'font-medium text-[var(--nexora-danger)]' : complete ? 'font-medium text-[var(--nexora-success)]' : 'font-medium text-[var(--nexora-ink)]'}>{stage}</span>
          {item.totalChunks > 0 && item.processingStatus !== 'CHUNKING' && <span className="tabular-nums">{item.indexedChunks}/{item.totalChunks} chunk</span>}
        </div>
        {item.processingStatus === 'CHUNKING' &&
          <p className="mt-1 text-[var(--nexora-ink-muted)]">{chunkingDetail}</p>}
        {(percentage !== null || item.processingStatus === 'CHUNKING') &&
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--nexora-accent-soft)]"
            role="progressbar" aria-label={`${item.fileName}: ${item.processingStatus === 'CHUNKING' ? chunkingDetail : stage}`}
            aria-valuemin={percentage === null ? undefined : 0} aria-valuemax={percentage === null ? undefined : 100}
            aria-valuenow={percentage === null ? undefined : percentage}>
            <div className={`h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none ${percentage === null ? 'w-1/3 animate-pulse bg-[var(--nexora-accent)]' : failed ? 'bg-[var(--nexora-danger)]' : complete ? 'bg-[var(--nexora-success)]' : 'bg-[var(--nexora-accent)]'}`}
              style={percentage === null ? undefined : { width: `${percentage}%` }} />
          </div>}
        {failed && item.failureCode &&
          <p className="mt-2 text-[var(--nexora-danger)]">{item.failureCode}</p>}
        {(['QUEUED', 'EXTRACTING', 'CHUNKING', 'INDEXING'].includes(item.processingStatus) && !item.reindexing) &&
          <button type="button" onClick={() => setStopTarget(item)} disabled={stopMutation.isPending}
            className="mt-3 rounded-md border border-[var(--nexora-danger)] px-3 py-1.5 text-sm text-[var(--nexora-danger)] disabled:opacity-50">
            {tr('Stop', 'Dừng')}
          </button>}
        {item.processingStatus === 'STOPPED' &&
          <button type="button" onClick={() => restartMutation.mutate(item.documentId)} disabled={restartMutation.isPending}
            className="mt-3 rounded-md border border-[var(--nexora-accent)] px-3 py-1.5 text-sm text-[var(--nexora-accent)] disabled:opacity-50">
            {tr('Process again', 'Xử lý lại')}
          </button>}
      </div>;
    })}
    <ConfirmModal isOpen={Boolean(stopTarget)} onClose={() => setStopTarget(null)}
      onConfirm={() => { if (stopTarget) stopMutation.mutate(stopTarget.documentId); }}
      isLoading={stopMutation.isPending}
      title={tr('Stop processing', 'Dừng xử lý')}
      message={stopTarget ? tr(`Stop processing "${stopTarget.fileName}"? The original file will be kept.`,
        `Dừng xử lý "${stopTarget.fileName}"? File gốc sẽ được giữ lại.`) : ''}
      confirmText={tr('Stop processing', 'Dừng xử lý')} />
  </div>;
};
