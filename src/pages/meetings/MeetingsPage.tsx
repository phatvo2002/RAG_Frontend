import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/button';
import { MeetingModal } from './MeetingModal';
import { Meeting } from '@/types';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Video,
  FileText,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  ListTodo,
  ChevronRight,
  Search,
  Filter,
  Mic,
  Share2,
  Download,
  AlertCircle
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <Header title="Phòng họp & Biên bản" subTitle="Lên lịch, ghi âm và trích xuất tóm tắt thông minh qua AI" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Meeting list */}
        <div className="w-full md:w-96 border-r border-slate-200 bg-white flex flex-col h-full shrink-0">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Danh sách cuộc họp</h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tạo cuộc họp</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterTab === 'all' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-500'
                }`}
              >
                Tất cả ({meetings.length})
              </button>
              <button
                onClick={() => setFilterTab('upcoming')}
                className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterTab === 'upcoming' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-500'
                }`}
              >
                Sắp tới
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterTab === 'completed' ? 'bg-white text-slate-800 shadow-xs font-semibold' : 'text-slate-500'
                }`}
              >
                Đã xong
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm cuộc họp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredMeetings.map((meeting) => {
              const isSelected = selectedMeeting?.id === meeting.id;
              const isCompleted = meeting.status === 'Đã hoàn thành' || meeting.status === 'Đã kết thúc';

              return (
                <div
                  key={meeting.id}
                  onClick={() => setSelectedMeeting(meeting)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {meeting.title}
                    </span>
                    <Badge variant={isCompleted ? 'success' : 'primary'}>
                      {meeting.status}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-blue-600 font-medium mb-2">{meeting.project}</p>

                  <div className="space-y-1 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{meeting.date} ({meeting.time})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{meeting.location || meeting.room || 'Phòng họp'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Meeting Detail & AI Summary */}
        <div className="flex-1 bg-slate-50 overflow-y-auto p-6">
          {selectedMeeting ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Meeting header info */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-semibold text-blue-600">{selectedMeeting.project}</span>
                    <h1 className="text-lg font-bold text-slate-900 mt-0.5">{selectedMeeting.title}</h1>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAskAIAboutMeeting(selectedMeeting)}
                      className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-blue-200 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Hỏi AI về cuộc họp</span>
                    </button>
                    <button
                      onClick={() => showToast('Đã sao chép link cuộc họp', 'success')}
                      className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                      title="Chia sẻ"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Thời gian</span>
                    <span className="font-semibold text-slate-800">{selectedMeeting.date}</span>
                    <p className="text-[11px] text-slate-500">{selectedMeeting.time}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Địa điểm</span>
                    <span className="font-semibold text-slate-800">{selectedMeeting.location || selectedMeeting.room}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Chủ trì</span>
                    <span className="font-semibold text-slate-800">{selectedMeeting.organizer || selectedMeeting.host}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Thành viên</span>
                    <span className="font-semibold text-slate-800">{selectedMeeting.participantsCount || 5} người</span>
                  </div>
                </div>
              </div>

              {/* AI Summary Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Biên bản họp AI Tóm tắt</h3>
                  </div>

                  <button
                    onClick={handleGenerateSummary}
                    disabled={isGeneratingAI}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isGeneratingAI ? (
                      <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>Tạo lại tóm tắt</span>
                  </button>
                </div>

                <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
                  <p>
                    {selectedMeeting.summary ||
                      'Cuộc họp tập trung thảo luận về tiến độ Sprint 6, thống nhất kế hoạch phát hành phiên bản MVP vào cuối tháng và phân chia trách nhiệm hoàn thiện module Phân tích dữ liệu cho team Frontend.'}
                  </p>

                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 space-y-2">
                    <span className="font-bold text-blue-900 block">Các quyết định trọng tâm:</span>
                    <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11px]">
                      <li>Ưu tiên tối ưu hóa hiệu năng Vite SPA và tích hợp TanStack Router.</li>
                      <li>Hoàn tất kiểm thử các API authentication và quyền hạn người dùng trước thứ Sáu.</li>
                      <li>Phân bổ thêm 2 nhân sự kiểm thử tự động cho module Kho dữ liệu.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 stroke-1" />
              <p className="text-xs">Chọn một cuộc họp để xem chi tiết biên bản</p>
            </div>
          )}
        </div>
      </div>

      <MeetingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
export default MeetingsPage;

