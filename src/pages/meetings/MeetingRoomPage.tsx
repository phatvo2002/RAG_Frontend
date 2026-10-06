import React, { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
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
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => navigate({ to: '/meetings' })} className="text-sm text-blue-600">← Danh sách cuộc họp</button>
          <h1 className="text-xl font-semibold">{value.title}</h1>
          <p className="text-sm text-slate-500">{isHost ? 'Chủ phòng' : 'Người tham gia'} · {value.status}</p>
        </div>
        {isHost && value.status === 'Scheduled' && <button disabled={busy} onClick={() => run(() => meetingsApi.start(meetingId))} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">Bắt đầu cuộc họp</button>}
        {isHost && (value.status === 'Live' || value.status === 'Ending') && <button disabled={busy} onClick={() => run(() => meetingsApi.end(meetingId))} className="rounded bg-rose-600 px-4 py-2 text-white disabled:opacity-50">{value.status === 'Ending' ? 'Thử kết thúc lại' : 'Kết thúc cho tất cả'}</button>}
      </div>

      {value.status === 'Scheduled' && <div className="rounded border bg-white p-8 text-center dark:bg-zinc-900">{isHost ? 'Bấm Bắt đầu để mở phòng họp.' : 'Đang chờ chủ phòng bắt đầu. Trang sẽ tự cập nhật.'}</div>}
      {value.status === 'Ending' && <div className="rounded border bg-white p-8 text-center dark:bg-zinc-900">Đang đóng phòng họp...</div>}
      {value.status === 'Ended' && <div className="rounded border bg-white p-8 text-center dark:bg-zinc-900">Cuộc họp đã kết thúc.</div>}
      {value.status === 'Live' && !connection && <div className="rounded border bg-white p-8 text-center dark:bg-zinc-900">
        <p className="mb-4">Phòng đã bắt đầu. Cho phép trình duyệt dùng camera và micro khi tham gia.</p>
        <button disabled={busy} onClick={() => run(async () => { setConnection(await meetingsApi.join(meetingId)); })} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">Vào phòng</button>
      </div>}
      {value.status === 'Live' && connection && <div className="min-h-0 flex-1" data-lk-theme="default">
        <LiveKitRoom token={connection.token} serverUrl={connection.url} connect={true} audio={true} video={true}
          onDisconnected={() => { setConnection(null); void meeting.refetch(); }}
          onError={error => showToast(error.message, 'error')}>
          <VideoConference />
        </LiveKitRoom>
      </div>}
    </div>
  );
};
