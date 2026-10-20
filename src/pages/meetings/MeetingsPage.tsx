import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, FileText, Filter, List, Plus, Search, Users, Video, X } from 'lucide-react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { meetingKeys, meetingsApi, useMeetingsQuery, type OnlineMeeting } from '@/api/meetings.api';
import { MeetingModal } from './MeetingModal';
import { MeetingCalendarView } from './MeetingCalendarView';
import { isScheduledMeetingExpired, useMeetingClock } from './meetingAvailability';

type MeetingTab = 'upcoming' | 'ended' | 'overdue';
type RoleFilter = 'all' | 'host' | 'participant';
type ViewMode = 'list' | 'calendar';

const PAGE_SIZE = 20;
const formatters = (language: 'en' | 'vi') => ({
  timeLabel: new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
  dateLabel: new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' }),
  fullDateLabel: new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'full' }),
});

function localDateKey(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dayHeading(value: string, today: string, language: 'en' | 'vi'): string {
  const { dateLabel } = formatters(language);
  if (value === today) return `${language === 'vi' ? 'Hôm nay' : 'Today'} · ${dateLabel.format(new Date(`${value}T12:00:00`))}`;
  return dateLabel.format(new Date(`${value}T12:00:00`));
}

function meetingStatus(meeting: OnlineMeeting, now: number, language: 'en' | 'vi'): { label: string; className: string; dot: string } {
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  if (isScheduledMeetingExpired(meeting, now)) return { label: tr('Overdue', 'Quá hạn'), className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', dot: 'bg-amber-500' };
  switch (meeting.status) {
    case 'Live': return { label: tr('Live', 'Đang họp'), className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300', dot: 'bg-emerald-500' };
    case 'Ending': return { label: tr('Ending', 'Đang kết thúc'), className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300', dot: 'bg-amber-500' };
    case 'Ended': return { label: tr('Ended', 'Đã kết thúc'), className: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-200', dot: 'bg-slate-400' };
    default: return { label: tr('Upcoming', 'Sắp diễn ra'), className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', dot: 'bg-[#1762f4]' };
  }
}

function initials(value: string): string {
  return value.trim().split(/\s+/).map(part => part[0]).slice(-2).join('').toUpperCase() || '?';
}

export const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const { timeLabel, fullDateLabel } = useMemo(() => formatters(language), [language]);
  const meetingsQuery = useMeetingsQuery();
  const now = useMeetingClock();
  const [tab, setTab] = useState<MeetingTab>('upcoming');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(true);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);

  const meetings = meetingsQuery.data ?? [];
  const today = localDateKey(new Date(now));
  const counts = {
    upcoming: meetings.filter(meeting => meeting.status !== 'Ended' && !isScheduledMeetingExpired(meeting, now)).length,
    ended: meetings.filter(meeting => meeting.status === 'Ended').length,
    overdue: meetings.filter(meeting => isScheduledMeetingExpired(meeting, now)).length,
  };

  const filteredMeetings = useMemo(() => meetings.filter(meeting => {
    const expired = isScheduledMeetingExpired(meeting, now);
    if (tab === 'upcoming' && (meeting.status === 'Ended' || expired)) return false;
    if (tab === 'ended' && meeting.status !== 'Ended') return false;
    if (tab === 'overdue' && !expired) return false;
    if (search.trim() && !meeting.title.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN'))) return false;
    const key = localDateKey(meeting.scheduledStart);
    if (fromDate && key < fromDate) return false;
    if (toDate && key > toDate) return false;
    if (roleFilter === 'host' && meeting.organizerUserId !== currentUser.id) return false;
    if (roleFilter === 'participant' && meeting.organizerUserId === currentUser.id) return false;
    return true;
  }).sort((left, right) => tab === 'ended'
    ? Date.parse(right.scheduledStart) - Date.parse(left.scheduledStart)
    : Date.parse(left.scheduledStart) - Date.parse(right.scheduledStart)), [meetings, now, tab, search, fromDate, toDate, roleFilter, currentUser.id]);

  const pageCount = Math.max(1, Math.ceil(filteredMeetings.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageMeetings = filteredMeetings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const visibleMeetings = viewMode === 'list' ? pageMeetings : filteredMeetings;
  const activeMeetingId = visibleMeetings.find(meeting => meeting.id === selectedMeetingId)?.id ?? visibleMeetings[0]?.id ?? null;
  const selectedMeeting = meetings.find(meeting => meeting.id === activeMeetingId) ?? null;
  const detailQuery = useQuery({
    queryKey: meetingKeys.detail(activeMeetingId ?? ''),
    queryFn: () => meetingsApi.get(activeMeetingId!),
    enabled: Boolean(activeMeetingId && detailOpen),
    refetchInterval: 3000,
  });

  const selectMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setShowAllParticipants(false);
    setDetailOpen(true);
  };

  const chooseTab = (next: MeetingTab) => {
    setTab(next);
    setPage(1);
    setSelectedMeetingId(null);
  };

  const canOpenRoom = selectedMeeting && (selectedMeeting.status === 'Live'
    || (selectedMeeting.status === 'Scheduled' && !isScheduledMeetingExpired(selectedMeeting, now)));
  const canEdit = selectedMeeting?.status === 'Scheduled' && selectedMeeting.organizerUserId === currentUser.id;
  const detail = detailQuery.data;
  const host = detail?.participants.find(participant => participant.id === detail.organizerUserId);
  const shownParticipants = showAllParticipants ? detail?.participants : detail?.participants.slice(0, 6);

  return <div className="nexora-page flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#f7faff] dark:bg-black">
    <Header />
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#dce5f3] bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div><h1 className="text-[25px] font-bold leading-tight text-[#102456] dark:text-zinc-100">{tr('Meetings', 'Cuộc họp')}</h1><p className="mt-0.5 text-xs text-[#6073a2] dark:text-zinc-400">{tr('Plan, coordinate, and track meetings in your organization.', 'Lập kế hoạch, điều phối và theo dõi các cuộc họp trong tổ chức.')}</p></div>
      <button type="button" onClick={() => setIsCreateOpen(true)} className="flex items-center gap-1.5 rounded bg-[#0759ee] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#126bff]"><Plus size={16} />{tr('Create meeting', 'Tạo cuộc họp')}</button>
    </div>

    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-4 lg:p-5">
      <div className="mb-3 flex shrink-0 flex-wrap gap-1 border-b border-[#dce5f3] text-xs font-semibold dark:border-zinc-800">
        {([['upcoming', `${tr('Upcoming', 'Sắp tới')} (${counts.upcoming})`], ['ended', `${tr('Ended', 'Đã kết thúc')} (${counts.ended})`], ['overdue', `${tr('Schedule update needed', 'Cần cập nhật lịch')} (${counts.overdue})`]] as const).map(([key, label]) =>
          <button key={key} type="button" aria-selected={tab === key} role="tab" onClick={() => chooseTab(key)} className={`border-b-2 px-3 py-2.5 ${tab === key ? 'border-[#1762f4] text-[#1762f4] dark:text-blue-400' : 'border-transparent text-[#6073a2] hover:text-[#1762f4] dark:text-zinc-400 dark:hover:text-blue-300'}`}>{label}</button>)}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 xl:flex-row">
        <section className="flex min-w-0 flex-1 flex-col xl:min-h-0" aria-label={tr('Meeting list', 'Danh sách cuộc họp')}>
          <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2">
            <label className="flex h-9 min-w-[170px] flex-1 items-center gap-2 rounded border border-[#dce5f3] bg-white px-2.5 text-[#6073a2] dark:border-zinc-800 dark:bg-zinc-900"><Search size={15} /><input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder={tr('Search meetings...', 'Tìm cuộc họp...')} aria-label={tr('Search meetings', 'Tìm cuộc họp')} className="min-w-0 flex-1 bg-transparent text-xs text-[#102456] outline-none placeholder:text-[#8da0bf] dark:text-zinc-100" /></label>
            <label className="flex h-9 items-center gap-1.5 rounded border border-[#dce5f3] bg-white px-2 text-[#6073a2] dark:border-zinc-800 dark:bg-zinc-900"><CalendarDays size={14} /><span className="sr-only">{tr('From date', 'Từ ngày')}</span><input type="date" value={fromDate} onChange={event => { setFromDate(event.target.value); setPage(1); }} className="w-[108px] bg-transparent text-[11px] text-[#243653] outline-none dark:text-zinc-100" /></label>
            <span className="text-xs text-[#8da0bf]">–</span>
            <label className="flex h-9 items-center rounded border border-[#dce5f3] bg-white px-2 dark:border-zinc-800 dark:bg-zinc-900"><span className="sr-only">{tr('To date', 'Đến ngày')}</span><input type="date" value={toDate} onChange={event => { setToDate(event.target.value); setPage(1); }} className="w-[108px] bg-transparent text-[11px] text-[#243653] outline-none dark:text-zinc-100" /></label>
            <button type="button" onClick={() => { setFromDate(today); setToDate(today); setPage(1); }} className="h-9 rounded border border-[#dce5f3] bg-white px-2.5 text-[11px] font-medium text-[#243653] hover:bg-[#f0f6ff] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800">{tr('Today', 'Hôm nay')}</button>
            {(fromDate || toDate) && <button type="button" onClick={() => { setFromDate(''); setToDate(''); setPage(1); }} className="h-9 px-1 text-[11px] text-[#1762f4] hover:underline dark:text-blue-400">{tr('Clear dates', 'Xóa ngày')}</button>}
            <div className="flex h-9 rounded border border-[#dce5f3] bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
              <button type="button" aria-pressed={viewMode === 'list'} onClick={() => setViewMode('list')} className={`flex items-center gap-1 rounded px-2 text-[11px] ${viewMode === 'list' ? 'bg-[#1762f4] text-white' : 'text-[#52678b] hover:bg-[#f0f6ff] dark:text-zinc-300 dark:hover:bg-zinc-800'}`}><List size={14} />{tr('List', 'Danh sách')}</button>
              <button type="button" aria-pressed={viewMode === 'calendar'} onClick={() => setViewMode('calendar')} className={`flex items-center gap-1 rounded px-2 text-[11px] ${viewMode === 'calendar' ? 'bg-[#1762f4] text-white' : 'text-[#52678b] hover:bg-[#f0f6ff] dark:text-zinc-300 dark:hover:bg-zinc-800'}`}><CalendarDays size={14} />{tr('Calendar', 'Lịch')}</button>
            </div>
            <div className="relative"><button type="button" aria-expanded={filterOpen} onClick={() => setFilterOpen(open => !open)} className="flex h-9 items-center gap-1 rounded border border-[#dce5f3] bg-white px-2.5 text-[11px] font-medium text-[#243653] hover:bg-[#f0f6ff] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"><Filter size={14} />{tr('Filter', 'Bộ lọc')}</button>
              {filterOpen && <div className="absolute right-0 top-10 z-20 w-48 rounded border border-[#dce5f3] bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"><p className="px-2 py-1 text-[11px] font-semibold text-[#6073a2] dark:text-zinc-400">{tr('Your role', 'Vai trò của bạn')}</p>{([['all', tr('All', 'Tất cả')], ['host', tr('Host', 'Chủ phòng')], ['participant', tr('Participant', 'Người tham gia')]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => { setRoleFilter(value); setPage(1); setFilterOpen(false); }} className={`block w-full rounded px-2 py-1.5 text-left text-xs ${roleFilter === value ? 'bg-[#eaf2ff] font-semibold text-[#1762f4] dark:bg-[#152b49] dark:text-blue-300' : 'text-[#243653] hover:bg-[#f4f7fc] dark:text-zinc-200 dark:hover:bg-zinc-800'}`}>{label}</button>)}</div>}
            </div>
          </div>

          {meetingsQuery.isLoading && <div className="rounded border border-[#dce5f3] bg-white p-6 text-sm text-[#6073a2] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">{tr('Loading meetings...', 'Đang tải cuộc họp...')}</div>}
          {meetingsQuery.isError && <div role="alert" className="rounded border border-rose-200 bg-white p-6 text-sm text-rose-700 dark:border-rose-900 dark:bg-zinc-900 dark:text-rose-300">{tr('Could not load meetings from the server.', 'Không tải được cuộc họp từ máy chủ.')} <button type="button" onClick={() => void meetingsQuery.refetch()} className="font-semibold underline">{tr('Retry', 'Thử lại')}</button></div>}
          {meetingsQuery.isSuccess && (viewMode === 'calendar'
            ? <MeetingCalendarView meetings={filteredMeetings} selectedId={activeMeetingId} now={now} onSelect={selectMeeting} />
            : <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded border border-[#dce5f3] bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="hidden grid-cols-[90px_minmax(180px,1fr)_92px_100px_104px] gap-2 border-b border-[#dce5f3] px-3 py-3 text-[11px] font-semibold text-[#6073a2] dark:border-zinc-800 dark:text-zinc-400 md:grid"><span>{tr('Time', 'Thời gian')}</span><span>{tr('Meeting', 'Cuộc họp')}</span><span>{tr('Role', 'Vai trò')}</span><span>{tr('Format', 'Hình thức')}</span><span>{tr('Status', 'Trạng thái')}</span></div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {pageMeetings.length === 0 && <div className="px-6 py-12 text-center text-sm text-[#6073a2] dark:text-zinc-400">{tr('No meetings match the current filters.', 'Không có cuộc họp phù hợp với bộ lọc hiện tại.')}</div>}
                {pageMeetings.map((meeting, index) => {
                  const key = localDateKey(meeting.scheduledStart);
                  const previousKey = index > 0 ? localDateKey(pageMeetings[index - 1].scheduledStart) : null;
                  const status = meetingStatus(meeting, now, language);
                  return <React.Fragment key={meeting.id}>
                    {key !== previousKey && <div className="border-y border-[#e7edf6] bg-[#f4f7fc] px-3 py-2 text-[11px] font-semibold capitalize text-[#344e76] first:border-t-0 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">{dayHeading(key, today, language)}</div>}
                    <button type="button" onClick={() => selectMeeting(meeting.id)} aria-current={activeMeetingId === meeting.id && detailOpen ? 'true' : undefined} className={`grid w-full grid-cols-[88px_minmax(0,1fr)] items-center gap-x-2 gap-y-1 border-b border-[#edf1f7] border-l-[3px] px-3 py-3 text-left text-[11px] transition-colors last:border-b-0 hover:bg-[#f5f9ff] dark:border-zinc-800 dark:hover:bg-[#1c2c43] md:grid-cols-[90px_minmax(180px,1fr)_92px_100px_104px] ${activeMeetingId === meeting.id && detailOpen ? 'border-l-[#1762f4] bg-[#eef5ff] dark:bg-[#152b49]' : 'border-l-transparent'}`}>
                      <span className="whitespace-nowrap font-medium text-[#344e76] dark:text-zinc-200">{timeLabel.format(new Date(meeting.scheduledStart))} –<br />{timeLabel.format(new Date(meeting.scheduledEnd))}</span>
                      <span className="min-w-0"><strong className="block truncate text-xs text-[#102456] dark:text-zinc-100" title={meeting.title}>{meeting.title}</strong><span className="mt-0.5 block text-[11px] text-[#6073a2] dark:text-zinc-400">{tr('Online meeting room', 'Phòng họp trực tuyến')}</span></span>
                      <span className="hidden text-[#344e76] dark:text-zinc-300 md:block">{meeting.organizerUserId === currentUser.id ? tr('Host', 'Chủ phòng') : tr('Participant', 'Tham gia')}</span>
                      <span className="hidden items-center gap-1 text-[#344e76] dark:text-zinc-300 md:flex"><Video size={13} />{tr('Online', 'Trực tuyến')}</span>
                      <span className={`col-start-2 inline-flex w-fit items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold md:col-auto ${status.className}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span>
                    </button>
                  </React.Fragment>;
                })}
              </div>
              <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#dce5f3] px-3 py-2 text-[11px] text-[#6073a2] dark:border-zinc-800 dark:text-zinc-400"><span>{tr('Showing', 'Hiển thị')} {filteredMeetings.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0} – {Math.min(currentPage * PAGE_SIZE, filteredMeetings.length)} {tr('of', 'của')} {filteredMeetings.length} {tr('meetings', 'cuộc họp')}</span><div className="flex items-center gap-1"><button type="button" disabled={currentPage === 1} aria-label={tr('Previous page', 'Trang trước')} onClick={() => setPage(currentPage - 1)} className="rounded border border-[#dce5f3] p-1 disabled:opacity-40 dark:border-zinc-700"><ChevronLeft size={14} /></button><span className="min-w-7 rounded bg-[#1762f4] px-2 py-1 text-center font-semibold text-white">{currentPage}</span><span>/ {pageCount}</span><button type="button" disabled={currentPage === pageCount} aria-label={tr('Next page', 'Trang sau')} onClick={() => setPage(currentPage + 1)} className="rounded border border-[#dce5f3] p-1 disabled:opacity-40 dark:border-zinc-700"><ChevronRight size={14} /></button></div></div>
            </div>)}
        </section>

        {detailOpen && <aside className="flex min-h-[360px] w-full shrink-0 flex-col overflow-hidden rounded border border-[#dce5f3] bg-white dark:border-zinc-800 dark:bg-zinc-900 xl:w-[335px]" aria-label={tr('Meeting details', 'Chi tiết cuộc họp')}>
          <div className="flex items-center justify-between border-b border-[#e7edf6] px-4 py-3 dark:border-zinc-800"><h2 className="text-sm font-bold text-[#102456] dark:text-zinc-100">{tr('Meeting details', 'Chi tiết cuộc họp')}</h2><button type="button" onClick={() => setDetailOpen(false)} aria-label={tr('Close details', 'Đóng chi tiết')} className="rounded p-1 text-[#6073a2] hover:bg-[#f0f6ff] dark:text-zinc-400 dark:hover:bg-zinc-800"><X size={16} /></button></div>
          {!selectedMeeting && <p className="p-5 text-xs text-[#6073a2]">{tr('Select a meeting to view its details.', 'Chọn một cuộc họp để xem chi tiết.')}</p>}
          {selectedMeeting && <>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="flex items-start justify-between gap-2"><h3 className="min-w-0 text-base font-bold text-[#102456] dark:text-zinc-100">{selectedMeeting.title}</h3><span className={`shrink-0 rounded px-1.5 py-1 text-[10px] font-semibold ${meetingStatus(selectedMeeting, now, language).className}`}>{meetingStatus(selectedMeeting, now, language).label}</span></div>
              <div className="mt-4 border-b-2 border-[#1762f4] pb-2 text-xs font-semibold text-[#1762f4]">{tr('Details', 'Chi tiết')}</div>
              {detailQuery.isLoading && <p className="py-5 text-xs text-[#6073a2]">{tr('Loading details...', 'Đang tải chi tiết...')}</p>}
              {detailQuery.isError && <p role="alert" className="py-5 text-xs text-rose-700 dark:text-rose-300">{tr('Could not load meeting details.', 'Không tải được chi tiết cuộc họp.')} <button type="button" onClick={() => void detailQuery.refetch()} className="font-semibold underline">{tr('Retry', 'Thử lại')}</button></p>}
              {detail && <div className="space-y-4 pt-4 text-xs text-[#344e76] dark:text-zinc-300">
                <section><h4 className="mb-3 font-bold text-[#102456] dark:text-zinc-100">{tr('Overview', 'Tổng quan')}</h4><div className="space-y-3">
                  <div className="flex items-start gap-2"><CalendarDays size={15} className="mt-0.5 shrink-0 text-[#6073a2]" /><span>{fullDateLabel.format(new Date(detail.scheduledStart))}<br />{timeLabel.format(new Date(detail.scheduledStart))} – {timeLabel.format(new Date(detail.scheduledEnd))}</span></div>
                  <div className="flex items-center gap-2"><Video size={15} className="shrink-0 text-[#6073a2]" /><span>{tr('Online meeting room', 'Phòng họp trực tuyến')}</span></div>
                  <div className="flex items-center gap-2"><Users size={15} className="shrink-0 text-[#6073a2]" /><span>{tr('Your role:', 'Vai trò của bạn:')} {detail.organizerUserId === currentUser.id ? tr('Host', 'Chủ phòng') : tr('Participant', 'Người tham gia')}</span></div>
                  {detail.actualStartedAt && <div className="flex items-center gap-2"><Clock3 size={15} className="shrink-0 text-[#6073a2]" /><span>{tr('Actual start:', 'Bắt đầu thực tế:')} {timeLabel.format(new Date(detail.actualStartedAt))}</span></div>}
                  {detail.actualEndedAt && <div className="flex items-center gap-2"><Clock3 size={15} className="shrink-0 text-[#6073a2]" /><span>{tr('Actual end:', 'Kết thúc thực tế:')} {timeLabel.format(new Date(detail.actualEndedAt))}</span></div>}
                </div></section>
                <section className="border-t border-[#e7edf6] pt-4 dark:border-zinc-800"><h4 className="mb-3 font-bold text-[#102456] dark:text-zinc-100">{tr('Organizer', 'Người tổ chức')}</h4><div className="flex items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eaf2ff] text-[10px] font-bold text-[#1762f4]">{initials(host?.displayName ?? tr('Host', 'Chủ phòng'))}</span><span className="min-w-0"><strong className="block truncate text-[#102456] dark:text-zinc-100">{host?.displayName ?? tr('Host', 'Chủ phòng')}</strong>{host?.email && <span className="block truncate text-[10px] text-[#6073a2]">{host.email}</span>}</span></div></section>
                <section className="border-t border-[#e7edf6] pt-4 dark:border-zinc-800"><h4 className="mb-3 font-bold text-[#102456] dark:text-zinc-100">{tr('Participants', 'Người tham gia')} ({detail.participants.length})</h4><div className="space-y-2">{shownParticipants?.map(participant => <div key={participant.id} className="flex items-center gap-2"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eaf2ff] text-[9px] font-bold text-[#1762f4]">{initials(participant.displayName)}</span><span className="min-w-0 truncate">{participant.displayName}</span>{participant.id === detail.organizerUserId && <span className="ml-auto shrink-0 text-[10px] text-[#6073a2]">{tr('Host', 'Chủ phòng')}</span>}</div>)}</div>{detail.participants.length > 6 && <button type="button" onClick={() => setShowAllParticipants(value => !value)} className="mt-2 text-[11px] font-semibold text-[#1762f4] hover:underline">{showAllParticipants ? tr('Show less', 'Thu gọn') : tr('View all', 'Xem tất cả')}</button>}</section>
                {isScheduledMeetingExpired(detail, now) && <p role="status" className="rounded border border-amber-200 bg-amber-50 p-2.5 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">{tr('The scheduled meeting time has passed.', 'Cuộc họp đã quá thời gian dự kiến.')} {canEdit ? tr('Update the schedule to open the room.', 'Hãy cập nhật thời gian để mở phòng họp.') : tr('The host must update the schedule before opening the room.', 'Chủ phòng cần cập nhật thời gian trước khi mở phòng họp.')}</p>}
              </div>}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-[#e7edf6] p-3 dark:border-zinc-800">
              {canOpenRoom && <button type="button" onClick={() => navigate({ to: '/meetings/$meetingId', params: { meetingId: selectedMeeting.id } })} className="flex items-center gap-1.5 rounded bg-[#0759ee] px-3 py-2 text-xs font-semibold text-white hover:bg-[#126bff]"><Video size={15} />{selectedMeeting.status === 'Live' ? tr('Join meeting', 'Tham gia cuộc họp') : tr('Open meeting room', 'Mở phòng họp')}</button>}
              {selectedMeeting.status === 'Ended' && <button type="button" onClick={() => navigate({ to: '/meetings/$meetingId', params: { meetingId: selectedMeeting.id } })} className="flex items-center gap-1.5 rounded bg-[#0759ee] px-3 py-2 text-xs font-semibold text-white hover:bg-[#126bff]"><FileText size={15} />{tr('View transcript', 'Xem bản phiên âm')}</button>}
              {canEdit && <button type="button" onClick={() => setEditingMeetingId(selectedMeeting.id)} className="rounded border border-[#c9d9f2] px-3 py-2 text-xs font-semibold text-[#1762f4] hover:bg-[#f0f6ff] dark:border-blue-800 dark:text-blue-300 dark:hover:bg-[#152b49]">{isScheduledMeetingExpired(selectedMeeting, now) ? tr('Update schedule', 'Cập nhật thời gian') : tr('Edit', 'Chỉnh sửa')}</button>}
            </div>
          </>}
        </aside>}
      </div>
    </div>

    {isCreateOpen && <MeetingModal isOpen={true} onClose={() => setIsCreateOpen(false)} />}
    {editingMeetingId && <MeetingModal key={editingMeetingId} meetingId={editingMeetingId} isOpen={true} onClose={() => setEditingMeetingId(null)} />}
  </div>;
};

export default MeetingsPage;
