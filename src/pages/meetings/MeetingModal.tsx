import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { ApiError } from '@/api/client';
import { meetingKeys, meetingsApi, type MeetingDetail, type MeetingUserOption } from '@/api/meetings.api';
import { MeetingParticipantPicker } from './MeetingParticipantPicker';
import { isScheduledMeetingExpired } from './meetingAvailability';

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
  const { currentUser, showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
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
      showToast(tr('Enter a title and valid time range.', 'Vui lòng nhập tên và khoảng thời gian hợp lệ.'), 'error');
      return;
    }
    if (meetingId && new Date(end).getTime() <= Date.now()) {
      showToast(tr('The new end time must be in the future to open the room.', 'Thời gian kết thúc mới phải ở tương lai để mở phòng họp.'), 'error');
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
      showToast(meetingId ? tr('Meeting updated.', 'Đã cập nhật cuộc họp.') : tr('Online meeting created.', 'Đã tạo cuộc họp trực tuyến.'), 'success');
      onClose();
    } catch (error) {
      if (meetingId && error instanceof ApiError && error.status === 409) {
        setConflict(true);
        void detail.refetch();
        showToast(tr('This meeting has changed. Load the latest version before editing.', 'Cuộc họp đã thay đổi. Hãy tải bản mới trước khi sửa tiếp.'), 'error');
      } else {
        showToast(error instanceof Error ? error.message : tr('Could not save the meeting.', 'Không lưu được cuộc họp.'), 'error');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={meetingId ? tr('Edit meeting', 'Chỉnh sửa cuộc họp') : tr('Create online meeting', 'Tạo cuộc họp trực tuyến')} maxWidth="lg">
      {meetingId && detail.isLoading && !detail.data ? <p>{tr('Loading meeting...', 'Đang tải cuộc họp...')}</p>
        : meetingId && (detail.isError || !detail.data) ? <p>{tr('Could not load meeting information.', 'Không tải được thông tin cuộc họp.')}</p>
          : <form onSubmit={submit} className="space-y-4 text-sm">
            {conflict && <div className="rounded border border-amber-300 bg-amber-50 p-3 text-amber-900">
              {tr('This meeting has changed. Your draft is still here.', 'Cuộc họp đã thay đổi. Bản nháp của bạn vẫn còn ở đây.')}
              <button type="button" onClick={async () => {
                const latest = await detail.refetch();
                if (latest.data) { fill(latest.data); setConflict(false); }
              }} className="ml-2 font-semibold underline">{tr('Load latest version', 'Tải bản mới')}</button>
            </div>}
            <label className="block">{tr('Meeting title', 'Tên cuộc họp')}
              <input required maxLength={300} value={title} onChange={event => setTitle(event.target.value)}
                className="mt-1 w-full rounded border p-2 dark:bg-zinc-800" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label>{tr('Scheduled start', 'Bắt đầu dự kiến')}<input required type="datetime-local" value={start}
                onChange={event => setStart(event.target.value)} className="mt-1 w-full rounded border p-2 dark:bg-zinc-800" /></label>
              <label>{tr('Scheduled end', 'Kết thúc dự kiến')}<input required type="datetime-local" value={end}
                onChange={event => setEnd(event.target.value)} className="mt-1 w-full rounded border p-2 dark:bg-zinc-800" /></label>
            </div>
            {detail.data && isScheduledMeetingExpired(detail.data, Date.now()) &&
              <p className="text-amber-700 dark:text-amber-300">{tr('This meeting is overdue. Choose a new end time in the future.', 'Cuộc họp đã quá hạn. Hãy chọn thời gian kết thúc mới ở tương lai.')}</p>}
            {host && <MeetingParticipantPicker host={host} selected={participants} onChange={setParticipants} />}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="rounded border px-4 py-2">{tr('Cancel', 'Hủy')}</button>
              <button disabled={busy || conflict || !host || (Boolean(meetingId) && detail.data?.status !== 'Scheduled')}
                type="submit" className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
                {busy ? tr('Saving...', 'Đang lưu...') : meetingId ? tr('Save changes', 'Lưu thay đổi') : tr('Create meeting', 'Tạo cuộc họp')}
              </button>
            </div>
          </form>}
    </Modal>
  );
};

export default MeetingModal;
