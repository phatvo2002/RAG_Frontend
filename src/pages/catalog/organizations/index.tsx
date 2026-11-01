import React, { useEffect, useState } from 'react';
import { Pencil, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/disclosure';
import { Column, CustomTable, TableRowActions } from '@/components/customTable';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { Organization, useCurrentOrganizationQuery, useUpdateOrganizationMutation } from '@/api/organizations.api';

export const OrganizationsPage: React.FC = () => {
  const { showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const { hasModuleAccess } = useUserPermissions();
  const { data: organization, isLoading, isError, error, refetch, isFetching } = useCurrentOrganizationQuery();
  const updateMutation = useUpdateOrganizationMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [dataResidency, setDataResidency] = useState('');
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const canUpdate = hasModuleAccess('ORGANIZATION.UPDATE');
  const columns: Column<Organization>[] = [
    { accessor: 'name', header: tr('COMPANY NAME', 'TÊN CÔNG TY'), render: (item) => <span className="font-semibold text-slate-900 dark:text-zinc-100">{item.name}</span> },
    { accessor: 'slug', header: tr('ORGANIZATION CODE', 'MÃ TỔ CHỨC') },
    { accessor: 'status', header: tr('STATUS', 'TRẠNG THÁI'), render: (item) => <span className="inline-flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${item.status.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />{item.status}</span> },
    { accessor: 'dataResidency', header: tr('DATA RESIDENCY', 'NƠI LƯU TRỮ DỮ LIỆU'), render: (item) => item.dataResidency || tr('Not set', 'Chưa thiết lập') },
    { id: 'action', header: tr('ACTION', 'THAO TÁC'), align: 'right', sortable: false, className: 'nexora-table-action-cell', render: () => canUpdate ? <TableRowActions items={[{ label: tr('Edit', 'Chỉnh sửa'), icon: <Pencil className="h-4 w-4" />, onClick: () => setIsEditing(true) }]} /> : null },
  ];
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
      setFormError(tr('Company name must be at most 200 characters; data residency at most 50 characters.', 'Tên công ty cần có tối đa 200 ký tự; nơi lưu trữ dữ liệu tối đa 50 ký tự.'));
      return;
    }
    try {
      await updateMutation.mutateAsync({
        organizationId: organization.organizationId,
        data: { name: trimmedName, dataResidency: trimmedResidency || null },
      });
      setIsEditing(false);
      showToast(tr('Company information updated.', 'Đã cập nhật thông tin công ty.'), 'success');
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : tr('Could not update company information.', 'Không thể cập nhật thông tin công ty.'));
    }
  };

  return (
    <div className="nexora-page flex h-full flex-1 flex-col overflow-hidden bg-slate-50/50 text-slate-900 dark:bg-black dark:text-zinc-100">
      <Header />
      <main className="min-w-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{tr('Organization', 'Tổ chức')}</h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{tr('Current organization details', 'Thông tin của tổ chức hiện tại')}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => refetch()} disabled={isFetching} className="btn btn-sm btn-outline gap-2">
              <RefreshCw className="h-4 w-4" /> {tr('Refresh', 'Tải lại')}
            </button>
          </div>
        </div>

        <div className="pt-0.5 text-xs font-semibold">
          <strong>{organization ? 1 : 0}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">{tr('organization', 'tổ chức')}</span>
        </div>

        {isError ? (
          <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            {error instanceof Error ? error.message : tr('Could not load company information.', 'Không thể tải thông tin công ty.')}
          </div>
        ) : <CustomTable<Organization>
          columns={columns}
          data={organization ? [organization] : []}
          keyExtractor={(item) => item.organizationId}
          isLoading={isLoading}
          emptyText={tr('No organization found.', 'Không tìm thấy tổ chức.')}
          className="bg-white dark:bg-zinc-900"
          pagination={{ currentPage: page, totalPages: 1, pageSize, totalItems: organization ? 1 : 0, onPageChange: setPage, onPageSizeChange: (size) => { setPageSize(size); setPage(1); }, pageSizeOptions: [10, 20, 50] }}
        />}
      </main>

      <Modal isOpen={isEditing && canUpdate} onClose={() => setIsEditing(false)} title={tr('Update company information', 'Cập nhật thông tin công ty')} maxWidth="lg">
        <form onSubmit={save} className="space-y-4 text-sm">
          {formError && <p role="alert" className="text-rose-600 dark:text-rose-400">{formError}</p>}
          <label className="block font-medium">{tr('Company name', 'Tên công ty')}
            <input className="input input-bordered mt-1 w-full" value={name} onChange={(event) => setName(event.target.value)} maxLength={200} required />
          </label>
          <label className="block font-medium">{tr('Data residency', 'Nơi lưu trữ dữ liệu')}
            <input className="input input-bordered mt-1 w-full" value={dataResidency} onChange={(event) => setDataResidency(event.target.value)} maxLength={50} />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsEditing(false)} className="btn btn-sm btn-ghost">{tr('Cancel', 'Hủy')}</button>
            <button type="submit" disabled={updateMutation.isPending} className="btn btn-sm btn-primary">{updateMutation.isPending ? tr('Saving...', 'Đang lưu...') : tr('Save changes', 'Lưu thay đổi')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
