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
    <aside className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-y-auto shrink-0 select-none text-xs">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 text-sm">Ngữ cảnh & nguồn</h3>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => showToast('Cập nhật ngữ cảnh', 'info')}
            className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => showToast('Tùy chọn ngữ cảnh', 'info')}
            className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Ngữ cảnh hiện tại Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Ngữ cảnh hiện tại
          </label>
          <div className="relative">
            <select
              value={selectedContext}
              onChange={(e) => setSelectedContext(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:border-blue-600"
            >
              {projects.map((p) => (
                <option key={p.id} value={`Dự án ${p.name}`}>
                  Dự án {p.name}
                </option>
              ))}
              <option value="Toàn bộ công ty">Toàn bộ công ty</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-0.5">
            Bao gồm tài liệu, cuộc họp và dữ liệu liên quan đến {selectedContext}.
          </p>
        </div>

        {/* Bộ lọc theo loại */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
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
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tài liệu đang hoạt động */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">
              Tài liệu đang hoạt động ({documents.length})
            </span>
            <button
              onClick={() => showToast('Xem tất cả tài liệu ngữ cảnh', 'info')}
              className="text-blue-600 hover:underline font-medium text-[11px] cursor-pointer"
            >
              Xem tất cả
            </button>
          </div>

          <div className="space-y-2">
            {documents.slice(0, 3).map((doc) => {
              const fileTypeColor =
                doc.type === 'pdf'
                  ? 'bg-rose-100 text-rose-700'
                  : doc.type === 'xlsx'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-blue-100 text-blue-700';

              return (
                <div
                  key={doc.id}
                  className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between group hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className={`p-1.5 rounded-lg text-[10px] font-bold uppercase shrink-0 ${fileTypeColor}`}>
                      {doc.type}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{doc.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {doc.type.toUpperCase()} • Cập nhật {(doc.updatedAt || doc.uploadedAt || '').split(' ')[0]}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => showToast(`Chi tiết tài liệu ${doc.name}`, 'info')}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nguồn tham chiếu */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800">Nguồn tham chiếu</span>
          </div>

          <div className="space-y-2.5">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-2.5 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-1 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => showToast(`Mở trích dẫn từ ${src.title}`, 'info')}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 truncate pr-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>{src.title}</span>
                  </span>
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {src.id}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{src.meta}</p>
                <p className="text-[11px] text-slate-600 italic line-clamp-2 bg-white/60 p-1.5 rounded-lg border border-slate-100">
                  "{src.snippet}"
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => showToast('Hiển thị tất cả 4 nguồn tham chiếu', 'info')}
            className="w-full text-center py-2 text-blue-600 hover:underline font-semibold text-xs pt-1 cursor-pointer"
          >
            Xem tất cả nguồn (4)
          </button>
        </div>
      </div>
    </aside>
  );
};
export default ContextSidebar;

