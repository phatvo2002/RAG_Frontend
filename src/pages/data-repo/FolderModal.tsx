import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '@/components/disclosure';
import { useDepartmentsQuery } from '@/api/departments.api';
import {
  FolderItem,
  useCreateDocumentFolderMutation,
  useRenameDocumentFolderMutation,
} from '@/api/document-folders.api';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: FolderItem[];
  folderToRename?: FolderItem | null;
  defaultDepartmentId?: string;
  defaultParentFolderId?: string | null;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  folders,
  folderToRename = null,
  defaultDepartmentId,
  defaultParentFolderId = null,
}) => {
  const { data: departments = [] } = useDepartmentsQuery();
  const createMutation = useCreateDocumentFolderMutation();
  const renameMutation = useRenameDocumentFolderMutation();
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const isEditing = Boolean(folderToRename);
  const isPending = createMutation.isPending || renameMutation.isPending;

  useEffect(() => {
    if (!isOpen) return;
    setName(folderToRename?.name || '');
    setDepartmentId(folderToRename?.departmentId || defaultDepartmentId || departments[0]?.id || '');
    setParentFolderId(folderToRename?.parentFolderId || defaultParentFolderId || '');
    setError(null);
  }, [isOpen, folderToRename, defaultDepartmentId, defaultParentFolderId, departments]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Tên folder không được để trống.');
      return;
    }
    if (trimmedName.length > 200) {
      setError('Tên folder không được vượt quá 200 ký tự.');
      return;
    }
    if (!isEditing && !departmentId) {
      setError('Vui lòng chọn phòng ban.');
      return;
    }

    setError(null);
    if (isEditing && folderToRename) {
      renameMutation.mutate(
        { folderId: folderToRename.id, data: { name: trimmedName } },
        { onSuccess: onClose, onError: (mutationError: Error) => setError(mutationError.message) }
      );
      return;
    }

    createMutation.mutate(
      {
        departmentId,
        name: trimmedName,
        parentFolderId: parentFolderId || null,
      },
      { onSuccess: onClose, onError: (mutationError: Error) => setError(mutationError.message) }
    );
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Đổi tên folder' : 'Tạo folder mới'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
            Tên folder <span className="text-rose-500">*</span>
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={200}
            autoFocus
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Ví dụ: Tài liệu nhân sự"
          />
          <p className="mt-1 text-[11px] text-slate-400">{name.length}/200 ký tự</p>
        </div>

        {!isEditing && (
          <>
            <div>
              <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">
                Phòng ban <span className="text-rose-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(event) => setDepartmentId(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">Chọn phòng ban</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-700 dark:text-zinc-300">Folder cha</label>
              <select
                value={parentFolderId}
                onChange={(event) => setParentFolderId(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="">Folder cấp cao nhất</option>
                {folders
                  .filter((folder) => !departmentId || folder.departmentId === departmentId)
                  .map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        {isEditing && (
          <p className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-zinc-800 dark:text-zinc-400">
            Chỉ owner của folder mới có thể đổi tên.
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-zinc-800">
          <button type="button" onClick={onClose} disabled={isPending} className="btn btn-sm btn-ghost">
            Hủy
          </button>
          <button type="submit" disabled={isPending} className="btn btn-sm btn-primary text-white">
            {isPending && <span className="loading loading-spinner loading-xs" />}
            {isEditing ? 'Lưu tên folder' : 'Tạo folder'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default FolderModal;
