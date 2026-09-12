import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { MeetingModal } from './MeetingModal';
import { useNavigate } from '@tanstack/react-router';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  FileText,
  Sparkles,
  ExternalLink,
  CheckSquare,
  Square,
  Calendar as CalendarIcon,
  Play,
  Share2,
} from 'lucide-react';

interface CalendarMeetingEvent {
  id: string;
  title: string;
  timeRange: string;
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
  room: string;
  members: string;
  memberCount: number;
  color: 'blue' | 'green' | 'amber';
  isOnline?: boolean;
}

const mockWeekEvents: CalendarMeetingEvent[] = [
  // Thứ 2
  {
    id: 'e1',
    title: 'Họp Ban Điều hành',
    timeRange: '09:00 – 10:30',
    day: 'mon',
    room: 'Phòng họp lớn',
    members: 'Vũ Hiếu, NT, PT, LH +3',
    memberCount: 7,
    color: 'blue',
  },
  {
    id: 'e2',
    title: 'Daily dự án CRM',
    timeRange: '11:00 – 12:00',
    day: 'mon',
    room: 'Online (Teams)',
    members: 'NT, VP, LH',
    memberCount: 3,
    color: 'green',
    isOnline: true,
  },
  {
    id: 'e3',
    title: 'Đánh giá Data Warehouse',
    timeRange: '14:00 – 15:30',
    day: 'mon',
    room: 'Phòng IT',
    members: 'PT, NT, AD, VH',
    memberCount: 4,
    color: 'blue',
  },
  // Thứ 3
  {
    id: 'e4',
    title: 'Kiểm thử UAT — ERP',
    timeRange: '10:00 – 11:30',
    day: 'tue',
    room: 'Phòng họp nhỏ',
    members: 'VH, NT, QA, PT +2',
    memberCount: 6,
    color: 'green',
  },
  {
    id: 'e5',
    title: 'Đào tạo người dùng',
    timeRange: '15:00 – 16:30',
    day: 'tue',
    room: 'Phòng đào tạo',
    members: 'VH, NS, NT',
    memberCount: 3,
    color: 'amber',
  },
  // Thứ 4
  {
    id: 'e6',
    title: 'Daily dự án ERP Nexora',
    timeRange: '09:00 – 10:00',
    day: 'wed',
    room: 'Online (Teams)',
    members: 'PMO Team',
    memberCount: 5,
    color: 'blue',
    isOnline: true,
  },
  {
    id: 'e7',
    title: 'Họp dự án Data Warehouse',
    timeRange: '13:30 – 15:00',
    day: 'wed',
    room: 'Phòng họp nhỏ',
    members: 'PT, VH, AD, NT',
    memberCount: 4,
    color: 'green',
  },
  // Thứ 5
  {
    id: 'e8',
    title: 'Họp Ban Điều hành',
    timeRange: '08:30 – 10:00',
    day: 'thu',
    room: 'Phòng họp lớn',
    members: 'Vũ Hiếu, NT, PT, LH +3',
    memberCount: 7,
    color: 'blue',
  },
  {
    id: 'e9',
    title: 'Daily dự án CRM',
    timeRange: '11:00 – 12:00',
    day: 'thu',
    room: 'Online (Teams)',
    members: 'NT, VP, LH',
    memberCount: 3,
    color: 'green',
    isOnline: true,
  },
  {
    id: 'e10',
    title: 'Kiểm thử UAT — ERP',
    timeRange: '14:00 – 15:30',
    day: 'thu',
    room: 'Phòng IT',
    members: 'VH, QA, PT, NT +1',
    memberCount: 5,
    color: 'amber',
  },
  // Thứ 6
  {
    id: 'e11',
    title: 'Họp tổng kết tuần',
    timeRange: '09:30 – 11:00',
    day: 'fri',
    room: 'Phòng họp nhỏ',
    members: 'PMO Team',
    memberCount: 6,
    color: 'green',
  },
  {
    id: 'e12',
    title: 'Đào tạo người dùng',
    timeRange: '15:00 – 16:30',
    day: 'fri',
    room: 'Phòng đào tạo',
    members: 'VH, NS, NT',
    memberCount: 3,
    color: 'blue',
  },
];

export const MeetingsPage: React.FC = () => {
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [selectedEventId, setSelectedEventId] = useState('e8');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState<'week' | 'month'>('week');

  const selectedEvent = mockWeekEvents.find((e) => e.id === selectedEventId) || mockWeekEvents[7];

  const getEventCardStyle = (color: string, isSelected: boolean) => {
    let base = 'p-2 rounded-lg border text-left cursor-pointer transition-all shadow-2xs ';
    if (isSelected) {
      base += 'ring-2 ring-blue-500 border-blue-500 ';
    }
    switch (color) {
      case 'blue':
        return base + 'bg-blue-50/70 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800 text-blue-900 dark:text-blue-100';
      case 'green':
        return base + 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100';
      case 'amber':
        return base + 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-100';
      default:
        return base + 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      
      {/* Global Header */}
      <Header />

      {/* Page Title & Actions Bar matching 05-calendar-meetings.png */}
      <div className="px-4 md:px-5 py-3 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Lịch & Cuộc họp
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Điều phối lịch làm việc, phòng họp và biên bản AI
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Nav */}
          <div className="flex items-center gap-1">
            <button className="p-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 hover:bg-slate-50 cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 hover:bg-slate-50 cursor-pointer">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 font-mono">
            20 – 24/05/2024
          </span>

          <button className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 cursor-pointer shadow-2xs">
            Hôm nay
          </button>

          <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5 text-xs shadow-2xs">
            <button
              onClick={() => setViewType('week')}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                viewType === 'week' ? 'bg-blue-600 text-white' : 'text-slate-600'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewType('month')}
              className={`px-2.5 py-1 rounded-md font-semibold ${
                viewType === 'month' ? 'bg-blue-600 text-white' : 'text-slate-600'
              }`}
            >
              Tháng
            </button>
          </div>

          <select className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-700 dark:text-zinc-300 shadow-2xs">
            <option>Nhóm của tôi</option>
            <option>Toàn công ty</option>
            <option>Phòng PMO</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo cuộc họp</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Calendar Content */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* ==================================================================== */}
        {/* 1. LEFT 2/3 COLUMN: Room Status Bar + Weekly Grid */}
        {/* ==================================================================== */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 min-w-0">
          
          {/* Room Status Strip matching 05-calendar-meetings.png */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">Tình trạng phòng họp</span>
              <button
                onClick={() => showToast('Mở danh sách tất cả phòng họp', 'info')}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Xem tất cả phòng
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-zinc-100">Phòng họp lớn</p>
                  <span className="text-[10px] text-slate-400 font-mono">08:00 – 10:00</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                  Đang họp
                </span>
              </div>

              <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-zinc-100">Phòng họp nhỏ</p>
                  <span className="text-[10px] text-slate-400 font-mono">10:00 – 11:00</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  Sắp có
                </span>
              </div>

              <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-zinc-100">Phòng IT</p>
                  <span className="text-[10px] text-slate-400 font-mono">09:00 – 12:00</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                  Đang họp
                </span>
              </div>

              <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-zinc-100">Phòng đào tạo</p>
                  <span className="text-[10px] text-slate-400 font-mono">Cả ngày</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  Trống cả ngày
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Calendar Grid matching 05-calendar-meetings.png */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            
            {/* Days Header */}
            <div className="grid grid-cols-6 border-b border-slate-200 dark:border-zinc-800 text-center text-xs font-semibold py-3 bg-slate-50/70 dark:bg-zinc-900">
              <div className="text-slate-400 font-normal">Giờ</div>
              <div className="text-slate-800 dark:text-zinc-200">
                Thứ 2 <span className="block font-normal text-[11px] text-slate-400">20/05</span>
              </div>
              <div className="text-slate-800 dark:text-zinc-200">
                Thứ 3 <span className="block font-normal text-[11px] text-slate-400">21/05</span>
              </div>
              <div className="text-slate-800 dark:text-zinc-200">
                Thứ 4 <span className="block font-normal text-[11px] text-slate-400">22/05</span>
              </div>
              <div className="text-blue-600 dark:text-blue-400 font-bold">
                Thứ 5 <span className="block font-normal text-[11px] text-blue-500">23/05</span>
              </div>
              <div className="text-slate-800 dark:text-zinc-200">
                Thứ 6 <span className="block font-normal text-[11px] text-slate-400">24/05</span>
              </div>
            </div>

            {/* Time Grid with 5 Columns */}
            <div className="relative divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
              
              {/* Red Current Time Line on Thursday (10:24) */}
              <div className="absolute top-[165px] left-0 right-0 z-20 pointer-events-none flex items-center">
                <div className="w-[50%] flex justify-end pr-2">
                  <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded font-mono text-[9px] font-bold">
                    10:24
                  </span>
                </div>
                <div className="flex-1 h-[2px] bg-rose-500" />
              </div>

              {[
                { time: '08:00' },
                { time: '09:00' },
                { time: '10:00' },
                { time: '11:00' },
                { time: '12:00' },
                { time: '13:00' },
                { time: '14:00' },
                { time: '15:00' },
                { time: '16:00' },
                { time: '17:00' },
              ].map((slot, idx) => (
                <div key={idx} className="grid grid-cols-6 min-h-[72px] divide-x divide-slate-100 dark:divide-zinc-800/80">
                  {/* Time label */}
                  <div className="p-2 text-right font-mono text-[11px] text-slate-400 bg-slate-50/30">
                    {slot.time}
                  </div>

                  {/* Mon */}
                  <div className="p-1 space-y-1">
                    {mockWeekEvents
                      .filter((e) => e.day === 'mon' && e.timeRange.startsWith(slot.time.slice(0, 2)))
                      .map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEventId(ev.id)}
                          className={getEventCardStyle(ev.color, selectedEventId === ev.id)}
                        >
                          <span className="text-[10px] font-mono text-slate-500 block">{ev.timeRange}</span>
                          <p className="font-bold text-xs truncate">{ev.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{ev.members}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>{ev.room}</span>
                            <span>👥 {ev.memberCount}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Tue */}
                  <div className="p-1 space-y-1">
                    {mockWeekEvents
                      .filter((e) => e.day === 'tue' && e.timeRange.startsWith(slot.time.slice(0, 2)))
                      .map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEventId(ev.id)}
                          className={getEventCardStyle(ev.color, selectedEventId === ev.id)}
                        >
                          <span className="text-[10px] font-mono text-slate-500 block">{ev.timeRange}</span>
                          <p className="font-bold text-xs truncate">{ev.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{ev.members}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>{ev.room}</span>
                            <span>👥 {ev.memberCount}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Wed */}
                  <div className="p-1 space-y-1">
                    {mockWeekEvents
                      .filter((e) => e.day === 'wed' && e.timeRange.startsWith(slot.time.slice(0, 2)))
                      .map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEventId(ev.id)}
                          className={getEventCardStyle(ev.color, selectedEventId === ev.id)}
                        >
                          <span className="text-[10px] font-mono text-slate-500 block">{ev.timeRange}</span>
                          <p className="font-bold text-xs truncate">{ev.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{ev.members}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>{ev.room}</span>
                            <span>👥 {ev.memberCount}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Thu */}
                  <div className="p-1 space-y-1 bg-blue-50/10 dark:bg-blue-950/10">
                    {mockWeekEvents
                      .filter((e) => e.day === 'thu' && (e.timeRange.startsWith(slot.time.slice(0, 2)) || (slot.time === '08:00' && e.timeRange.startsWith('08'))))
                      .map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEventId(ev.id)}
                          className={getEventCardStyle(ev.color, selectedEventId === ev.id)}
                        >
                          <span className="text-[10px] font-mono text-slate-500 block">{ev.timeRange}</span>
                          <p className="font-bold text-xs truncate">{ev.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{ev.members}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>{ev.room}</span>
                            <span>👥 {ev.memberCount}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Fri */}
                  <div className="p-1 space-y-1">
                    {mockWeekEvents
                      .filter((e) => e.day === 'fri' && e.timeRange.startsWith(slot.time.slice(0, 2)))
                      .map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEventId(ev.id)}
                          className={getEventCardStyle(ev.color, selectedEventId === ev.id)}
                        >
                          <span className="text-[10px] font-mono text-slate-500 block">{ev.timeRange}</span>
                          <p className="font-bold text-xs truncate">{ev.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">{ev.members}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span>{ev.room}</span>
                            <span>👥 {ev.memberCount}</span>
                          </div>
                        </div>
                      ))}
                  </div>

                </div>
              ))}
            </div>

          </div>

        </main>

        {/* ==================================================================== */}
        {/* 2. RIGHT 1/3 COLUMN: Lịch Hôm Nay & Chi Tiết Cuộc Họp 320px */}
        {/* ==================================================================== */}
        <aside className="w-80 border-l border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col h-full shrink-0 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* Lịch hôm nay */}
          <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-200">Lịch hôm nay</h3>
              <button
                onClick={() => showToast('Mở agenda đầy đủ', 'info')}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Xem agenda đầy đủ
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-start gap-2">
                <span className="font-mono text-slate-400 font-semibold mt-0.5">08:30</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">● Họp Ban Điều hành</p>
                  <span className="text-[10px] text-slate-400">Phòng họp lớn • 08:30 – 10:00</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-mono text-slate-400 font-semibold mt-0.5">11:00</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">● Daily dự án CRM</p>
                  <span className="text-[10px] text-slate-400">Online (Teams) • 11:00 – 12:00</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-mono text-slate-400 font-semibold mt-0.5">14:00</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">● Kiểm thử UAT — ERP</p>
                  <span className="text-[10px] text-slate-400">Phòng IT • 14:00 – 15:30</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => showToast('Xem lịch ngày mai', 'info')}
              className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline block pt-1 cursor-pointer"
            >
              Xem lịch ngày mai
            </button>
          </div>

          {/* Chi tiết cuộc họp matching 05-calendar-meetings.png */}
          <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">{selectedEvent.title}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 shrink-0">
                Sắp diễn ra
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>08:30 – 10:00 (90 phút) • Thứ 5, 23/05/2024</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedEvent.room}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Video className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-800 dark:text-zinc-200 font-medium">Microsoft Teams Meeting</span>
                </div>
                <button
                  onClick={() => showToast('Đang tham gia qua Microsoft Teams', 'success')}
                  className="px-2 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-[10px] font-bold cursor-pointer"
                >
                  Tham gia
                </button>
              </div>
            </div>

            {/* Members stack */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {['VH', 'NT', 'PT', 'LH', 'AD', 'VH'].map((init, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center border-2 border-white dark:border-zinc-900 shrink-0"
                  >
                    {init}
                  </div>
                ))}
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 font-bold text-[9px] flex items-center justify-center">
                  +1
                </span>
              </div>
              <span className="text-[11px] text-slate-400">👥 7 người</span>
            </div>
          </div>

          {/* Chuẩn bị cuộc họp (Checklist) */}
          <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <span className="font-bold text-xs text-slate-800 dark:text-zinc-200 block">Chuẩn bị cuộc họp</span>
            <div className="space-y-1.5 text-[11px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                <span className="text-slate-700 dark:text-zinc-300">Kiểm tra agenda và tài liệu</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                <span className="text-slate-700 dark:text-zinc-300">Xem báo cáo tuần của các dự án</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300" />
                <span className="text-slate-700 dark:text-zinc-300">Cập nhật các quy trình/issue quan trọng</span>
              </label>
            </div>
          </div>

          {/* Tài liệu đính kèm */}
          <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <span className="font-bold text-xs text-slate-800 dark:text-zinc-200 block">Tài liệu đính kèm (1)</span>
            <div className="p-2.5 bg-slate-50/70 dark:bg-zinc-900 rounded-lg flex items-center gap-2.5">
              <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-500 rounded text-[9px] font-bold">PDF</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate text-[11px]">
                  Agenda_Hop Ban Dieu hanh_23-05-2024.pdf
                </p>
                <span className="text-[10px] text-slate-400">256 KB • PDF</span>
              </div>
            </div>
          </div>

          {/* Ghi âm & Biên bản AI */}
          <div className="space-y-2 pb-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 dark:text-zinc-200">Ghi âm & Biên bản</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                Chưa bắt đầu
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Trạng thái biên bản AI. Biên bản sẽ được tạo tự động khi cuộc họp bắt đầu.
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => showToast('Đang mở phòng họp trực tuyến', 'success')}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Tham gia</span>
              </button>
              <button
                onClick={() => showToast('Mở chương trình nghị sự', 'info')}
                className="py-2 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Xem chương trình</span>
              </button>
            </div>

            <button
              onClick={() => showToast('Mở chi tiết đặt phòng họp', 'info')}
              className="w-full py-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>Mở phòng họp</span>
            </button>
          </div>

        </aside>

      </div>

      {/* Create Meeting Modal */}
      <MeetingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default MeetingsPage;
