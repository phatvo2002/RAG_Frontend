import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Moon, Plus, Sun, Video } from 'lucide-react';
import { Header } from '@/components/header';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { useMeetingsQuery, type OnlineMeeting } from '@/api/meetings.api';
import { MeetingModal } from './MeetingModal';

type ViewMode = 'week' | 'month';

const dateLabel = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' });
const dateTimeLabel = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
const timeLabel = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
const weekDayLabels = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const periods = [
  { label: 'Sáng', hours: '00:00 – 12:00', icon: Sun },
  { label: 'Chiều', hours: '12:00 – 18:00', icon: Sun },
  { label: 'Tối', hours: '18:00 – 24:00', icon: Moon },
] as const;

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

function periodOf(date: Date): number {
  const hour = date.getHours();
  return hour < 12 ? 0 : hour < 18 ? 1 : 2;
}

function continuationLabel(meeting: OnlineMeeting): string | null {
  const start = new Date(meeting.scheduledStart);
  const lastOccupiedMoment = new Date(new Date(meeting.scheduledEnd).getTime() - 1);
  if (!isSameDay(start, lastOccupiedMoment)) return 'Kéo dài sang ngày hôm sau';
  const endPeriod = periodOf(lastOccupiedMoment);
  if (endPeriod <= periodOf(start)) return null;
  return `Kéo dài đến buổi ${endPeriod === 1 ? 'chiều' : 'tối'}`;
}

function MeetingCard({ meeting, onClick }: { meeting: OnlineMeeting; onClick: () => void }) {
  const continuation = continuationLabel(meeting);
  return (
    <button type="button" onClick={onClick}
      className="w-full rounded-md border border-[#d4e5ff] border-l-[3px] border-l-[#1769ee] bg-[#edf5ff] px-3 py-2.5 text-left text-xs transition-colors hover:bg-[#e3efff] dark:border-blue-900 dark:border-l-blue-500 dark:bg-blue-950/40 dark:hover:bg-blue-950/70">
      <span className="block text-[11px] text-[#6073a2] dark:text-zinc-400">
        {timeLabel.format(new Date(meeting.scheduledStart))} – {timeLabel.format(new Date(meeting.scheduledEnd))}
      </span>
      <strong className="mt-0.5 block truncate text-sm text-[#102456] dark:text-blue-200" title={meeting.title}>{meeting.title}</strong>
      <span className="mt-1.5 flex items-center gap-1 text-[11px] text-[#6073a2] dark:text-zinc-400">
        <span className={`h-2 w-2 shrink-0 rounded-full ${meeting.status === 'Live' ? 'bg-blue-600' : meeting.status === 'Ending' ? 'bg-amber-500' : 'bg-slate-400'}`} aria-hidden="true" />
        {statusLabel(meeting.status)}
      </span>
      {continuation && <span className="mt-1 block text-[11px] text-[#6073a2] dark:text-zinc-400">{continuation}</span>}
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
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);

  const today = new Date();
  const weekStart = startOfWeek(focusedDate);
  const weekEnd = addDays(weekStart, 6);
  const calendarStart = viewMode === 'week'
    ? weekStart
    : startOfWeek(new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1));
  const days = Array.from({ length: viewMode === 'week' ? 7 : 42 }, (_, index) => addDays(calendarStart, index));
  const meetings = meetingsQuery.data ?? [];
  const selectedMeeting = meetings.find(meeting => meeting.id === selectedMeetingId) ?? null;
  const changePeriod = (direction: number) => {
    if (viewMode === 'week') {
      setFocusedDate(addDays(focusedDate, direction * 7));
    } else {
      setFocusedDate(new Date(focusedDate.getFullYear(), focusedDate.getMonth() + direction, 1));
    }
  };

  const periodLabel = viewMode === 'week'
    ? `${weekStart.getMonth() === weekEnd.getMonth() ? String(weekStart.getDate()).padStart(2, '0') : dateLabel.format(weekStart)} – ${dateLabel.format(weekEnd)}/${weekEnd.getFullYear()}`
    : new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(focusedDate);

  return (
    <div className="nexora-page flex h-full flex-1 flex-col overflow-hidden bg-slate-50/50 dark:bg-black">
      <Header />
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#dce5f3] bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:px-5">
        <div>
          <h1 className="text-[28px] font-bold leading-tight text-[#102456] dark:text-zinc-100">Lịch & Cuộc họp</h1>
          <p className="text-xs text-[#6073a2] dark:text-zinc-400">Các cuộc họp trực tuyến của bạn</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-label="Kỳ trước" onClick={() => changePeriod(-1)} className="rounded-md border border-[#dce5f3] p-2 hover:bg-blue-50 dark:border-zinc-700 dark:hover:bg-zinc-800"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" aria-label="Kỳ sau" onClick={() => changePeriod(1)} className="rounded-md border border-[#dce5f3] p-2 hover:bg-blue-50 dark:border-zinc-700 dark:hover:bg-zinc-800"><ChevronRight className="h-4 w-4" /></button>
          <span className="min-w-36 text-center text-xs font-semibold text-[#102456] dark:text-zinc-100">{periodLabel}</span>
          <button type="button" onClick={() => setFocusedDate(new Date())} className="rounded-md border border-[#dce5f3] px-3 py-2 text-sm hover:bg-blue-50 dark:border-zinc-700 dark:hover:bg-zinc-800">Hôm nay</button>
          <div className="flex rounded-md border border-[#dce5f3] p-0.5 text-sm dark:border-zinc-700">
            <button type="button" aria-pressed={viewMode === 'week'} onClick={() => setViewMode('week')} className={`rounded px-3 py-1 ${viewMode === 'week' ? 'bg-[#155dfb] text-white' : 'hover:bg-blue-50 dark:hover:bg-zinc-800'}`}>Tuần</button>
            <button type="button" aria-pressed={viewMode === 'month'} onClick={() => setViewMode('month')} className={`rounded px-3 py-1 ${viewMode === 'month' ? 'bg-[#155dfb] text-white' : 'hover:bg-blue-50 dark:hover:bg-zinc-800'}`}>Tháng</button>
          </div>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="flex items-center gap-1 rounded-md bg-[#155dfb] px-3 py-2 text-sm font-medium text-white hover:bg-[#0f4bd1]"><Plus className="h-4 w-4" /> Tạo cuộc họp</button>
        </div>
      </div>

      <main className="flex-1 overflow-auto bg-[#f7faff] p-3 dark:bg-black md:p-4">
        {meetingsQuery.isLoading && <p className="rounded border bg-white p-6 text-sm dark:bg-zinc-900">Đang tải cuộc họp...</p>}
        {meetingsQuery.isError && <div className="rounded border border-rose-200 bg-white p-6 text-sm dark:bg-zinc-900">
          <p>Không tải được cuộc họp từ máy chủ.</p>
          <button type="button" onClick={() => void meetingsQuery.refetch()} className="mt-2 text-blue-600">Thử lại</button>
        </div>}
        {meetingsQuery.isSuccess && <>
          <div className="overflow-x-auto rounded-xl border border-[#dce5f3] bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {viewMode === 'week' ? (
              <div className="min-w-[1000px]" role="table" aria-label="Lịch họp theo buổi trong tuần">
                <div className="grid border-b border-[#dce5f3] bg-[#f7faff] text-center dark:border-zinc-800 dark:bg-zinc-900" style={{ gridTemplateColumns: '122px repeat(7, minmax(0, 1fr))' }} role="row">
                  <div className="border-r border-[#dce5f3] dark:border-zinc-800" role="columnheader" aria-label="Buổi" />
                  {days.map(day => <div key={day.toISOString()} role="columnheader" className={`border-r border-[#dce5f3] px-2 py-2.5 last:border-r-0 dark:border-zinc-800 ${isSameDay(day, today) ? 'bg-[#e8f1ff] text-[#155dfb] dark:bg-blue-950/40' : 'text-[#102456] dark:text-zinc-100'}`}>
                    <div className="text-sm font-semibold">{weekDayLabels[day.getDay()]}</div>
                    <div className="text-xs text-[#6073a2] dark:text-zinc-400">{dateLabel.format(day)}</div>
                  </div>)}
                </div>
                {periods.map((period, periodIndex) => {
                  const Icon = period.icon;
                  return <div key={period.label} role="row" className="grid border-b border-[#dce5f3] last:border-b-0 dark:border-zinc-800" style={{ gridTemplateColumns: '122px repeat(7, minmax(0, 1fr))' }}>
                    <div role="rowheader" className="flex min-h-[146px] flex-col justify-center border-r border-[#dce5f3] bg-[#f7faff] px-3 dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#102456] dark:text-zinc-100"><Icon className="h-4 w-4 text-[#6073a2]" aria-hidden="true" />{period.label}</div>
                      <div className="ml-6 mt-0.5 whitespace-nowrap text-[11px] text-[#6073a2] dark:text-zinc-400">{period.hours}</div>
                    </div>
                    {days.map(day => {
                      const dayMeetings = meetings.filter(meeting => isSameDay(new Date(meeting.scheduledStart), day) && periodOf(new Date(meeting.scheduledStart)) === periodIndex)
                        .sort((left, right) => new Date(left.scheduledStart).getTime() - new Date(right.scheduledStart).getTime());
                      return <div key={day.toISOString()} role="cell" className={`min-h-[146px] border-r border-[#dce5f3] p-2 last:border-r-0 dark:border-zinc-800 ${isSameDay(day, today) ? 'bg-[#f0f6ff] dark:bg-blue-950/20' : ''}`}>
                        {dayMeetings.length ? <div className="space-y-2 pt-2">{dayMeetings.map(meeting => <MeetingCard key={meeting.id} meeting={meeting} onClick={() => setSelectedMeetingId(meeting.id)} />)}</div>
                          : <div className={`flex h-full min-h-[128px] items-center justify-center text-sm ${isSameDay(day, today) ? 'text-blue-500' : 'text-[#9aadd0]'}`} aria-label="Không có cuộc họp">—</div>}
                      </div>;
                    })}
                  </div>;
                })}
              </div>
            ) : (
              <div className="min-w-[770px]">
                <div className="grid grid-cols-7 border-b border-[#dce5f3] bg-[#f7faff] text-center text-sm dark:border-zinc-800 dark:bg-zinc-900">
                  {days.slice(0, 7).map(day => <div key={day.toISOString()} className="border-r border-[#dce5f3] p-3 font-semibold last:border-r-0 dark:border-zinc-800">{weekDayLabels[day.getDay()]}</div>)}
                </div>
                <div className="grid grid-cols-7">
                  {days.map(day => {
                    const dayMeetings = meetings.filter(meeting => isSameDay(new Date(meeting.scheduledStart), day))
                      .sort((left, right) => new Date(left.scheduledStart).getTime() - new Date(right.scheduledStart).getTime());
                    return <div key={day.toISOString()} className={`min-h-40 border-b border-r border-[#dce5f3] p-2 dark:border-zinc-800 ${day.getMonth() !== focusedDate.getMonth() ? 'opacity-45' : ''} ${isSameDay(day, today) ? 'bg-[#f0f6ff] dark:bg-blue-950/20' : ''}`}>
                      <div className={`text-xs ${isSameDay(day, today) ? 'font-bold text-blue-600' : 'text-[#6073a2]'}`}>{dateLabel.format(day)}</div>
                      {periods.map((period, periodIndex) => {
                        const periodMeetings = dayMeetings.filter(meeting => periodOf(new Date(meeting.scheduledStart)) === periodIndex);
                        return periodMeetings.length > 0 && <div key={period.label} className="mt-2 space-y-1.5">
                          <div className="text-[11px] font-semibold text-[#6073a2] dark:text-zinc-400">{period.label}</div>
                          {periodMeetings.map(meeting => <MeetingCard key={meeting.id} meeting={meeting} onClick={() => setSelectedMeetingId(meeting.id)} />)}
                        </div>;
                      })}
                    </div>;
                  })}
                </div>
              </div>
            )}
          </div>
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
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate({ to: '/meetings/$meetingId', params: { meetingId: selectedMeeting.id } })} className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white"><Video className="h-4 w-4" /> Mở phòng họp</button>
            {selectedMeeting.organizerUserId === currentUser.id && selectedMeeting.status === 'Scheduled' &&
              <button type="button" onClick={() => {
                setEditingMeetingId(selectedMeeting.id);
                setSelectedMeetingId(null);
              }} className="rounded border border-blue-600 px-4 py-2 text-blue-700">Chỉnh sửa</button>}
          </div>
        </div>
      </Modal>}
      {isCreateOpen && <MeetingModal isOpen={true} onClose={() => setIsCreateOpen(false)} />}
      {editingMeetingId && <MeetingModal key={editingMeetingId} meetingId={editingMeetingId} isOpen={true}
        onClose={() => setEditingMeetingId(null)} />}
    </div>
  );
};

export default MeetingsPage;
