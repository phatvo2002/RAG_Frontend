import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { CustomTable, Column, TableToolbar } from '@/components/customTable';
import { DepartmentModal } from './DepartmentModal';
import { Department } from '@/types';
import { Plus, Edit2, X } from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const { departments, showToast } = useApp();
  const { t } = useTranslation(['admin', 'common', 'table']);
  const [search, setSearch] = useState('');
  const [deptPage, setDeptPage] = useState(1);
  const [deptPageSize, setDeptPageSize] = useState(20);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);

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
      header: t('table:actions', { defaultValue: 'Actions' }),
      align: 'right',
      render: (d) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => showToast(`Edit department: ${d.name}`, 'info')}
            className="p-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer"
            title={t('common:actions.edit', { defaultValue: 'Edit' })}
          >
            <Edit2 className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
          <button
            onClick={() => showToast(`Delete department: ${d.name}`, 'warning')}
            className="p-1 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition-colors cursor-pointer"
            title={t('common:actions.delete', { defaultValue: 'Delete' })}
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      <Header
        title={t('departments.title', { defaultValue: 'Department Management' })}
        subTitle={t('departments.subtitle', { defaultValue: 'Organizational hierarchy, departments, and managerial assignments' })}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 w-full">
        {/* Table Toolbar */}
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('departments.searchPlaceholder', { defaultValue: 'Search by department code, name, phone...' })}
          totalCount={departments.length}
          filteredCount={filteredDepts.length}
          primaryAction={{
            label: t('departments.addDept', { defaultValue: 'Add Department' }),
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => setIsDeptModalOpen(true),
          }}
        />

        {/* CustomTable */}
        <CustomTable<Department>
          title={t('departments.listTitle', { defaultValue: 'Department List' })}
          columns={departmentColumns}
          data={paginatedDepts}
          keyExtractor={(d) => d.id}
          emptyState={{
            isSearch: Boolean(search),
            actionText: search ? undefined : t('departments.addDept', { defaultValue: 'Add Department' }),
            onAction: search ? undefined : () => setIsDeptModalOpen(true),
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
      />
    </div>
  );
};
export default DepartmentsPage;
