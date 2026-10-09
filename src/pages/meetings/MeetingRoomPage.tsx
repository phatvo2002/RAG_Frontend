import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import { ArrowLeft, Video } from 'lucide-react';
import '@livekit/components-styles';
import { meetingKeys, meetingsApi, useMeetingQuery, type MeetingJoinToken } from '@/api/meetings.api';
import { useApp } from '@/context/AppContext';

export const MeetingRoomPage: React.FC = () => {
  const { meetingId } = useParams({ from: '/meetings/$meetingId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentUser, showToast } = useApp();
  const meeting = useMeetingQuery(meetingId);
  const [connection, setConnection] = useState<MeetingJoinToken | null>(null);
  const [busy, setBusy] = useState(false);
  const value = meeting.data;
  const isHost = value?.organizerUserId === currentUser.id;
  const statusLabel = {
    Scheduled: 'Chưa bắt đầu',
    Live: 'Đang diễn ra',
    Ending: 'Đang kết thúc',
    Ended: 'Đã kết thúc',
  }[value?.status ?? 'Scheduled'];

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) });
      await queryClient.invalidateQueries({ queryKey: meetingKeys.list });
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Thao tác không thành công.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (meeting.isLoading) return <div className="p-6">Đang tải cuộc họp...</div>;
  if (meeting.isError || !value) return <div className="p-6">Không thể mở cuộc họp hoặc bạn không có quyền truy cập.</div>;

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
            Quay lại danh sách cuộc họp
          </button>
          <h1 className="mt-3 truncate text-[28px] font-bold leading-tight">{value.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-base text-[#60738e] dark:text-slate-400">
            <span>{isHost ? 'Chủ phòng' : 'Người tham gia'}</span>
            <span aria-hidden="true">·</span>
            <span className="rounded-md bg-[#eaf0f9] px-2 py-0.5 text-[#4b617e] dark:bg-[#1b2a43] dark:text-slate-300">{statusLabel}</span>
          </div>
        </div>
        {isHost && value.status === 'Scheduled' && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => meetingsApi.start(meetingId))}
            className="rounded-md bg-[#155dfb] px-5 py-2.5 text-base font-medium text-white shadow-sm transition-colors hover:bg-[#0f4bd1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Bắt đầu cuộc họp
          </button>
        )}
        {isHost && (value.status === 'Live' || value.status === 'Ending') && (
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => meetingsApi.end(meetingId))}
            className="rounded-md bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {value.status === 'Ending' ? 'Thử kết thúc lại' : 'Kết thúc cho tất cả'}
          </button>
        )}
      </header>

      {value.status !== 'Live' || !connection ? (
        <section className="mt-5 flex min-h-[320px] flex-1 flex-col items-center justify-center rounded-xl bg-[#f4f8ff] px-6 py-12 text-center dark:bg-[#111b2c]">
          <span className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[#e5efff] text-[#1769ee] dark:bg-[#18335f] dark:text-blue-400">
            <Video size={43} strokeWidth={1.7} aria-hidden="true" />
          </span>
          <h2 className="mt-6 text-[27px] font-bold leading-tight">
            {value.status === 'Scheduled' ? (isHost ? 'Phòng họp sẵn sàng' : 'Đang chờ chủ phòng')
              : value.status === 'Ending' ? 'Đang đóng phòng họp'
                : value.status === 'Ended' ? 'Cuộc họp đã kết thúc' : 'Phòng họp đã bắt đầu'}
          </h2>
          <p className="mt-3 text-lg text-[#60738e] dark:text-slate-400">
            {value.status === 'Scheduled' ? (isHost ? 'Bắt đầu để mở phòng họp.' : 'Cuộc họp sẽ bắt đầu khi chủ phòng mở phòng.')
              : value.status === 'Ending' ? 'Vui lòng chờ trong giây lát.'
                : value.status === 'Ended' ? 'Bạn có thể quay lại danh sách cuộc họp.' : 'Cho phép trình duyệt dùng camera và micro khi tham gia.'}
          </p>
          {value.status === 'Live' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(async () => { setConnection(await meetingsApi.join(meetingId)); })}
              className="mt-6 rounded-md bg-[#155dfb] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0f4bd1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Vào phòng
            </button>
          )}
        </section>
      ) : (
        <div className="mt-5 min-h-0 flex-1" data-lk-theme="default">
          <LiveKitRoom token={connection.token} serverUrl={connection.url} connect={true} audio={true} video={true}
            onDisconnected={() => { setConnection(null); void meeting.refetch(); }}
            onError={error => showToast(error.message, 'error')}>
            <VideoConference />
          </LiveKitRoom>
        </div>
      )}
    </div>
  );
};
