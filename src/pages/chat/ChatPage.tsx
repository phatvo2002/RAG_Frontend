import React, { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useNavigate } from '@tanstack/react-router';
import {
  Sparkles,
  Paperclip,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  CheckCircle2,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronDown,
  FolderKanban,
  CheckSquare,
  Users2,
  LayoutDashboard,
  ShieldCheck,
  FileSpreadsheet,
  ExternalLink,
  MessageSquare,
  Clock,
  History,
} from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  time: string;
  group: 'HÔM NAY' | '25/05/2024';
}

const mockSessions: ChatSession[] = [
  { id: 's1', title: 'Tóm tắt tiến độ dự án ERP', time: '10:24', group: 'HÔM NAY' },
  { id: 's2', title: 'Báo cáo rủi ro tuần 21', time: '09:12', group: 'HÔM NAY' },
  { id: 's3', title: 'Tiến độ triển khai Data Warehouse', time: '08:45', group: 'HÔM NAY' },
  { id: 's4', title: 'Chuẩn hóa dữ liệu khách hàng', time: 'Hôm qua', group: 'HÔM NAY' },
  { id: 's5', title: 'Kế hoạch đào tạo người dùng', time: 'Hôm qua', group: 'HÔM NAY' },
  { id: 's6', title: 'Ngân sách dự án ERP', time: '25/05', group: '25/05/2024' },
  { id: 's7', title: 'Danh sách nhà cung cấp', time: '25/05', group: '25/05/2024' },
];

export const ChatPage: React.FC = () => {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState('s1');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [activeContextFilter, setActiveContextFilter] = useState<'all' | 'doc' | 'meeting' | 'task'>('all');
  const [contextProject, setContextProject] = useState('Dự án NEXORA Platform');
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    showToast('Đã gửi câu hỏi tới NEXORA AI', 'info');
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="nexora-chat flex-1 flex flex-col h-full bg-[#0d131f] text-slate-100 overflow-hidden select-none">
      
      {/* 3-Column Standalone Workspace matching 02-ai-assistant-standalone.png */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ==================================================================== */}
        {/* 1. LEFT COLUMN: Chat History Sidebar (260px) */}
        {/* ==================================================================== */}
        <aside className="hidden md:flex w-64 bg-[#090d16] border-r border-slate-800/80 flex-col h-full shrink-0">
          
          {/* Header Action: Dashboard Switcher */}
          <div className="p-3.5 space-y-2.5 border-b border-slate-800/80">
            <button
              onClick={() => navigate({ to: '/dashboard' as any })}
              className="w-full py-2 px-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              <span>Dashboard Quản lý</span>
            </button>

            <button
              onClick={() => showToast('Đã tạo đoạn chat mới', 'success')}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs shadow-blue-500/20 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Đoạn chat mới</span>
            </button>

            {/* Search Input */}
            <div className="relative flex items-center pt-1">
              <input
                type="text"
                placeholder="Tìm đoạn chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-[#121826] border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
              <SlidersHorizontal className="w-3 h-3 text-slate-500 absolute right-2.5 cursor-pointer hover:text-slate-300" />
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
            
            {/* Group: HÔM NAY */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block">
                HÔM NAY
              </span>
              {mockSessions
                .filter((s) => s.group === 'HÔM NAY')
                .map((session) => {
                  const isActive = activeSessionId === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setActiveSessionId(session.id)}
                      className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#152033] text-blue-400 font-semibold border border-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="truncate flex-1 pr-2 text-xs">{session.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{session.time}</span>
                    </div>
                  );
                })}
            </div>

            {/* Group: 25/05/2024 */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block">
                25/05/2024
              </span>
              {mockSessions
                .filter((s) => s.group === '25/05/2024')
                .map((session) => {
                  const isActive = activeSessionId === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setActiveSessionId(session.id)}
                      className={`p-2.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#152033] text-blue-400 font-semibold border border-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="truncate flex-1 pr-2 text-xs">{session.title}</span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{session.time}</span>
                    </div>
                  );
                })}
            </div>

          </div>

          {/* Footer: Xem tất cả hội thoại */}
          <div className="p-3 border-t border-slate-800/80">
            <button
              onClick={() => showToast('Mở lịch sử tất cả cuộc hội thoại', 'info')}
              className="w-full py-2 px-3 hover:bg-slate-900 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Xem tất cả hội thoại</span>
            </button>
          </div>
        </aside>

        {/* ==================================================================== */}
        {/* 2. MIDDLE COLUMN: Main Chat Messages & Floating Input */}
        {/* ==================================================================== */}
        <main className="flex-1 flex flex-col h-full min-w-0 bg-[#0a0e17] overflow-hidden">
          
          {/* Header Bar */}
          <div className="h-14 px-3 sm:px-5 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-[#0c121d]">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2 truncate">
                <span>Trợ lý AI NEXORA</span>
              </h2>
              <button
                onClick={() => navigate({ to: '/dashboard' as any })}
                className="hidden lg:flex px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-xs font-medium items-center gap-1.5 cursor-pointer shrink-0"
              >
                <LayoutDashboard className="w-3 h-3 text-blue-400" />
                <span>Vào Dashboard Quản lý</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs shrink-0">
              <span className="text-slate-400">VN</span>
              <span className="text-slate-400">☀</span>
              <span className="text-slate-400">🔔 3</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  AD
                </div>
                <span className="font-semibold text-slate-200">Admin</span>
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6 max-w-4xl w-full mx-auto">
            
            {/* User Message Bubble */}
            <div className="bg-[#121927] border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-400">Bạn</span>
                <span className="text-[11px] font-mono text-slate-500">10:24</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Tóm tắt tiến độ dự án ERP và các rủi ro cần xử lý trong tuần này.
              </p>
            </div>

            {/* AI Assistant Message Bubble matching 02-ai-assistant-standalone.png */}
            <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  NEXORA AI
                </span>
                <span className="text-[11px] font-mono text-slate-500">10:24</span>
              </div>

              {/* Section 1: Tóm tắt tiến độ */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-100 text-sm">Tóm tắt tiến độ dự án ERP</h4>
                <ul className="space-y-1.5 text-slate-300 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>Dự án ERP Nexora đang ở tuần 21/32 (65% tiến độ tổng thể).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>Các phân hệ chính đã hoàn thành: Quản trị hệ thống, Tài chính – Kế toán, Mua hàng.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>Đang triển khai & kiểm thử: Bán hàng, Kho, Sản xuất. Tiến độ đúng kế hoạch tổng thể.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>
                      Dữ liệu đã làm sạch & chuẩn hóa đạt 78%.{' '}
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
                        1
                      </span>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Section 2: 3 rủi ro ưu tiên cần xử lý */}
              <div className="space-y-2.5 text-xs pt-1">
                <h4 className="font-bold text-slate-100 text-sm">3 rủi ro ưu tiên cần xử lý</h4>
                
                <div className="space-y-2">
                  <div className="p-2.5 bg-[#172133] rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        ❶ Rủi ro dữ liệu không đồng nhất ở phân hệ Kho và Bán hàng.
                      </span>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
                        1
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4">
                      Ảnh hưởng: Chậm kiểm thử tích hợp. Mức độ:{' '}
                      <strong className="text-rose-400 font-semibold">Cao</strong>.
                    </p>
                  </div>

                  <div className="p-2.5 bg-[#172133] rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        ❷ Thiếu nhân sự kiểm thử tích hợp (UAT) trong tuần 21–22.
                      </span>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
                        2
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4">
                      Ảnh hưởng: Trễ kiểm thử người dùng. Mức độ:{' '}
                      <strong className="text-rose-400 font-semibold">Cao</strong>.
                    </p>
                  </div>

                  <div className="p-2.5 bg-[#172133] rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        ❸ Hệ thống báo cáo hiện tại chưa đáp ứng đầy đủ yêu cầu quản trị.
                      </span>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
                        3
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4">
                      Ảnh hưởng: Phát sinh thêm yêu cầu thay đổi. Mức độ:{' '}
                      <strong className="text-amber-400 font-semibold">Trung bình</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Hành động đề xuất trong tuần này */}
              <div className="space-y-2 text-xs pt-1">
                <h4 className="font-bold text-slate-100 text-sm">Hành động đề xuất trong tuần này</h4>
                <ul className="space-y-1.5 text-slate-300 pl-2">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>Hoàn tất chuẩn hóa & đồng bộ dữ liệu Kho, Bán hàng trước 31/05.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>Bổ sung 02 kiểm thử viên cho UAT và chốt kịch bản kiểm thử.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>Rà soát & ưu tiên các yêu cầu báo cáo bắt buộc theo từng phòng ban.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span>Tổ chức họp đánh giá rủi ro & tiến độ vào cuối tuần.</span>
                  </li>
                </ul>
              </div>

              {/* Attached Docs Bar */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-medium">Tài liệu đính kèm:</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md flex items-center gap-1.5 border border-slate-700/60 font-mono text-[11px]">
                  <span className="px-1 py-0.2 bg-rose-500/20 text-rose-400 rounded text-[9px] font-bold">PDF</span>
                  Báo cáo tiến độ dự án.pdf
                </span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md flex items-center gap-1.5 border border-slate-700/60 font-mono text-[11px]">
                  <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">XLSX</span>
                  Kế hoạch dự án Phase 2.xlsx
                </span>
                <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md flex items-center gap-1.5 border border-slate-700/60 font-mono text-[11px]">
                  <span className="px-1 py-0.2 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold">DOCX</span>
                  Biên bản họp 14-05.docx
                </span>
              </div>

              {/* Feedback Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-3 text-xs text-slate-400">
                <span>Phản hồi này có hữu ích?</span>
                <button
                  onClick={() => {
                    setFeedback('up');
                    showToast('Cảm ơn bạn đã gửi phản hồi tích cực!', 'success');
                  }}
                  className={`p-1 rounded hover:bg-slate-800 cursor-pointer ${
                    feedback === 'up' ? 'text-emerald-400' : ''
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setFeedback('down');
                    showToast('Cảm ơn bạn đã phản hồi, hệ thống sẽ cải thiện!', 'info');
                  }}
                  className={`p-1 rounded hover:bg-slate-800 cursor-pointer ${
                    feedback === 'down' ? 'text-rose-400' : ''
                  }`}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

          {/* Floating Input Box Bar matching 02-ai-assistant-standalone.png */}
          <div className="p-2 sm:p-4 bg-[#0c121d] border-t border-slate-800/80 shrink-0">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="bg-[#151e2e] border border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg">
                <textarea
                  rows={1}
                  placeholder="Hỏi về dữ liệu nội bộ..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-none text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none flex-1 resize-none leading-relaxed"
                />
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => showToast('Mở hộp thoại đính kèm tài liệu', 'info')}
                    className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Đính kèm</span>
                  </button>
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi</span>
                  </button>
                </div>
              </div>

              {/* Security Statement */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>NEXORA AI chỉ sử dụng dữ liệu nội bộ được ủy quyền. Cam kết không lưu trữ hội thoại ngoài hệ thống.</span>
              </div>
            </div>
          </div>

        </main>

        {/* ==================================================================== */}
        {/* 3. RIGHT COLUMN: Ngữ Cảnh & Nguồn (320px) */}
        {/* ==================================================================== */}
        <aside className="hidden xl:flex w-80 bg-[#090d16] border-l border-slate-800/80 flex-col h-full shrink-0 overflow-y-auto text-xs p-5 space-y-6">
          
          {/* Header */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
              Ngữ cảnh & nguồn
            </h3>
            
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">NGỮ CẢNH HIỆN TẠI</span>
              <div className="relative">
                <select
                  value={contextProject}
                  onChange={(e) => setContextProject(e.target.value)}
                  className="w-full bg-[#121826] border border-slate-700/80 rounded-xl p-2.5 text-xs text-slate-200 appearance-none focus:outline-none focus:border-blue-500 cursor-pointer font-semibold"
                >
                  <option value="Dự án NEXORA Platform">Dự án NEXORA Platform</option>
                  <option value="Dự án ERP Nexora">Dự án ERP Nexora</option>
                  <option value="Ứng dụng CRM">Ứng dụng CRM</option>
                  <option value="Data Warehouse">Data Warehouse</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 pt-0.5 leading-relaxed">
                Bao gồm tài liệu, cuộc họp và dữ liệu liên quan đến {contextProject}.
              </p>
            </div>
          </div>

          {/* Bộ lọc theo loại */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase">BỘ LỌC THEO LOẠI</span>
            <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#121826] rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => setActiveContextFilter('all')}
                className={`py-1 rounded-lg font-medium transition-colors ${
                  activeContextFilter === 'all' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveContextFilter('doc')}
                className={`py-1 rounded-lg font-medium transition-colors ${
                  activeContextFilter === 'doc' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                Tài liệu
              </button>
              <button
                onClick={() => setActiveContextFilter('meeting')}
                className={`py-1 rounded-lg font-medium transition-colors ${
                  activeContextFilter === 'meeting' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                Cuộc họp
              </button>
              <button
                onClick={() => setActiveContextFilter('task')}
                className={`py-1 rounded-lg font-medium transition-colors ${
                  activeContextFilter === 'task' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                Công việc
              </button>
            </div>
          </div>

          {/* Tài liệu đang hoạt động (5) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Tài liệu đang hoạt động (5)</span>
              <button
                onClick={() => navigate({ to: '/data-repo' as any })}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-2">
              {/* Doc 1 */}
              <div className="p-2.5 bg-[#121826] rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                    PDF
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 text-xs truncate">Báo cáo tiến độ dự án.pdf</p>
                    <p className="text-[10px] text-slate-500">Văn phòng PMO • 28/05/2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 rounded">
                    Có quyền
                  </span>
                  <span className="w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                    1
                  </span>
                </div>
              </div>

              {/* Doc 2 */}
              <div className="p-2.5 bg-[#121826] rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                    XLSX
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 text-xs truncate">Kế hoạch dự án Phase 2.xlsx</p>
                    <p className="text-[10px] text-slate-500">QA • 27/05/2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 rounded">
                    Có quyền
                  </span>
                  <span className="w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                    2
                  </span>
                </div>
              </div>

              {/* Doc 3 */}
              <div className="p-2.5 bg-[#121826] rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                    DOCX
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 text-xs truncate">Biên bản họp 14-05-docx</p>
                    <p className="text-[10px] text-slate-500">Tài chính • 24/05/2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 rounded">
                    Có quyền
                  </span>
                  <span className="w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                    3
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Nguồn tham chiếu */}
          <div className="space-y-3">
            <span className="font-semibold text-slate-200">Nguồn tham chiếu</span>
            <div className="space-y-2 text-[11px]">
              <div className="p-2.5 bg-[#121826] rounded-xl border border-slate-800 flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-200">Báo cáo tiến độ dự án ERP Nexora_Tuần 21</p>
                  <p className="text-[10px] text-slate-500">Phiên bản 1.2 • Cập nhật: 28/05/2024</p>
                </div>
              </div>

              <div className="p-2.5 bg-[#121826] rounded-xl border border-slate-800 flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-200">Kế hoạch kiểm thử UAT_Tuần 21–22</p>
                  <p className="text-[10px] text-slate-500">Phiên bản 1.0 • Cập nhật: 27/05/2024</p>
                </div>
              </div>

              <div className="p-2.5 bg-[#121826] rounded-xl border border-slate-800 flex items-start gap-2">
                <span className="w-4 h-4 rounded bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-semibold text-slate-200">Yêu cầu báo cáo quản trị_ERP Nexora</p>
                  <p className="text-[10px] text-slate-500">Phiên bản 0.9 • Cập nhật: 24/05/2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA: Quản lý tài liệu */}
          <div className="pt-2">
            <button
              onClick={() => navigate({ to: '/data-repo' as any })}
              className="w-full py-2.5 bg-[#151e2e] hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Quản lý tài liệu</span>
            </button>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default ChatPage;
