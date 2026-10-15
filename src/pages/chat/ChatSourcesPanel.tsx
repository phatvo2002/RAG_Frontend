import { FileText, FolderOpen, X } from 'lucide-react';
import type { ChatSource } from '@/api/chat.api';
import { useApp } from '@/context/AppContext';

function fileType(fileName: string): string {
  return fileName.split('.').pop()?.toUpperCase() || 'FILE';
}

const typeColors: Record<string, string> = {
  PDF: 'bg-rose-600',
  DOC: 'bg-blue-600', DOCX: 'bg-blue-600',
  XLS: 'bg-emerald-600', XLSX: 'bg-emerald-600',
};

export function ChatSourcesPanel({ sources, selectedIndex, filter, open, onFilterChange, onSelect, onClose, onManageDocuments }: {
  sources: ChatSource[];
  selectedIndex: number;
  filter: string;
  open: boolean;
  onFilterChange: (filter: string) => void;
  onSelect: (index: number) => void;
  onClose: () => void;
  onManageDocuments: () => void;
}) {
  const { language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const types = [...new Set(sources.map(source => fileType(source.fileName)))];
  const activeFilter = filter === 'all' || types.includes(filter) ? filter : 'all';
  const indexedSources = sources.map((source, index) => ({ source, index }))
    .filter(item => activeFilter === 'all' || fileType(item.source.fileName) === activeFilter);
  const documents = [...new Map(indexedSources.map(item => [item.source.documentId, item])).values()];

  return <aside className={`${open ? 'flex' : 'hidden'} fixed inset-y-0 right-0 z-40 w-[min(360px,100vw)] flex-col border-l border-[#e1e8f3] bg-white shadow-xl min-[1180px]:static min-[1180px]:z-auto min-[1180px]:flex min-[1180px]:w-[330px] min-[1180px]:shadow-none`} aria-label={tr('Context and sources', 'Ngữ cảnh và nguồn tham khảo')}>
    <div className="flex items-center justify-between border-b border-[#e6ebf4] px-4 py-4 min-[1180px]:border-b-0 min-[1180px]:pb-2">
      <h2 className="text-[15px] font-bold text-[#102456]">{tr('Context & sources', 'Ngữ cảnh & nguồn')}</h2>
      <button type="button" onClick={onClose} aria-label={tr('Close sources', 'Đóng nguồn tham khảo')} className="rounded-md p-1 text-[#6073a2] hover:bg-[#f2f6fc] min-[1180px]:hidden"><X size={18} /></button>
    </div>

    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-5 text-xs">
      <section>
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6073a2]">{tr('Current context', 'Ngữ cảnh hiện tại')}</h3>
        <div className="flex items-center gap-2 rounded-md border border-[#dce5f2] px-3 py-2.5 font-semibold text-[#243653]"><FolderOpen size={17} className="text-[#1762f4]" />{tr('Accessible internal documents', 'Tài liệu nội bộ được phép truy cập')}</div>
        <p className="mt-2 leading-relaxed text-[#66799c]">{tr('The sources below support the selected answer and come from the knowledge base.', 'Các nguồn dưới đây thuộc câu trả lời đang chọn và được trả về từ kho tri thức.')}</p>
      </section>

      <section className="border-b border-[#e6ebf4] pb-4">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#6073a2]">{tr('Filter by file type', 'Lọc theo định dạng')}</h3>
        <div className="flex flex-wrap gap-1.5">
          {['all', ...types].map(type => <button key={type} type="button" onClick={() => onFilterChange(type)} aria-pressed={activeFilter === type}
            className={`rounded-md border px-2.5 py-1.5 font-medium ${activeFilter === type ? 'border-[#1762f4] bg-[#1762f4] text-white' : 'border-[#dce5f2] bg-white text-[#52678b] hover:bg-[#f2f6fc]'}`}>
            {type === 'all' ? tr('All', 'Tất cả') : type}
          </button>)}
        </div>
      </section>

      <section className="border-b border-[#e6ebf4] pb-4">
        <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-xs font-bold text-[#102456]">{tr('Related documents', 'Tài liệu liên quan')} ({documents.length})</h3><button type="button" onClick={onManageDocuments} className="font-medium text-[#1762f4] hover:underline">{tr('View all', 'Xem tất cả')}</button></div>
        {documents.length === 0 ? <p className="rounded-md border border-dashed border-[#dce5f2] p-3 leading-relaxed text-[#7d8eaa]">{tr('No reference documents for this answer.', 'Chưa có tài liệu tham chiếu cho câu trả lời này.')}</p>
          : <div className="space-y-2">{documents.map(({ source, index }) => {
            const type = fileType(source.fileName);
            return <button key={source.documentId} type="button" onClick={() => onSelect(index)} className="flex w-full items-center gap-2.5 rounded-md border border-[#e0e8f4] px-2.5 py-2 text-left hover:border-[#a9c7fa] hover:bg-[#f8fbff]">
              <span className={`flex h-7 w-8 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white ${typeColors[type] ?? 'bg-slate-600'}`}>{type.slice(0, 3)}</span>
              <span className="min-w-0 flex-1"><strong className="block truncate font-semibold text-[#243653]" title={source.fileName}>{source.fileName}</strong><span className="mt-0.5 block text-[11px] text-[#7d8eaa]">{source.pageNo != null ? `${tr('Page', 'Trang')} ${source.pageNo}` : tr('Document source', 'Nguồn tài liệu')}</span></span>
            </button>;
          })}</div>}
      </section>

      <section>
        <h3 className="mb-2 text-xs font-bold text-[#102456]">{tr('References', 'Nguồn tham chiếu')} ({indexedSources.length})</h3>
        {indexedSources.length === 0 ? <p className="text-[#7d8eaa]">{tr('Citations will appear when AI answers from documents.', 'Nguồn trích dẫn sẽ xuất hiện khi AI trả lời từ tài liệu.')}</p>
          : <div className="space-y-2">{indexedSources.map(({ source, index }) => <button key={`${source.chunkId}-${index}`} type="button" onClick={() => onSelect(index)}
            className={`w-full rounded-md border p-2.5 text-left ${selectedIndex === index ? 'border-[#80aaff] bg-[#f0f6ff]' : 'border-[#e0e8f4] hover:border-[#a9c7fa]'}`}>
            <span className="flex items-start gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#1762f4] text-[10px] font-bold text-white">{index + 1}</span><span className="min-w-0"><strong className="block truncate font-semibold text-[#243653]" title={source.fileName}>{source.fileName}</strong><span className="mt-1 block text-[11px] text-[#7d8eaa]">{source.pageNo != null ? `${tr('Page', 'Trang')} ${source.pageNo}` : tr('Location in document', 'Vị trí trong tài liệu')} · {tr('Similarity score', 'Điểm tương đồng')} {source.score.toFixed(3)}</span></span></span>
            {selectedIndex === index && source.charStart != null && source.charEnd != null && <span className="mt-2 block border-t border-[#dce5f2] pt-2 text-[11px] text-[#6073a2]">{tr('Characters', 'Ký tự')} {source.charStart}–{source.charEnd}</span>}
          </button>)}</div>}
      </section>
    </div>

    <div className="border-t border-[#e6ebf4] p-4"><button type="button" onClick={onManageDocuments} className="flex w-full items-center justify-center gap-2 rounded-md border border-[#dce5f2] px-3 py-2.5 text-xs font-semibold text-[#243653] hover:bg-[#f7faff]"><FileText size={16} />{tr('Manage documents', 'Quản lý tài liệu')}</button></div>
  </aside>;
}
