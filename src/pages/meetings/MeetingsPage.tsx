import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Video } from 'lucide-react';
import { Header } from '@/components/header';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { useMeetingsQuery, type OnlineMeeting } from '@/api/meetings.api';
import { MeetingModal } from './MeetingModal';

type ViewMode = 'week' | 'month';

const dayLabel = new Intl.DateTimeFormat('vi-VN', { weekday: 'short' });
const dateLabel = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' });
const dateTimeLabel = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
const timeLabel = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });

function startOfWeek(value: Date): Date {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  return date;
}

function addDays(value: Date, days: number): Date {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function isSameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}

function statusLabel(status: OnlineMeeting['status']): string {
  switch (status) {
    case 'Scheduled': return 'Chưa bắt đầu';
    case 'Live': return 'Đang họp';
    case 'Ending': return 'Đang kết thúc';
    case 'Ended': return 'Đã kết thúc';
  }
}

function MeetingCard({ meeting, onClick }: { meeting: OnlineMeeting; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="w-full rounded-lg border border-blue-200 bg-blue-50 p-2 text-left text-xs hover:border-blue-500 dark:border-blue-900 dark:bg-blue-950/40">
      <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
        {timeLabel.format(new Date(meeting.scheduledStart))} – {timeLabel.format(new Date(meeting.scheduledEnd))}
      </span>
      <strong className="block truncate text-blue-900 dark:text-blue-200">{meeting.title}</strong>
      <span className="text-[11px] text-slate-500 dark:text-zinc-400">{statusLabel(meeting.status)}</span>
    </button>
  );
}

export const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const meetingsQuery = useMeetingsQuery();
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [focusedDate, setFocusedDate] = useState(() => new Date());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);

  const today = new Date();
  const weekStart = startOfWeek(focusedDate);
  const calendarStart = viewMode === 'week'
    ? weekStart
    : startOfWeek(new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1));
  const days = Array.from({ length: viewMode === 'week' ? 7 : 42 }, (_, index) => addDays(calendarStart, index));
  const meetings = meetingsQuery.data ?? [];
  const selectedMeeting = meetings.find(meeting => meeting.id === selectedMeetingId) ?? null;
  const visibleMeetings = meetings.filter(meeting => {
    const date = new Date(meeting.scheduledStart);
    return viewMode === 'week'
      ? days.some(day => isSameDay(day, date))
      : date.getFullYear() === focusedDate.getFullYear() && date.getMonth() === focusedDate.getMonth();
  });

  const changePeriod = (direction: number) => {
    if (viewMode === 'week') {
      setFocusedDate(addDays(focusedDate, direction * 7));
    } else {
      setFocusedDate(new Date(focusedDate.getFullYear(), focusedDate.getMonth() + direction, 1));
    }
  };

  const periodLabel = viewMode === 'week'
    ? `${dateLabel.format(weekStart)} – ${dateLabel.format(addDays(weekStart, 6))}/${addDays(weekStart, 6).getFullYear()}`
    : new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(focusedDate);

  return (
    <div className="nexora-page flex h-full flex-1 flex-col overflow-hidden bg-slate-50/50 dark:bg-black">
      <Header />
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:px-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Lịch & Cuộc họp</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Các cuộc họp trực tuyến của bạn</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-label="Kỳ trước" onClick={() => changePeriod(-1)} className="rounded border border-slate-200 p-1.5 dark:border-zinc-700"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" aria-label="Kỳ sau" onClick={() => changePeriod(1)} className="rounded border border-slate-200 p-1.5 dark:border-zinc-700"><ChevronRight className="h-4 w-4" /></button>
          <span className="min-w-36 text-center text-xs font-semibold">{periodLabel}</span>
          <button type="button" onClick={() => setFocusedDate(new Date())} className="rounded border border-slate-200 px-3 py-1.5 text-xs dark:border-zinc-700">Hôm nay</button>
          <div className="flex rounded border border-slate-200 p-0.5 text-xs dark:border-zinc-700">
            <button type="button" onClick={() => setViewMode('week')} className={`rounded px-3 py-1 ${viewMode === 'week' ? 'bg-blue-600 text-white' : ''}`}>Tuần</button>
            <button type="button" onClick={() => setViewMode('month')} className={`rounded px-3 py-1 ${viewMode === 'month' ? 'bg-blue-600 text-white' : ''}`}>Tháng</button>
          </div>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"><Plus className="h-4 w-4" /> Tạo cuộc họp</button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 md:p-5">
        {meetingsQuery.isLoading && <p className="rounded border bg-white p-6 text-sm dark:bg-zinc-900">Đang tải cuộc họp...</p>}
        {meetingsQuery.isError && <div className="rounded border border-rose-200 bg-white p-6 text-sm dark:bg-zinc-900">
          <p>Không tải được cuộc họp từ máy chủ.</p>
          <button type="button" onClick={() => void meetingsQuery.refetch()} className="mt-2 text-blue-600">Thử lại</button>
        </div>}
        {meetingsQuery.isSuccess && <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <div className="grid min-w-[700px] grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs dark:border-zinc-800 dark:bg-zinc-900">
              {days.slice(0, 7).map(day => <div key={day.toISOString()} className="p-3 font-semibold">{dayLabel.format(day)}</div>)}
            </div>
            <div className="grid min-w-[700px] grid-cols-7">
              {days.map(day => {
                const dayMeetings = meetings
                  .filter(meeting => isSameDay(new Date(meeting.scheduledStart), day))
                  .sort((left, right) => new Date(left.scheduledStart).getTime() - new Date(right.scheduledStart).getTime());
                return <div key={day.toISOString()} className={`min-h-40 space-y-2 border-b border-r border-slate-100 p-2 dark:border-zinc-800 ${viewMode === 'month' && day.getMonth() !== focusedDate.getMonth() ? 'opacity-45' : ''}`}>
                  <div className={`text-xs ${isSameDay(day, today) ? 'font-bold text-blue-600' : 'text-slate-500'}`}>{dateLabel.format(day)}</div>
                  {dayMeetings.map(meeting => <MeetingCard key={meeting.id} meeting={meeting} onClick={() => setSelectedMeetingId(meeting.id)} />)}
                </div>;
              })}
            </div>
          </div>
          {visibleMeetings.length === 0 && <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-900">
            <CalendarDays className="h-4 w-4" /> Không có cuộc họp nào trong {viewMode === 'week' ? 'tuần' : 'tháng'} này.
          </div>}
        </>}
      </main>

      {selectedMeeting && <Modal isOpen={true} onClose={() => setSelectedMeetingId(null)} title="Chi tiết cuộc họp" maxWidth="lg">
        <div className="space-y-3 p-1 text-sm">
          <h2 className="text-lg font-semibold">{selectedMeeting.title}</h2>
          <p>Trạng thái: {statusLabel(selectedMeeting.status)}</p>
          <p>Dự kiến: {dateTimeLabel.format(new Date(selectedMeeting.scheduledStart))} – {dateTimeLabel.format(new Date(selectedMeeting.scheduledEnd))}</p>
          <p>Vai trò của bạn: {selectedMeeting.organizerUserId === currentUser.id ? 'Chủ phòng' : 'Người tham gia'}</p>
          {selectedMeeting.actualStartedAt && <p>Bắt đầu thực tế: {dateTimeLabel.format(new Date(selectedMeeting.actualStartedAt))}</p>}
          {selectedMeeting.actualEndedAt && <p>Kết thúc thực tế: {dateTimeLabel.format(new Date(selectedMeeting.actualEndedAt))}</p>}
          <button type="button" onClick={() => navigate({ to: '/meetings/$meetingId', params: { meetingId: selectedMeeting.id } })} className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white"><Video className="h-4 w-4" /> Mở phòng họp</button>
        </div>
      </Modal>}
      <MeetingModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};

export default MeetingsPage;
