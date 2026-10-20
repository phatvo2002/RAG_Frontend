import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { ArrowLeft, Video } from 'lucide-react';
import '@livekit/components-styles';
import { meetingKeys, meetingsApi, useMeetingQuery, type MeetingJoinToken } from '@/api/meetings.api';
import { useApp } from '@/context/AppContext';
import { MeetingModal } from './MeetingModal';
import { isScheduledMeetingExpired, useMeetingClock } from './meetingAvailability';
import { TranscriptPanel, TranscriptStreamListener, type TranscriptEvent } from './TranscriptPanel';

export const MeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams({ from: '/meetings/$meetingId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser, showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const meeting = useMeetingQuery(meetingId);
  const now = useMeetingClock();
  const [connection, setConnection] = useState<MeetingJoinToken | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState<'' | 'vi' | 'en'>('');
  const [liveSegments, setLiveSegments] = useState<Record<string, TranscriptEvent>>({});
  const [workerAvailable, setWorkerAvailable] = useState(false);
  const value = meeting.data;
  const transcript = useQuery({
    queryKey: meetingKeys.transcript(meetingId),
    queryFn: () => meetingsApi.transcript(meetingId),
    enabled: !!value,
    refetchInterval: value?.status === 'Live' ? 5000 : false,
  });
  useEffect(() => { if (value) setSourceLanguage(value.mySourceLanguage ?? ''); }, [value?.mySourceLanguage]);
  const onTranscriptEvent = useCallback((event: TranscriptEvent) => {
    setLiveSegments(current => current[event.segmentId]?.type === 'final' && event.type === 'partial'
      ? current : { ...current, [event.segmentId]: event });
    if (event.type === 'final') void queryClient.invalidateQueries({ queryKey: meetingKeys.transcript(meetingId) });
  }, [meetingId, queryClient]);
  const onWorkerAvailability = useCallback((available: boolean) => setWorkerAvailable(available), []);
  const segments = useMemo(() => {
    const merged = { ...liveSegments };
    for (const item of transcript.data ?? []) merged[item.segmentId] = { ...item, type: 'final' };
    return Object.values(merged).sort((a, b) => a.startedAt.localeCompare(b.startedAt) || a.segmentId.localeCompare(b.segmentId));
  }, [liveSegments, transcript.data]);
  const isHost = value?.organizerUserId === currentUser.id;
  const isExpired = value ? isScheduledMeetingExpired(value, now) : false;
  const statusLabel = isExpired ? tr('Overdue', 'Quá hạn') : {
    Scheduled: tr('Not started', 'Chưa bắt đầu'),
    Live: tr('Live', 'Đang diễn ra'),
    Ending: tr('Ending', 'Đang kết thúc'),
    Ended: tr('Ended', 'Đã kết thúc'),
  }[value?.status ?? 'Scheduled'];

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) });
      await queryClient.invalidateQueries({ queryKey: meetingKeys.list });
    } catch (error) {
      showToast(error instanceof Error ? error.message : tr('Action failed.', 'Thao tác không thành công.'), 'error');
    } finally {
      setBusy(false);
    }
  };

  if (meeting.isLoading) return <div className="p-6">{tr('Loading meeting...', 'Đang tải cuộc họp...')}</div>;
  if (meeting.isError || !value) return <div className="p-6">{tr('Could not open this meeting, or you do not have access.', 'Không thể mở cuộc họp hoặc bạn không có quyền truy cập.')}</div>;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-white px-4 py-6 text-[#0b1b33] sm:px-6 lg:px-8 dark:bg-[#0d1422] dark:text-zinc-100">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dce5f3] pb-5 dark:border-[#223149]">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate({ to: '/meetings' })}
            className="inline-flex items-center gap-1.5 text-base font-medium text-[#1769ee] hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            {tr('Back to meetings', 'Quay lại danh sách cuộc họp')}
          </button>
          <h1 className="mt-3 truncate text-[28px] font-bold leading-tight">{value.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-base text-[#60738e] dark:text-slate-400">
            <span>{isHost ? tr('Host', 'Chủ phòng') : tr('Participant', 'Người tham gia')}</span>
            <span aria-hidden="true">·</span>
            <span className="rounded-md bg-[#eaf0f9] px-2 py-0.5 text-[#4b617e] dark:bg-[#1b2a43] dark:text-slate-300">{statusLabel}</span>
          </div>
        </div>
        {isHost && value.status === 'Scheduled' && !isExpired && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => meetingsApi.start(meetingId))}
            className="rounded-md bg-[#155dfb] px-5 py-2.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-[#0f4bd1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tr('Start meeting', 'Bắt đầu cuộc họp')}
          </button>
        )}
        {isHost && (value.status === 'Live' || value.status === 'Ending') && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => meetingsApi.end(meetingId))}
            className="rounded-md bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {value.status === 'Ending' ? tr('Retry ending', 'Thử kết thúc lại') : tr('End for everyone', 'Kết thúc cho tất cả')}
          </button>
        )}
      </header>

      {value.status !== 'Ended' && <div className="mt-4 flex items-center gap-3">
        <label htmlFor="meeting-source-language" className="text-sm font-medium">{tr('Your spoken language', 'Ngôn ngữ bạn nói')}</label>
        <select id="meeting-source-language" value={sourceLanguage} disabled={busy || value.status === 'Ending'}
          onChange={event => {
            const selected = event.target.value as 'vi' | 'en';
            setSourceLanguage(selected);
            void run(() => meetingsApi.setSourceLanguage(meetingId, selected));
          }} className="rounded border border-[#dce5f3] bg-white px-3 py-2 text-sm dark:border-[#223149] dark:bg-[#111b2c]">
          <option value="" disabled>{tr('Choose language', 'Chọn ngôn ngữ')}</option>
          <option value="vi">Tiếng Việt</option><option value="en">English</option>
        </select>
      </div>}

      <div className={`mt-5 grid min-h-0 gap-5 ${value.status === 'Ended' ? '' : 'xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]'}`}>
      {value.status !== 'Ended' && (value.status !== 'Live' || !connection ? (
        <section className="flex min-h-[480px] flex-col items-center justify-center rounded-xl bg-[#f4f8ff] px-6 py-12 text-center dark:bg-[#111b2c]">
          <span className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#e5efff] text-[#1769ee] dark:bg-[#18335f] dark:text-blue-400">
            <Video size={43} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <h2 className="mt-6 text-[27px] font-bold leading-tight">
            {isExpired ? tr('Meeting overdue', 'Cuộc họp đã quá hạn')
              : value.status === 'Scheduled' ? (isHost ? tr('Meeting room ready', 'Phòng họp sẵn sàng') : tr('Waiting for the host', 'Đang chờ chủ phòng'))
              : value.status === 'Ending' ? tr('Closing the meeting room', 'Đang đóng phòng họp') : tr('Meeting started', 'Phòng họp đã bắt đầu')}
          </h2>
          <p className="mt-3 text-lg text-[#60738e] dark:text-slate-400">
            {isExpired ? (isHost ? tr('Update the schedule to open the room.', 'Cập nhật thời gian dự kiến để mở phòng họp.') : tr('The host must update the schedule before opening the room.', 'Chủ phòng cần cập nhật thời gian trước khi mở phòng họp.'))
              : value.status === 'Scheduled' ? (isHost ? tr('Start the meeting to open the room.', 'Bắt đầu để mở phòng họp.') : tr('The meeting will start when the host opens the room.', 'Cuộc họp sẽ bắt đầu khi chủ phòng mở phòng.'))
              : value.status === 'Ending' ? tr('Please wait a moment.', 'Vui lòng chờ trong giây lát.') : tr('Allow browser access to your camera and microphone when joining.', 'Cho phép trình duyệt dùng camera và micro khi tham gia.')}
          </p>
          {isExpired && isHost && (
            <button type="button" onClick={() => setIsEditOpen(true)}
              className="mt-6 rounded-md bg-[#155dfb] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0f4bd1]">
              {tr('Update schedule', 'Cập nhật thời gian')}
            </button>
          )}
          {value.status === 'Live' && (
            <button
              type="button"
              disabled={busy || !sourceLanguage}
              onClick={() => run(async () => { setConnection(await meetingsApi.join(meetingId)); })}
              className="mt-6 rounded-md bg-[#155dfb] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0f4bd1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {tr('Join room', 'Vào phòng')}
            </button>
          )}
        </section>
      ) : (
        <div className="h-[65vh] min-h-[480px] max-h-[900px] min-w-0 overflow-hidden rounded-xl bg-[#111] xl:h-[75vh]" data-lk-theme="default">
          <LiveKitRoom token={connection.token} serverUrl={connection.url} connect={true} audio={true} video={true}
            className="h-full"
            onDisconnected={() => { setConnection(null); setWorkerAvailable(false); void meeting.refetch(); void transcript.refetch(); }}
            onError={error => showToast(error.message, 'error')}>
            <TranscriptStreamListener meetingId={meetingId} onEvent={onTranscriptEvent} onAvailability={onWorkerAvailability} />
            <VideoConference />
          </LiveKitRoom>
        </div>
      ))}
      <div className="min-h-0 xl:h-[75vh] xl:max-h-[900px]">
        {value.status === 'Ended' && transcript.isLoading ? (
          <p className="p-4 text-sm text-[#60738e]">{tr('Loading transcript...', 'Đang tải bản phiên âm...')}</p>
        ) : value.status === 'Ended' && transcript.isError ? (
          <p role="alert" className="p-4 text-sm text-rose-700 dark:text-rose-300">{tr('Could not load transcript.', 'Không tải được bản phiên âm.')} <button type="button" onClick={() => void transcript.refetch()} className="font-semibold underline">{tr('Retry', 'Thử lại')}</button></p>
        ) : <TranscriptPanel segments={segments} participants={value.participants} language={language}
          unavailable={value.status === 'Live' && !!connection && !workerAvailable} />}
      </div>
      </div>
      {isEditOpen && <MeetingModal meetingId={meetingId} isOpen={true} onClose={() => setIsEditOpen(false)} />}
    </div>
  );
};
