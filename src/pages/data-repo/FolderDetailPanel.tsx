import React, { useMemo, useState } from 'react';
import { AlertCircle, Edit2, Folder, Lock, Plus, Trash2, User, Users, X } from 'lucide-react';
import { ConfirmModal } from '@/components/disclosure';
import { useUsersQuery } from '@/api/users.api';
import { useDepartmentsQuery } from '@/api/departments.api';
import {
  FolderAccessGrant,
  FolderAccessLevel,
  FolderItem,
  useCreateFolderAccessGrantMutation,
  useDeleteDocumentFolderMutation,
  useDeleteFolderAccessGrantMutation,
  useDocumentFolderQuery,
  useFolderAccessGrantsQuery,
} from '@/api/document-folders.api';
import { User as AppUser } from '@/types';
import { FolderModal } from './FolderModal';

interface FolderDetailPanelProps {
  folder: FolderItem;
  folders: FolderItem[];
  currentUser: AppUser;
  onClose: () => void;
  onDeleted: () => void;
}

const formatDate = (value?: string | null) => {
  if (!value) return 'Không thời hạn';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('vi-VN');
};

export const FolderDetailPanel: React.FC<FolderDetailPanelProps> = ({
  folder,
  folders,
  currentUser,
  onClose,
  onDeleted,
}) => {
  const { data: folderDetail } = useDocumentFolderQuery(folder.id);
  const { data: grants = [], isLoading: isGrantsLoading, isError: isGrantsError } = useFolderAccessGrantsQuery(folder.id);
  const { data: departments = [] } = useDepartmentsQuery();
  const { data: users = [] } = useUsersQuery();
  const createGrantMutation = useCreateFolderAccessGrantMutation();
  const deleteGrantMutation = useDeleteFolderAccessGrantMutation();
  const deleteFolderMutation = useDeleteDocumentFolderMutation();

  const selectedFolder = folderDetail || folder;
  const currentUserId = currentUser.id || currentUser.userId;
  const isOwner = Boolean(selectedFolder.ownerUserId) && selectedFolder.ownerUserId === currentUserId;
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [grantTargetType, setGrantTargetType] = useState<'department' | 'user'>('department');
  const [grantDepartmentId, setGrantDepartmentId] = useState('');
  const [grantUserId, setGrantUserId] = useState('');
  const [accessLevel, setAccessLevel] = useState<FolderAccessLevel>('READ');
  const [expiresAt, setExpiresAt] = useState('');
  const [grantError, setGrantError] = useState<string | null>(null);
  const [grantToRevoke, setGrantToRevoke] = useState<FolderAccessGrant | null>(null);

  const departmentNames = useMemo(
    () => new Map(departments.map((department) => [department.id, department.name])),
    [departments]
  );
  const userNames = useMemo(
    () => new Map(users.map((user) => [user.id, user.name || user.userName || user.email])),
    [users]
  );

  const handleCreateGrant = (event: React.FormEvent) => {
    event.preventDefault();
    const departmentId = grantTargetType === 'department' ? grantDepartmentId : null;
    const userId = grantTargetType === 'user' ? grantUserId : null;
    if (!departmentId && !userId) {
      setGrantError('Vui lòng chọn phòng ban hoặc người dùng.');
      return;
    }

    setGrantError(null);
    createGrantMutation.mutate(
      {
        folderId: selectedFolder.id,
        data: {
          departmentId,
          userId,
          accessLevel,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        },
      },
      {
        onSuccess: () => {
          setGrantDepartmentId('');
          setGrantUserId('');
          setExpiresAt('');
        },
        onError: (error: Error) => setGrantError(error.message),
      }
    );
  };

  const handleDeleteFolder = () => {
    deleteFolderMutation.mutate(selectedFolder.id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        onDeleted();
      },
      onError: (error: Error) => {
        setIsDeleteOpen(false);
        const status = (error as Error & { status?: number }).status;
        setGrantError(status === 409 ? 'Folder còn tài liệu' : error.message || 'Không thể xóa folder.');
      },
    });
  };

  const handleRevokeGrant = () => {
    if (!grantToRevoke) return;
    deleteGrantMutation.mutate(
      { folderId: selectedFolder.id, grantId: grantToRevoke.id },
      {
        onSuccess: () => setGrantToRevoke(null),
        onError: (error: Error) => {
          setGrantToRevoke(null);
          setGrantError(error.message);
        },
      }
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        onClick={onClose}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="folder-detail-title"
          onClick={(event) => event.stopPropagation()}
          className="flex max-h-[calc(100vh-2rem)] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        >
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Folder className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 id="folder-detail-title" className="truncate text-sm font-bold text-slate-900 dark:text-zinc-100">{selectedFolder.name}</h2>
              <p className="text-[11px] text-slate-400">Chi tiết folder</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-sm btn-ghost btn-circle" aria-label="Đóng chi tiết folder">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto p-4 text-xs">
          {grantError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{grantError}</span>
            </div>
          )}

          <dl className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-zinc-800">
            <div className="flex justify-between gap-3"><dt className="text-slate-400">Phòng ban</dt><dd className="max-w-[220px] truncate text-right font-medium text-slate-700 dark:text-zinc-300">{selectedFolder.departmentId ? departmentNames.get(selectedFolder.departmentId) || 'Không xác định' : '—'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-400">Folder cha</dt><dd className="font-medium text-slate-700 dark:text-zinc-300">{folders.find((item) => item.id === selectedFolder.parentFolderId)?.name || 'Root'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-400">Chủ sở hữu</dt><dd className="max-w-[220px] truncate text-right font-medium text-slate-700 dark:text-zinc-300">{selectedFolder.ownerUserId ? userNames.get(selectedFolder.ownerUserId) || 'Không xác định' : '—'}</dd></div>
          </dl>

          {isOwner && (
            <div className="flex gap-2">
              <button type="button" onClick={() => setIsRenameOpen(true)} className="btn btn-sm btn-outline flex-1 gap-1.5">
                <Edit2 className="h-3.5 w-3.5" /> Đổi tên
              </button>
              <button type="button" onClick={() => setIsDeleteOpen(true)} className="btn btn-sm btn-outline btn-error gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Xóa
              </button>
            </div>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-zinc-100">Quyền truy cập</h3>
              {!isOwner && <span className="flex items-center gap-1 text-[11px] text-slate-400"><Lock className="h-3 w-3" /> Chỉ owner quản lý</span>}
            </div>

            {isOwner && (
              <form onSubmit={handleCreateGrant} className="space-y-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/50 dark:bg-blue-950/20">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setGrantTargetType('department')} className={`btn btn-xs flex-1 gap-1 ${grantTargetType === 'department' ? 'btn-primary text-white' : 'btn-ghost'}`}><Users className="h-3 w-3" /> Phòng ban</button>
                  <button type="button" onClick={() => setGrantTargetType('user')} className={`btn btn-xs flex-1 gap-1 ${grantTargetType === 'user' ? 'btn-primary text-white' : 'btn-ghost'}`}><User className="h-3 w-3" /> Người dùng</button>
                </div>
                {grantTargetType === 'department' ? (
                  <select value={grantDepartmentId} onChange={(event) => setGrantDepartmentId(event.target.value)} className="select select-bordered select-sm w-full bg-white text-xs dark:bg-zinc-900">
                    <option value="">Chọn phòng ban</option>
                    {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                  </select>
                ) : (
                  <select value={grantUserId} onChange={(event) => setGrantUserId(event.target.value)} className="select select-bordered select-sm w-full bg-white text-xs dark:bg-zinc-900">
                    <option value="">Chọn người dùng</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}
                  </select>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <select value={accessLevel} onChange={(event) => setAccessLevel(event.target.value as FolderAccessLevel)} className="select select-bordered select-sm w-full bg-white text-xs dark:bg-zinc-900">
                    <option value="READ">READ</option>
                    <option value="WRITE">WRITE</option>
                  </select>
                  <input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} className="input input-bordered input-sm w-full bg-white text-xs dark:bg-zinc-900" />
                </div>
                <button type="submit" disabled={createGrantMutation.isPending} className="btn btn-sm btn-primary w-full gap-1.5 text-white">
                  {createGrantMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : <Plus className="h-3.5 w-3.5" />} Cấp quyền
                </button>
              </form>
            )}

            {isGrantsLoading ? (
              <div className="py-5 text-center text-slate-400"><span className="loading loading-spinner loading-sm text-primary" /></div>
            ) : isGrantsError ? (
              <p className="text-rose-600 dark:text-rose-400">Không thể tải danh sách quyền.</p>
            ) : grants.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-3 text-slate-400 dark:bg-zinc-900">Folder chưa có quyền chia sẻ riêng.</p>
            ) : (
              <div className="space-y-2">
                {grants.map((grant) => (
                  <div key={grant.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-zinc-800">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-800 dark:text-zinc-200">
                        {grant.departmentId ? departmentNames.get(grant.departmentId) || grant.departmentId : userNames.get(grant.userId || '') || grant.userId}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">{grant.departmentId ? 'Phòng ban' : 'Người dùng'} · {grant.accessLevel}</p>
                      <p className="text-[11px] text-slate-400">Hiệu lực: {formatDate(grant.validFrom)} · {formatDate(grant.expiresAt)}</p>
                    </div>
                    {isOwner && <button type="button" onClick={() => setGrantToRevoke(grant)} className="btn btn-xs btn-ghost text-rose-600" aria-label="Thu hồi quyền"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        </section>
      </div>

      <FolderModal isOpen={isRenameOpen} onClose={() => setIsRenameOpen(false)} folders={folders} folderToRename={selectedFolder} />
      <ConfirmModal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDeleteFolder} isLoading={deleteFolderMutation.isPending} title="Xóa folder" message={`Bạn có chắc muốn xóa folder "${selectedFolder.name}" không? Folder còn tài liệu sẽ bị backend từ chối.`} confirmText="Xóa folder" />
      <ConfirmModal isOpen={Boolean(grantToRevoke)} onClose={() => setGrantToRevoke(null)} onConfirm={handleRevokeGrant} isLoading={deleteGrantMutation.isPending} title="Thu hồi quyền folder" message="Bạn có chắc muốn thu hồi quyền truy cập này không?" confirmText="Thu hồi" />
    </>
  );
};

export default FolderDetailPanel;
