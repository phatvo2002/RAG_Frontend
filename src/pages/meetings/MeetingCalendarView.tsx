import { useState } from 'react';
import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react';
import type { OnlineMeeting } from '@/api/meetings.api';
import { useApp } from '@/context/AppContext';
import { isScheduledMeetingExpired } from './meetingAvailability';

const periods = [
  { name: 'Sáng', hours: '00:00 – 12:00', icon: Sun },
  { name: 'Chiều', hours: '12:00 – 18:00', icon: Sun },
  { name: 'Tối', hours: '18:00 – 24:00', icon: Moon },
] as const;
const weekdays = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function weekStart(value: Date): Date {
  const date = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  return date;
}

function addDays(value: Date, days: number): Date {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function sameDay(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function periodOf(value: Date): number {
  return value.getHours() < 12 ? 0 : value.getHours() < 18 ? 1 : 2;
}

function continuationLabel(meeting: OnlineMeeting, language: 'en' | 'vi'): string | null {
  const start = new Date(meeting.scheduledStart);
  const end = new Date(Date.parse(meeting.scheduledEnd) - 1);
  if (!sameDay(start, end)) return language === 'vi' ? 'Kéo dài sang ngày hôm sau' : 'Continues into the next day';
  const lastPeriod = periodOf(end);
  if (lastPeriod <= periodOf(start)) return null;
  return language === 'vi' ? `Kéo dài đến buổi ${lastPeriod === 1 ? 'chiều' : 'tối'}` : `Continues into the ${lastPeriod === 1 ? 'afternoon' : 'evening'}`;
}

export function MeetingCalendarView({ meetings, selectedId, now, onSelect }: {
  meetings: OnlineMeeting[];
  selectedId: string | null;
  now: number;
  onSelect: (id: string) => void;
}) {
  const { language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const localShortDate = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' });
  const localShortTime = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
  const dayNames = language === 'vi' ? weekdays : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const periodNames = language === 'vi' ? periods.map(period => period.name) : ['Morning', 'Afternoon', 'Evening'];
  const [focusedDate, setFocusedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const start = weekStart(focusedDate);
  const end = addDays(start, 6);
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  const monthStart = weekStart(new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1));
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(monthStart, index));
  const changePeriod = (direction: number) => setFocusedDate(viewMode === 'week'
    ? addDays(focusedDate, direction * 7)
    : new Date(focusedDate.getFullYear(), focusedDate.getMonth() + direction, 1));

  return <div className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-md border border-[#dce5f3] bg-white dark:border-zinc-800 dark:bg-zinc-900 xl:min-h-0">
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#dce5f3] px-4 py-3 dark:border-zinc-800">
      <strong className="text-sm text-[#102456] dark:text-zinc-100">{viewMode === 'week' ? `${localShortDate.format(start)} – ${localShortDate.format(end)}/${end.getFullYear()}` : new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(focusedDate)}</strong>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => changePeriod(-1)} aria-label={tr('Previous period', 'Kỳ trước')} className="rounded border border-[#dce5f3] p-1.5 hover:bg-[#f0f6ff] dark:border-zinc-700 dark:hover:bg-zinc-800"><ChevronLeft size={15} /></button>
        <button type="button" onClick={() => setFocusedDate(new Date())} className="rounded border border-[#dce5f3] px-2.5 py-1.5 text-xs hover:bg-[#f0f6ff] dark:border-zinc-700 dark:hover:bg-zinc-800">{tr('Today', 'Hôm nay')}</button>
        <button type="button" onClick={() => changePeriod(1)} aria-label={tr('Next period', 'Kỳ sau')} className="rounded border border-[#dce5f3] p-1.5 hover:bg-[#f0f6ff] dark:border-zinc-700 dark:hover:bg-zinc-800"><ChevronRight size={15} /></button>
        <div className="ml-1 flex rounded border border-[#dce5f3] p-0.5 text-xs dark:border-zinc-700"><button type="button" aria-pressed={viewMode === 'week'} onClick={() => setViewMode('week')} className={`rounded px-2 py-1 ${viewMode === 'week' ? 'bg-[#1762f4] text-white' : 'text-[#52678b] dark:text-zinc-300'}`}>{tr('Week', 'Tuần')}</button><button type="button" aria-pressed={viewMode === 'month'} onClick={() => setViewMode('month')} className={`rounded px-2 py-1 ${viewMode === 'month' ? 'bg-[#1762f4] text-white' : 'text-[#52678b] dark:text-zinc-300'}`}>{tr('Month', 'Tháng')}</button></div>
      </div>
    </div>
    <div className="min-h-0 flex-1 overflow-auto" aria-label={tr('Scrollable meeting calendar', 'Nội dung lịch họp có thể cuộn')}>
      <div className="min-w-[830px]">
        {viewMode === 'month' ? <>
          <div className="grid grid-cols-7 border-b border-[#dce5f3] bg-[#f7faff] text-center text-xs font-semibold text-[#243653] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">{days.map(day => <div key={day.toISOString()} className="border-r border-[#dce5f3] px-2 py-2 last:border-r-0 dark:border-zinc-800">{dayNames[day.getDay()]}</div>)}</div>
          <div className="grid grid-cols-7">{monthDays.map(day => {
            const items = meetings.filter(meeting => sameDay(new Date(meeting.scheduledStart), day)).sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
            return <div key={day.toISOString()} className={`min-h-36 space-y-1 border-b border-r border-[#dce5f3] p-2 dark:border-zinc-800 ${day.getMonth() !== focusedDate.getMonth() ? 'opacity-50' : ''} ${sameDay(day, new Date(now)) ? 'bg-[#f3f8ff] dark:bg-[#12213a]' : ''}`}>
              <span className="text-[11px] font-semibold text-[#6073a2] dark:text-zinc-400">{localShortDate.format(day)}</span>
              {items.map(meeting => <button key={meeting.id} type="button" onClick={() => onSelect(meeting.id)} className={`block w-full rounded border border-l-[3px] p-1.5 text-left text-[10px] hover:bg-[#eaf2ff] dark:hover:bg-[#1c2c43] ${selectedId === meeting.id ? 'border-[#90b9ff] border-l-[#1762f4] bg-[#eaf2ff] dark:border-blue-700 dark:bg-[#152b49]' : 'border-[#dce5f3] border-l-[#1762f4] bg-[#f7faff] dark:border-zinc-700 dark:bg-zinc-800'}`}><span className="text-[#6073a2] dark:text-zinc-400">{periodNames[periodOf(new Date(meeting.scheduledStart))]} · {localShortTime.format(new Date(meeting.scheduledStart))}</span><strong className="block truncate text-[#102456] dark:text-zinc-100" title={meeting.title}>{meeting.title}</strong>{continuationLabel(meeting, language) && <span className="text-[#6073a2] dark:text-zinc-400">{continuationLabel(meeting, language)}</span>}</button>)}
            </div>;
          })}</div>
        </> : <>
        <div className="grid grid-cols-[95px_repeat(7,minmax(0,1fr))] border-b border-[#dce5f3] bg-[#f7faff] dark:border-zinc-800 dark:bg-zinc-900">
          <div />
          {days.map(day => <div key={day.toISOString()} className={`border-l border-[#dce5f3] px-2 py-2 text-center text-xs dark:border-zinc-800 ${sameDay(day, new Date(now)) ? 'bg-[#eaf2ff] text-[#1762f4] dark:bg-[#122b52] dark:text-[#9ec2ff]' : 'text-[#243653] dark:text-zinc-200'}`}>
            <strong className="block">{dayNames[day.getDay()]}</strong><span>{localShortDate.format(day)}</span>
          </div>)}
        </div>
        {periods.map((period, periodIndex) => {
          const Icon = period.icon;
          return <div key={period.name} className="grid grid-cols-[95px_repeat(7,minmax(0,1fr))] border-b border-[#dce5f3] last:border-b-0 dark:border-zinc-800">
            <div className="flex min-h-36 flex-col justify-center bg-[#f7faff] px-3 text-xs dark:bg-zinc-900"><span className="flex items-center gap-1 font-semibold text-[#102456] dark:text-zinc-100"><Icon size={14} />{periodNames[periodIndex]}</span><span className="mt-1 text-[10px] text-[#6073a2] dark:text-zinc-400">{period.hours}</span></div>
            {days.map(day => {
              const items = meetings.filter(meeting => sameDay(new Date(meeting.scheduledStart), day) && periodOf(new Date(meeting.scheduledStart)) === periodIndex)
                .sort((a, b) => Date.parse(a.scheduledStart) - Date.parse(b.scheduledStart));
              return <div key={day.toISOString()} className={`min-h-36 space-y-1.5 border-l border-[#dce5f3] p-1.5 dark:border-zinc-800 ${sameDay(day, new Date(now)) ? 'bg-[#f3f8ff] dark:bg-[#12213a]' : ''}`}>
                {items.map(meeting => <button key={meeting.id} type="button" onClick={() => onSelect(meeting.id)} className={`w-full rounded border border-l-[3px] p-1.5 text-left text-[10px] hover:bg-[#eaf2ff] dark:hover:bg-[#1c2c43] ${selectedId === meeting.id ? 'border-[#90b9ff] border-l-[#1762f4] bg-[#eaf2ff] dark:border-blue-700 dark:bg-[#152b49]' : 'border-[#dce5f3] border-l-[#1762f4] bg-[#f7faff] dark:border-zinc-700 dark:bg-zinc-800'}`}>
                  <span className="block text-[#6073a2] dark:text-zinc-400">{localShortTime.format(new Date(meeting.scheduledStart))} – {localShortTime.format(new Date(meeting.scheduledEnd))}</span>
                  <strong className="block truncate text-[#102456] dark:text-zinc-100" title={meeting.title}>{meeting.title}</strong>
                  <span className="text-[#6073a2] dark:text-zinc-400">{isScheduledMeetingExpired(meeting, now) ? tr('Overdue', 'Quá hạn') : meeting.status === 'Live' ? tr('Live', 'Đang họp') : meeting.status === 'Ended' ? tr('Ended', 'Đã kết thúc') : meeting.status === 'Ending' ? tr('Ending', 'Đang kết thúc') : tr('Upcoming', 'Sắp diễn ra')}</span>
                  {continuationLabel(meeting, language) && <span className="block text-[#6073a2] dark:text-zinc-400">{continuationLabel(meeting, language)}</span>}
                </button>)}
              </div>;
            })}
          </div>;
        })}
        </>}
      </div>
    </div>
  </div>;
}
