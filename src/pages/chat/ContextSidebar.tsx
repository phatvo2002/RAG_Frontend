import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  RotateCcw,
  MoreHorizontal,
  ChevronDown,
  FileText,
  X,
  ExternalLink
} from 'lucide-react';

export const ContextSidebar: React.FC = () => {
  const { projects, documents, showToast } = useApp();
  const [selectedContext, setSelectedContext] = useState('Dự án NEXORA Platform');
  const [activeCategory, setActiveCategory] = useState<'all' | 'doc' | 'meeting' | 'task'>('all');

  const sources = [
    {
      id: 1,
      title: 'Báo cáo tiến độ dự án.pdf',
      meta: 'Trang 3 • Cập nhật 16/05/2024',
      snippet: 'Tiến độ tổng thể của dự án đạt 68% với các hạng mục chính...'
    },
    {
      id: 2,
      title: 'Biên bản họp 14-05.docx',
      meta: 'Trang 2 • Cập nhật 14/05/2024',
      snippet: 'Thống nhất ưu tiên hoàn thành Dashboard phiên bản beta...'
    },
    {
      id: 3,
      title: 'Kế hoạch dự án Phase 2.xlsx',
      meta: 'Sheet: Tiến độ • Cập nhật 10/05/2024',
      snippet: 'Bảng kế hoạch và phân bổ nguồn lực cho Phase 2...'
    }
  ];

  return (
    <aside className="w-80 bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 flex flex-col h-full overflow-y-auto shrink-0 select-none text-xs transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Ngữ cảnh & nguồn</h3>
        <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-500">
          <button
            onClick={() => showToast('Cập nhật ngữ cảnh', 'info')}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => showToast('Tùy chọn ngữ cảnh', 'info')}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Ngữ cảnh hiện tại Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Ngữ cảnh hiện tại
          </label>
          <div className="relative">
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-xs font-semibold text-slate-800 dark:text-zinc-100 appearance-none focus:outline-none focus:border-blue-600"
            >
              {projects.map((p) => (
                <option key={p.id} value={`Dự án ${p.name}`}>
                  Dự án {p.name}
                </option>
              ))}
              <option value="Toàn bộ công ty">Toàn bộ công ty</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed pt-0.5">
            Bao gồm tài liệu, cuộc họp và dữ liệu liên quan đến {selectedContext}.
          </p>
        </div>

        {/* Bộ lọc theo loại */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
            Bộ lọc theo loại
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'doc', label: 'Tài liệu' },
              { id: 'meeting', label: 'Cuộc họp' },
              { id: 'task', label: 'Công việc' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as typeof activeCategory)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tài liệu đang hoạt động */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-zinc-200">
              Tài liệu đang hoạt động ({documents.length})
            </span>
            <button
              onClick={() => showToast('Xem tất cả tài liệu ngữ cảnh', 'info')}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-[11px] cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-2">
            {documents.slice(0, 3).map((doc) => {
              const fileTypeColor =
                doc.type === 'pdf'
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                  : doc.type === 'xlsx'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300';

              return (
                <div
                  key={doc.id}
                  className="p-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded flex items-center justify-between group hover:border-blue-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className={`p-1.5 rounded text-[10px] font-bold uppercase shrink-0 ${fileTypeColor}`}>
                      {doc.type}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                        {doc.type.toUpperCase()} • Cập nhật {(doc.updatedAt || doc.uploadedAt || '').split(' ')[0]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Chi tiết tài liệu ${doc.name}`, 'info')}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nguồn tham chiếu */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-zinc-200">Nguồn tham chiếu</span>
          </div>

          <div className="space-y-2.5">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-2.5 bg-slate-50/80 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded space-y-1 hover:border-blue-300 dark:hover:border-zinc-700 transition-colors cursor-pointer"
                onClick={() => showToast(`Mở trích dẫn từ ${src.title}`, 'info')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 truncate pr-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{src.title}</span>
                  </span>
                  <span className="w-4 h-4 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {src.id}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{src.meta}</p>
                <p className="text-[11px] text-slate-600 dark:text-zinc-300 italic line-clamp-2 bg-white/60 dark:bg-zinc-800/80 p-1.5 rounded border border-slate-100 dark:border-zinc-750">
                  "{src.snippet}"
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => showToast('Hiển thị tất cả 4 nguồn tham chiếu', 'info')}
            className="w-full text-center py-2 text-blue-600 dark:text-blue-400 hover:underline font-semibold text-xs pt-1 cursor-pointer"
          >
            Xem tất cả nguồn (4)
          </button>
        </div>
      </div>
    </aside>
  );
};
export default ContextSidebar;
