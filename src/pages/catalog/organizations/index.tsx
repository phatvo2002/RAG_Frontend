import React, { useEffect, useState } from 'react';
import { Building2, Pencil, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useCurrentOrganizationQuery, useUpdateOrganizationMutation } from '@/api/organizations.api';

export const OrganizationsPage: React.FC = () => {
  const { showToast } = useApp();
  const { hasModuleAccess } = useUserPermissions();
  const { data: organization, isLoading, isError, error, refetch, isFetching } = useCurrentOrganizationQuery();
  const updateMutation = useUpdateOrganizationMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [dataResidency, setDataResidency] = useState('');
  const [formError, setFormError] = useState('');
  const canUpdate = hasModuleAccess('ORGANIZATION.UPDATE');

  useEffect(() => {
    if (isEditing && organization) {
      setName(organization.name);
      setDataResidency(organization.dataResidency || '');
      setFormError('');
    }
  }, [isEditing, organization]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!organization) return;
    const trimmedName = name.trim();
    const trimmedResidency = dataResidency.trim();
    if (!trimmedName || trimmedName.length > 200 || trimmedResidency.length > 50) {
      setFormError('Tên công ty cần có tối đa 200 ký tự; nơi lưu trữ dữ liệu tối đa 50 ký tự.');
      return;
    }
    try {
      await updateMutation.mutateAsync({
        organizationId: organization.organizationId,
        data: { name: trimmedName, dataResidency: trimmedResidency || null },
      });
      setIsEditing(false);
      showToast('Đã cập nhật thông tin công ty.', 'success');
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Không thể cập nhật thông tin công ty.');
    }
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#0b1220] p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Danh mục / Tổ chức</p>
            <h1 className="mt-1 text-2xl font-bold">Thông tin công ty</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Thông tin của tổ chức hiện tại</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn btn-sm btn-outline gap-2">
              <RefreshCw className="h-4 w-4" /> Tải lại
            </button>
            {organization && canUpdate && (
              <button type="button" onClick={() => setIsEditing(true)} className="btn btn-sm btn-primary gap-2">
                <Pencil className="h-4 w-4" /> Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm dark:border-zinc-800 dark:bg-zinc-900">Đang tải thông tin công ty...</div>
        ) : isError ? (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error instanceof Error ? error.message : 'Không thể tải thông tin công ty.'}
          </div>
        ) : organization ? (
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"><Building2 className="h-6 w-6" /></div>
              <div>
                <h2 className="text-lg font-semibold">{organization.name}</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">{organization.slug}</p>
              </div>
            </div>
            <dl className="grid gap-5 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-500 dark:text-zinc-400">Tên công ty</dt><dd className="mt-1 font-medium">{organization.name}</dd></div>
              <div><dt className="text-slate-500 dark:text-zinc-400">Mã tổ chức</dt><dd className="mt-1 font-medium">{organization.slug}</dd></div>
              <div><dt className="text-slate-500 dark:text-zinc-400">Trạng thái</dt><dd className="mt-1 font-medium">{organization.status}</dd></div>
              <div><dt className="text-slate-500 dark:text-zinc-400">Nơi lưu trữ dữ liệu</dt><dd className="mt-1 font-medium">{organization.dataResidency || 'Chưa thiết lập'}</dd></div>
            </dl>
          </section>
        ) : null}
      </div>

      <Modal isOpen={isEditing && canUpdate} onClose={() => setIsEditing(false)} title="Cập nhật thông tin công ty" maxWidth="lg">
        <form onSubmit={save} className="space-y-4 text-sm">
          {formError && <p role="alert" className="text-rose-600 dark:text-rose-400">{formError}</p>}
          <label className="block font-medium">Tên công ty
            <input className="input input-bordered mt-1 w-full" value={name} onChange={(event) => setName(event.target.value)} maxLength={200} required />
          </label>
          <label className="block font-medium">Nơi lưu trữ dữ liệu
            <input className="input input-bordered mt-1 w-full" value={dataResidency} onChange={(event) => setDataResidency(event.target.value)} maxLength={50} />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-sm btn-ghost">Hủy</button>
            <button type="submit" disabled={updateMutation.isPending} className="btn btn-sm btn-primary">{updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
