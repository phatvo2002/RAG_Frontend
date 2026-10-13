import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { meetingsApi, type MeetingUserOption } from '@/api/meetings.api';
import { useApp } from '@/context/AppContext';

interface Props {
  host: MeetingUserOption;
  selected: MeetingUserOption[];
  onChange: (users: MeetingUserOption[]) => void;
}

export const MeetingParticipantPicker: React.FC<Props> = ({ host, selected, onChange }) => {
  const { language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const users = useQuery({
    queryKey: ['meeting-eligible-participants', search, page],
    queryFn: () => meetingsApi.eligibleParticipants(search, page),
  });

  const toggle = (user: MeetingUserOption) => {
    onChange(selected.some(item => item.id === user.id)
      ? selected.filter(item => item.id !== user.id)
      : [...selected, user]);
  };

  return (
    <fieldset>
      <legend className="font-semibold">{tr('Participants', 'Người tham gia')}</legend>
      <p className="mt-1 text-xs text-slate-500">{tr('Host:', 'Chủ phòng:')} {host.displayName || host.email} {tr('(always included)', '(luôn tham gia)')}</p>
      {selected.length > 0 && <div className="mt-2 flex flex-wrap gap-1">
        {selected.map(user => <button key={user.id} type="button" onClick={() => toggle(user)}
          className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-200"
          aria-label={tr(`Remove ${user.displayName || user.email}`, `Bỏ ${user.displayName || user.email}`)}>
          {user.displayName || user.email} ×
        </button>)}
      </div>}
      <input value={searchInput} onChange={event => setSearchInput(event.target.value)} maxLength={100}
        placeholder={tr('Search by name or email', 'Tìm theo tên hoặc email')} aria-label={tr('Search participants', 'Tìm người tham gia')}
        className="mt-2 w-full rounded border p-2 dark:bg-zinc-800" />
      <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
        {users.isLoading && <p>{tr('Loading members...', 'Đang tải thành viên...')}</p>}
        {users.isError && <p className="text-rose-600">{tr('Could not load organization members.', 'Không tải được thành viên của tổ chức.')}</p>}
        {users.data?.items.filter(user => user.id !== host.id).map(user => (
          <label key={user.id} className="flex items-center gap-2">
            <input type="checkbox" checked={selected.some(item => item.id === user.id)} onChange={() => toggle(user)} />
            <span>{user.displayName || user.email} <span className="text-xs text-slate-500">({user.email})</span></span>
          </label>
        ))}
        {users.data?.items.length === 0 && <p className="text-slate-500">{tr('No members found.', 'Không tìm thấy thành viên.')}</p>}
      </div>
      {users.data && users.data.totalPages > 1 && <div className="mt-2 flex items-center justify-between text-xs">
        <button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}
          className="rounded border px-2 py-1 disabled:opacity-40">{tr('Previous page', 'Trang trước')}</button>
        <span>{tr('Page', 'Trang')} {page}/{users.data.totalPages}</span>
        <button type="button" disabled={page >= users.data.totalPages} onClick={() => setPage(value => value + 1)}
          className="rounded border px-2 py-1 disabled:opacity-40">{tr('Next page', 'Trang sau')}</button>
      </div>}
    </fieldset>
  );
};
