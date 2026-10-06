import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { useUsersQuery } from '@/api/users.api';
import { meetingKeys, meetingsApi } from '@/api/meetings.api';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, showToast } = useApp();
  const queryClient = useQueryClient();
  const users = useUsersQuery({ pageSize: 100 });
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  if (!isOpen) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !start || !end || new Date(start) >= new Date(end)) {
      showToast('Vui lòng nhập tên và khoảng thời gian hợp lệ.', 'error');
      return;
    }
    setBusy(true);
    try {
      await meetingsApi.create({
        title: title.trim(), scheduledStart: new Date(start).toISOString(),
        scheduledEnd: new Date(end).toISOString(), participantUserIds: participants,
      });
      await queryClient.invalidateQueries({ queryKey: meetingKeys.list });
      showToast('Đã tạo cuộc họp trực tuyến.', 'success');
      setTitle(''); setStart(''); setEnd(''); setParticipants([]);
      onClose();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Không tạo được cuộc họp.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo cuộc họp trực tuyến">
      <form onSubmit={submit} className="space-y-4 text-sm">
        <label className="block">Tên cuộc họp
          <input required maxLength={300} value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded border p-2 dark:bg-zinc-800" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>Bắt đầu dự kiến<input required type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="mt-1 w-full rounded border p-2 dark:bg-zinc-800" /></label>
          <label>Kết thúc dự kiến<input required type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} className="mt-1 w-full rounded border p-2 dark:bg-zinc-800" /></label>
        </div>
        <fieldset>
          <legend className="font-semibold">Người tham gia</legend>
          {users.isError && <p>Không tải được danh sách người dùng.</p>}
          <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
            {(users.data ?? []).filter(user => user.id !== currentUser.id && user.isActive !== false).map(user => (
              <label key={user.id} className="flex items-center gap-2">
                <input type="checkbox" checked={participants.includes(user.id)} onChange={event => setParticipants(current => event.target.checked ? [...current, user.id] : current.filter(id => id !== user.id))} />
                {user.displayName || user.name || user.email}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border px-4 py-2">Hủy</button>
          <button disabled={busy} type="submit" className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Đang tạo...' : 'Tạo cuộc họp'}</button>
        </div>
      </form>
    </Modal>
  );
};

export default MeetingModal;
