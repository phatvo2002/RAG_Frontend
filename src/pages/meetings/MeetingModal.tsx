import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { ApiError } from '@/api/client';
import { meetingKeys, meetingsApi, type MeetingDetail, type MeetingUserOption } from '@/api/meetings.api';
import { MeetingParticipantPicker } from './MeetingParticipantPicker';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId?: string;
}

function toLocalInput(value: string): string {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose, meetingId }) => {
  const { currentUser, showToast } = useApp();
  const queryClient = useQueryClient();
  const detail = useQuery({
    queryKey: ['meeting-edit', meetingId],
    queryFn: () => meetingsApi.get(meetingId!),
    enabled: isOpen && Boolean(meetingId),
    refetchOnMount: 'always',
  });
  const initialized = useRef(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [participants, setParticipants] = useState<MeetingUserOption[]>([]);
  const [rowVersion, setRowVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState(false);

  const fill = (meeting: MeetingDetail) => {
    setTitle(meeting.title);
    setStart(toLocalInput(meeting.scheduledStart));
    setEnd(toLocalInput(meeting.scheduledEnd));
    setParticipants(meeting.participants.filter(user => user.id !== meeting.organizerUserId));
    setRowVersion(meeting.rowVersion);
  };

  useEffect(() => {
    if (detail.data && !initialized.current) {
      fill(detail.data);
      initialized.current = true;
    }
  }, [detail.data]);

  if (!isOpen) return null;

  const host = meetingId
    ? detail.data?.participants.find(user => user.id === detail.data?.organizerUserId)
    : { id: currentUser.id, displayName: currentUser.displayName || currentUser.name || currentUser.email, email: currentUser.email };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !start || !end || new Date(start) >= new Date(end)) {
      showToast('Vui lòng nhập tên và khoảng thời gian hợp lệ.', 'error');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        title: title.trim(), scheduledStart: new Date(start).toISOString(),
        scheduledEnd: new Date(end).toISOString(), participantUserIds: participants.map(user => user.id),
      };
      if (meetingId) {
        await meetingsApi.update(meetingId, { ...payload, expectedRowVersion: rowVersion });
      } else {
        await meetingsApi.create(payload);
      }
      await queryClient.invalidateQueries({ queryKey: meetingKeys.list });
      if (meetingId) await queryClient.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) });
      showToast(meetingId ? 'Đã cập nhật cuộc họp.' : 'Đã tạo cuộc họp trực tuyến.', 'success');
      onClose();
    } catch (error) {
      if (meetingId && error instanceof ApiError && error.status === 409) {
        setConflict(true);
        void detail.refetch();
        showToast('Cuộc họp đã thay đổi. Hãy tải bản mới trước khi sửa tiếp.', 'error');
      } else {
        showToast(error instanceof Error ? error.message : 'Không lưu được cuộc họp.', 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meetingId ? 'Chỉnh sửa cuộc họp' : 'Tạo cuộc họp trực tuyến'} maxWidth="lg">
      {meetingId && detail.isLoading && !detail.data ? <p>Đang tải cuộc họp...</p>
        : meetingId && (detail.isError || !detail.data) ? <p>Không tải được thông tin cuộc họp.</p>
          : <form onSubmit={submit} className="space-y-4 text-sm">
            {conflict && <div className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900">
              Cuộc họp đã thay đổi. Bản nháp của bạn vẫn còn ở đây.
              <button type="button" onClick={async () => {
                const latest = await detail.refetch();
                if (latest.data) { fill(latest.data); setConflict(false); }
              }} className="ml-2 font-semibold underline">Tải bản mới</button>
            </div>}
            <label className="block">Tên cuộc họp
              <input required maxLength={300} value={title} onChange={event => setTitle(event.target.value)}
                className="mt-1 w-full rounded border p-2 dark:bg-zinc-800" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>Bắt đầu dự kiến<input required type="datetime-local" value={start}
                onChange={event => setStart(event.target.value)} className="mt-1 w-full rounded border p-2 dark:bg-zinc-800" /></label>
              <label>Kết thúc dự kiến<input required type="datetime-local" value={end}
                onChange={event => setEnd(event.target.value)} className="mt-1 w-full rounded border p-2 dark:bg-zinc-800" /></label>
            </div>
            {host && <MeetingParticipantPicker host={host} selected={participants} onChange={setParticipants} />}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded border px-4 py-2">Hủy</button>
              <button disabled={busy || conflict || !host || (Boolean(meetingId) && detail.data?.status !== 'Scheduled')}
                type="submit" className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
                {busy ? 'Đang lưu...' : meetingId ? 'Lưu thay đổi' : 'Tạo cuộc họp'}
              </button>
            </div>
          </form>}
    </Modal>
  );
};

export default MeetingModal;
