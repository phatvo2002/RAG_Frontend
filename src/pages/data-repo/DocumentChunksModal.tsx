import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy, Layers3, RefreshCw } from 'lucide-react';
import { DocumentChunkItem, DocumentListItem, useDocumentChunksQuery } from '@/api/documents.api';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';

interface DocumentChunksModalProps {
  document: DocumentListItem;
  onClose: () => void;
}

export const DocumentChunksModal: React.FC<DocumentChunksModalProps> = ({ document, onClose }) => {
  const { language, showToast } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const [page, setPage] = useState(1);
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'map' | 'detail'>('map');
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);
  const { data, isLoading, isError, error, refetch } = useDocumentChunksQuery(document.documentId, page);
  const chunks = data?.items ?? [];
  const selectedChunk = chunks.find((chunk) => chunk.chunkId === selectedChunkId) ?? chunks[0];
  const lengths = chunks.map((chunk) => chunk.text.length);
  const averageLength = lengths.length ? Math.round(lengths.reduce((sum, length) => sum + length, 0) / lengths.length) : 0;
  const minLength = lengths.length ? Math.min(...lengths) : 0;
  const maxLength = lengths.length ? Math.max(...lengths) : 0;

  const copyChunk = async (chunk: DocumentChunkItem) => {
    try {
      await navigator.clipboard.writeText(chunk.text);
      setCopiedChunkId(chunk.chunkId);
      showToast(tr(`Copied chunk ${chunk.ordinal + 1}.`, `Đã sao chép chunk ${chunk.ordinal + 1}.`), 'success');
    } catch {
      showToast(tr('Could not copy this chunk.', 'Không thể sao chép chunk này.'), 'error');
    }
  };

  const selectChunk = (chunkId: string) => {
    setSelectedChunkId(chunkId);
    setCopiedChunkId(null);
    setMobileTab('detail');
  };

  return (
    <Modal isOpen onClose={onClose} title={tr(`Chunks · ${document.originalFileName || document.title}`, `Các chunk · ${document.originalFileName || document.title}`)} maxWidth="7xl" className="flex h-[92vh] max-h-[850px] flex-col">
      <div className="flex h-full min-h-0 flex-col gap-4 text-xs">
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-800/30 sm:grid-cols-4">
          {[
            [tr('Total chunks', 'Tổng số chunk'), data?.totalCount ?? 0],
            [tr('Average on this page', 'Trung bình trang này'), averageLength],
            [tr('Shortest on this page', 'Ngắn nhất trang này'), minLength],
            [tr('Longest on this page', 'Dài nhất trang này'), maxLength],
          ].map(([label, value], index) => (
            <div key={label} className="min-w-0 sm:border-r sm:border-slate-200 sm:last:border-r-0 dark:sm:border-zinc-700">
              <p className="truncate text-[11px] text-slate-500 dark:text-zinc-400" title={String(label)}>{label}</p>
              <p className="mt-1 font-semibold text-blue-600 dark:text-blue-400">
                {value}{index > 0 && <span className="ml-1 text-[10px] font-normal text-slate-500 dark:text-zinc-400">{tr('chars', 'ký tự')}</span>}
              </p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-slate-500 dark:text-zinc-400"><RefreshCw className="h-4 w-4 animate-spin" /> {tr('Loading chunks...', 'Đang tải các chunk...')}</div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-rose-600 dark:text-rose-400">{error instanceof Error ? error.message : tr('Could not load chunks.', 'Không thể tải chunk.')}</p>
            <button type="button" onClick={() => refetch()} className="btn btn-sm btn-outline">{tr('Retry', 'Thử lại')}</button>
          </div>
        ) : chunks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-slate-500 dark:text-zinc-400">
            <Layers3 className="h-6 w-6 text-slate-400" />
            <p>{tr('No chunks are available for this document yet.', 'Tài liệu này chưa có chunk để hiển thị.')}</p>
            {document.processingStatus !== 'READY' && <p>{tr('The document may still be processing.', 'Tài liệu có thể vẫn đang được xử lý.')}</p>}
          </div>
        ) : (
          <>
            <div className="flex gap-2 border-b border-slate-200 pb-2 dark:border-zinc-800 md:hidden">
              <button type="button" onClick={() => setMobileTab('map')} aria-pressed={mobileTab === 'map'} className={`btn btn-xs ${mobileTab === 'map' ? 'btn-primary text-white' : 'btn-ghost'}`}>{tr('Chunk map', 'Bản đồ chunk')}</button>
              <button type="button" onClick={() => setMobileTab('detail')} aria-pressed={mobileTab === 'detail'} className={`btn btn-xs ${mobileTab === 'detail' ? 'btn-primary text-white' : 'btn-ghost'}`}>{tr('Selected chunk', 'Chunk đã chọn')}</button>
            </div>
            <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
              <section className={`${mobileTab === 'map' ? 'flex' : 'hidden'} min-h-0 flex-col rounded-lg border border-slate-200 dark:border-zinc-800 md:flex`} aria-label={tr('Chunk map', 'Bản đồ chunk')}>
                <div className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-800 dark:border-zinc-800 dark:text-zinc-200">{tr('Chunk map', 'Bản đồ chunk')} <span className="ml-1 font-normal text-slate-400">· {tr('current page', 'trang hiện tại')}</span></div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
                  {chunks.map((chunk, index) => (
                    <div key={chunk.chunkId} className={`rounded-lg border p-2.5 transition-colors ${selectedChunk?.chunkId === chunk.chunkId ? 'border-blue-400 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-950/30' : index % 2 === 0 ? 'border-slate-200 bg-slate-50/70 dark:border-zinc-800 dark:bg-zinc-800/40' : 'border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'}`}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <button type="button" onClick={() => selectChunk(chunk.chunkId)} className="text-left font-semibold text-blue-700 hover:underline dark:text-blue-400" aria-label={tr(`View chunk ${chunk.ordinal + 1}`, `Xem chunk ${chunk.ordinal + 1}`)}>{tr('Chunk', 'Chunk')} {chunk.ordinal + 1}</button>
                        <button type="button" onClick={() => copyChunk(chunk)} className="rounded p-1 text-slate-500 hover:bg-slate-200 dark:text-zinc-400 dark:hover:bg-zinc-700" aria-label={tr(`Copy chunk ${chunk.ordinal + 1}`, `Sao chép chunk ${chunk.ordinal + 1}`)}>{copiedChunkId === chunk.chunkId ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</button>
                      </div>
                      <button type="button" onClick={() => selectChunk(chunk.chunkId)} className="block w-full whitespace-pre-wrap break-words text-left leading-5 text-slate-700 dark:text-zinc-300">{chunk.text}</button>
                    </div>
                  ))}
                </div>
              </section>

              <section className={`${mobileTab === 'detail' ? 'flex' : 'hidden'} min-h-0 flex-col rounded-lg border border-slate-200 dark:border-zinc-800 md:flex`} aria-label={tr('Selected chunk details', 'Chi tiết chunk đã chọn')}>
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 dark:border-zinc-800">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200">{tr('Chunk', 'Chunk')} {selectedChunk.ordinal + 1}</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">{selectedChunk.text.length} {tr('characters', 'ký tự')}{selectedChunk.charStart != null && selectedChunk.charEnd != null ? ` · ${tr('Position', 'Vị trí')} ${selectedChunk.charStart}–${selectedChunk.charEnd}` : ''}{selectedChunk.pageNo != null ? ` · ${tr('Page', 'Trang')} ${selectedChunk.pageNo}` : ''}</p>
                  </div>
                  <button type="button" onClick={() => copyChunk(selectedChunk)} className="btn btn-xs btn-outline gap-1.5" aria-label={tr('Copy selected chunk', 'Sao chép chunk đã chọn')}><Copy className="h-3.5 w-3.5" /> {tr('Copy', 'Sao chép')}</button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                  <p className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-700 dark:text-zinc-300">{selectedChunk.text}</p>
                </div>
              </section>
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
          <span>{tr('Page', 'Trang')} {data?.page ?? page} / {Math.max(1, data?.totalPages ?? 0)}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setPage((value) => Math.max(1, value - 1)); setMobileTab('map'); }} disabled={page <= 1 || isLoading} className="btn btn-xs btn-outline" aria-label={tr('Previous page', 'Trang trước')}><ChevronLeft className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => { setPage((value) => value + 1); setMobileTab('map'); }} disabled={!data || page >= data.totalPages || isLoading} className="btn btn-xs btn-outline" aria-label={tr('Next page', 'Trang sau')}><ChevronRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
