import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/button';
import { MeetingModal } from './MeetingModal';
import { Meeting } from '@/types';
import {
  Clock,
  MapPin,
  Users,
  FileText,
  Sparkles,
  Plus,
  Play,
  Share2,
  Download
} from 'lucide-react';

export const MeetingsPage: React.FC = () => {
  const { meetings, addChatMessage, setActiveModule, showToast } = useApp();
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(meetings[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.project?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    if (filterTab === 'upcoming') return matchesSearch && (m.status === 'Sắp diễn ra' || m.status === 'Sắp tới');
    if (filterTab === 'completed') return matchesSearch && (m.status === 'Đã hoàn thành' || m.status === 'Đã kết thúc');
    return matchesSearch;
  });

  const handleAskAIAboutMeeting = (meeting: Meeting) => {
    setActiveModule('chat');
    addChatMessage({
      sender: 'user',
      text: `Tóm tắt nội dung cuộc họp "${meeting.title}" và các công việc được giao trong biên bản.`
    });
    showToast(`Đã chuyển sang Trò chuyện AI với ngữ cảnh cuộc họp "${meeting.title}"`);
  };

  const handleGenerateSummary = () => {
    if (!selectedMeeting) return;
    setIsGeneratingAI(true);
    setTimeout(() => {
      setIsGeneratingAI(false);
      showToast('AI đã tạo tóm tắt biên bản họp thành công!', 'success');
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black transition-colors">
      <Header title="Phòng họp & Biên bản" subTitle="Lên lịch, ghi âm và trích xuất tóm tắt thông minh qua AI" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Meeting list */}
        <div className="w-full md:w-96 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full shrink-0 transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Danh sách cuộc họp</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo cuộc họp</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-zinc-900 p-1 rounded gap-1 text-xs">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer ${
                  filterTab === 'all' ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-2xs font-semibold' : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                Tất cả ({meetings.length})
              </button>
              <button
                onClick={() => setFilterTab('upcoming')}
                className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer ${
                  filterTab === 'upcoming' ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-2xs font-semibold' : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                Sắp tới
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`flex-1 py-1 rounded font-medium transition-colors cursor-pointer ${
                  filterTab === 'completed' ? 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-2xs font-semibold' : 'text-slate-500 dark:text-zinc-400'
                }`}
              >
                Đã xong
              </button>
            </div>

            {/* Search Box */}
            <input
              type="text"
              placeholder="Tìm theo tên cuộc họp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Meeting items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80">
            {filteredMeetings.map((m) => {
              const isSelected = selectedMeeting?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeeting(m)}
                  className={`p-4 transition-colors cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-zinc-900 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50/70 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100 line-clamp-1">{m.title}</h3>
                    <Badge variant={m.status === 'Sắp diễn ra' ? 'warning' : 'success'}>
                      {m.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span>{m.time}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                      <span>{m.location || m.room || 'Phòng A3'}</span>
                    </span>
                  </div>

                  {m.hasSummary && (
                    <div className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Có bản tóm tắt AI</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Meeting Detail & Transcript */}
        {selectedMeeting ? (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full bg-slate-50/50 dark:bg-black transition-colors">
            {/* Header Detail Card */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedMeeting.status === 'Sắp diễn ra' ? 'warning' : 'success'}>
                      {selectedMeeting.status}
                    </Badge>
                    <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Dự án: {selectedMeeting.project || 'NEXORA Platform'}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{selectedMeeting.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAskAIAboutMeeting(selectedMeeting)}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-zinc-700 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200/60 dark:border-zinc-700"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Hỏi AI về cuộc họp</span>
                  </button>
                  <button
                    onClick={() => showToast('Chia sẻ biên bản họp', 'info')}
                    className="p-2 border border-slate-200 dark:border-zinc-700 rounded text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[11px] block">Thời gian</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedMeeting.date} ({selectedMeeting.time})</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[11px] block">Địa điểm</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedMeeting.location || selectedMeeting.room || 'Phòng A3'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[11px] block">Người chủ trì</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedMeeting.organizer || 'Anh Khoa'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-zinc-500 text-[11px] block">Người tham dự</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedMeeting.participantsCount || 5} người</span>
                </div>
              </div>
            </div>

            {/* AI Summary Card */}
            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/50 dark:from-zinc-900 dark:to-zinc-900/90 p-5 rounded-lg border border-blue-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Trích xuất tóm tắt thông minh (AI Summary)</span>
                </h3>
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingAI}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {isGeneratingAI && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  <span>{selectedMeeting.hasSummary ? 'Tạo lại tóm tắt' : 'Tạo tóm tắt AI'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-700 dark:text-zinc-300 space-y-2 leading-relaxed bg-white/80 dark:bg-zinc-950/80 p-4 rounded-lg border border-blue-100/60 dark:border-zinc-800">
                <p className="font-semibold text-slate-900 dark:text-zinc-100">📌 Các quyết định chính được thông qua:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-zinc-300 text-xs">
                  <li>Thống nhất bàn giao Phase 2 vào ngày 25/05 với đầy đủ tính năng AI Chat RAG.</li>
                  <li>Phòng Kỹ thuật sẽ tối ưu thời gian phản hồi API dưới 1.5 giây cho 1000 người dùng đồng thời.</li>
                  <li>Phòng Sản phẩm phụ trách viết tài liệu hướng dẫn và onboarding nhân sự mới.</li>
                </ul>
              </div>
            </div>

            {/* Audio Recording & Transcript Player */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Ghi âm & Bản gỡ băng (Transcript)</span>
                </h3>
                <button
                  onClick={() => showToast('Tải xuống file ghi âm và transcript', 'info')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải file ghi âm</span>
                </button>
              </div>

              {/* Audio Player placeholder */}
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-lg flex items-center gap-3 border border-slate-200/60 dark:border-zinc-700/60">
                <button
                  onClick={() => showToast('Đang phát âm thanh cuộc họp...', 'info')}
                  className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <Play className="w-4 h-4 ml-0.5" />
                </button>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">
                    <span>04:15</span>
                    <span>42:30</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-1.5">
                    <div className="bg-blue-600 h-1.5 rounded-full w-[10%]" />
                  </div>
                </div>
              </div>

              {/* Transcript dialogue */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-blue-600 dark:text-blue-400">[00:15] Anh Khoa (Chủ trì):</span>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed pl-2 border-l-2 border-slate-200 dark:border-zinc-700">
                    Chào mọi người, hôm nay chúng ta họp để chốt tiến độ bàn giao hệ thống AI nội bộ NEXORA cho ban giám đốc.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">[02:30] Đức Huy (Kỹ thuật):</span>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed pl-2 border-l-2 border-slate-200 dark:border-zinc-700">
                    Về phần Vector Database và RAG, team đã tối ưu xong độ trễ embedding xuống dưới 120ms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400 dark:text-zinc-500 text-xs">
            Chọn một cuộc họp từ danh sách bên trái để xem biên bản chi tiết
          </div>
        )}
      </div>

      <MeetingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
export default MeetingsPage;
