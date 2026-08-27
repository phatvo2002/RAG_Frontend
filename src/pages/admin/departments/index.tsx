import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { CustomTable, Column, TableToolbar } from '@/components/customTable';
import { DepartmentModal } from './DepartmentModal';
import { Department } from '@/types';
import { useDepartmentsQuery, useArchiveDepartmentMutation } from '@/api/departments.api';
import { Plus, Edit2, Archive, RefreshCw, AlertCircle } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common', 'table']);

  // TanStack Query for Departments
  const {
    data: departments = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDepartmentsQuery();

  const archiveMutation = useArchiveDepartmentMutation();

  const [search, setSearch] = useState('');
  const [deptPage, setDeptPage] = useState(1);
  const [deptPageSize, setDeptPageSize] = useState(20);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);

  const filteredDepts = useMemo(() => {
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        (d.code && d.code.toLowerCase().includes(search.toLowerCase())) ||
        (d.phone && d.phone.toLowerCase().includes(search.toLowerCase()))
    );
  }, [departments, search]);

  const paginatedDepts = useMemo(() => {
    const start = (deptPage - 1) * deptPageSize;
    return filteredDepts.slice(start, start + deptPageSize);
  }, [filteredDepts, deptPage, deptPageSize]);

  const totalDeptPages = Math.ceil(filteredDepts.length / deptPageSize) || 1;

  const handleOpenAdd = () => {
    setDepartmentToEdit(null);
    setIsDeptModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setDepartmentToEdit(dept);
    setIsDeptModalOpen(true);
  };

  const handleArchive = (dept: Department) => {
    if (window.confirm(`Bạn có chắc chắn muốn lưu trữ phòng ban "${dept.name}" không?`)) {
      archiveMutation.mutate(dept.id, {
        onSuccess: () => {
          showToast(`Đã lưu trữ phòng ban "${dept.name}" thành công!`, 'success');
        },
        onError: (err: any) => {
          showToast(err.message || 'Không thể lưu trữ phòng ban', 'error');
        },
      });
    }
  };

  const departmentColumns: Column<Department>[] = [
    {
      header: t('table:stt', { defaultValue: 'No.' }),
      width: '50px',
      align: 'center',
      render: (_, idx) => (
        <span className="text-slate-600 dark:text-slate-400 font-medium">{(deptPage - 1) * deptPageSize + idx + 1}</span>
      ),
    },
    {
      header: t('departments.code', { defaultValue: 'Department Code' }),
      render: (d) => (
        <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">
          {d.code || d.id.slice(0, 4).toUpperCase()}
        </span>
      ),
    },
    {
      header: t('departments.name', { defaultValue: 'Department Name' }),
      render: (d) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">{d.name}</span>
      ),
    },
    {
      header: t('departments.parent', { defaultValue: 'Parent Department' }),
      render: (d) => (
        <span className="text-slate-700 dark:text-slate-300">{d.parentDepartment || d.name}</span>
      ),
    },
    {
      header: t('departments.phone', { defaultValue: 'Phone' }),
      render: (d) => (
        <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">{d.phone || '—'}</span>
      ),
    },
    {
      header: t('departments.address', { defaultValue: 'Office Location' }),
      render: (d) => (
        <span className="text-slate-600 dark:text-slate-400 text-xs">{d.address || '—'}</span>
      ),
    },
    {
      header: t('departments.head', { defaultValue: 'Trưởng phòng' }),
      render: (d) => (
        <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">{d.head || d.manager || 'Chưa phân công'}</span>
      ),
    },
    {
      header: t('table:actions', { defaultValue: 'Actions' }),
      align: 'right',
      render: (d) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleOpenEdit(d)}
            className="p-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer"
            title={t('common:actions.edit', { defaultValue: 'Chỉnh sửa' })}
          >
            <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <button
            onClick={() => handleArchive(d)}
            className="p-1 text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-pointer"
            title="Lưu trữ phòng ban"
          >
            <Archive className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      <Header
        title={t('departments.title', { defaultValue: 'Quản lý phòng ban' })}
        subTitle={t('departments.subtitle', { defaultValue: 'Cấu trúc phòng ban, sơ đồ tổ chức và phân công quản lý' })}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 w-full">
        {/* Error Alert if query fails */}
        {isError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Không thể đồng bộ với máy chủ: {(error as any)?.message || 'Đang sử dụng dữ liệu dự phòng'}.</span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-2.5 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 rounded font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Table Toolbar */}
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('departments.searchPlaceholder', { defaultValue: 'Tìm theo mã phòng ban, tên, số điện thoại...' })}
          totalCount={departments.length}
          filteredCount={filteredDepts.length}
          primaryAction={{
            label: t('departments.addDept', { defaultValue: 'Thêm phòng ban' }),
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: handleOpenAdd,
          }}
        />

        {/* CustomTable */}
        <CustomTable<Department>
          title={t('departments.listTitle', { defaultValue: 'Danh sách phòng ban' })}
          columns={departmentColumns}
          data={paginatedDepts}
          isLoading={isLoading || isFetching}
          skeletonRowCount={5}
          keyExtractor={(d) => d.id}
          emptyState={{
            isSearch: Boolean(search),
            actionText: search ? undefined : t('departments.addDept', { defaultValue: 'Thêm phòng ban' }),
            onAction: search ? undefined : handleOpenAdd,
          }}
          pagination={{
            currentPage: deptPage,
            totalPages: totalDeptPages,
            totalItems: filteredDepts.length,
            pageSize: deptPageSize,
            onPageChange: setDeptPage,
            onPageSizeChange: (size) => {
              setDeptPageSize(size);
              setDeptPage(1);
            },
            pageSizeOptions: [10, 20, 50, 100],
          }}
        />
      </div>

      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        departmentToEdit={departmentToEdit}
        onSuccessToast={showToast}
      />
    </div>
  );
};
export default DepartmentsPage;
