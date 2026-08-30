import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { Department } from '@/types';
import {
  useDepartmentsQuery,
  useArchiveDepartmentMutation,
} from '@/api/departments.api';
import { useUsersQuery } from '@/api/users.api';
import { DepartmentModal } from './DepartmentModal';
import { ConfirmModal } from '@/components/disclosure';
import { CustomTable, Column, TableToolbar, TableRowActions, StatusBadge, SortConfig } from '@/components/customTable';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

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

  // Users for manager lookup
  const { data: users = [] } = useUsersQuery();

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => {
      map.set(u.id, u.displayName || u.fullName || u.name);
    });
    return map;
  }, [users]);

  const departmentMap = useMemo(() => {
    const map = new Map<string, Department>();
    departments.forEach((d) => {
      map.set(d.id, d);
      if (d.departmentId) {
        map.set(d.departmentId, d);
      }
    });
    return map;
  }, [departments]);

  const archiveMutation = useArchiveDepartmentMutation();

  // Local Filter & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDeptIds, setSelectedDeptIds] = useState<(string | number)[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(undefined);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState<Department | null>(null);
  const [deptToArchive, setDeptToArchive] = useState<Department | null>(null);

  const handleOpenAdd = () => {
    setDeptToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setDeptToEdit(dept);
    setIsModalOpen(true);
  };

  const handleArchive = (dept: Department) => {
    setDeptToArchive(dept);
  };

  const handleConfirmArchive = () => {
    if (!deptToArchive) return;
    archiveMutation.mutate(deptToArchive.id, {
      onSuccess: () => {
        showToast(t('departments.archiveSuccess', { name: deptToArchive.name, defaultValue: `Phòng ban ${deptToArchive.name} đã được lưu trữ thành công!` }), 'info');
        setDeptToArchive(null);
      },
      onError: (err: any) => {
        showToast(err.message || 'Thao tác thất bại', 'error');
        setDeptToArchive(null);
      },
    });
  };

  const handleSort = (key: string) => {
    let order: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
  };

  // Filtered & Sorted Departments
  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        dept.name.toLowerCase().includes(q) ||
        (dept.code && dept.code.toLowerCase().includes(q)) ||
        (dept.head && dept.head.toLowerCase().includes(q)) ||
        (dept.manager && dept.manager.toLowerCase().includes(q));

      const isInactive = dept.status === 'Inactive' || dept.status === 'Tạm khóa' || dept.status === 'Archived';
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !isInactive) ||
        (statusFilter === 'inactive' && isInactive);

      return matchSearch && matchStatus;
    });
  }, [departments, search, statusFilter]);

  const sortedDepartments = useMemo(() => {
    if (!sortConfig) return filteredDepartments;
    return [...filteredDepartments].sort((a, b) => {
      const aVal = (a as any)[sortConfig.key] ?? '';
      const bVal = (b as any)[sortConfig.key] ?? '';
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.order === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortConfig.order === 'asc'
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });
  }, [filteredDepartments, sortConfig]);

  const totalPages = Math.ceil(sortedDepartments.length / pageSize) || 1;
  const paginatedDepartments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedDepartments.slice(start, start + pageSize);
  }, [sortedDepartments, page, pageSize]);

  // Enterprise SaaS Minimalist Department Columns (No STT, Low Noise)
  const departmentColumns: Column<Department>[] = [
    {
      id: 'name',
      header: t('departments.name', { defaultValue: 'Tên phòng ban' }),
      sortable: true,
      sortKey: 'name',
      render: (d) => (
        <div className="min-w-0 py-0.5">
          <span
            onClick={() => handleOpenEdit(d)}
            className="font-semibold text-slate-900 dark:text-zinc-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors block truncate"
          >
            {d.name}
          </span>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal leading-normal truncate mt-0.5">
            {d.description || (d.phone ? `Hotline: ${d.phone}` : 'Đơn vị trực thuộc hệ thống')}
          </p>
        </div>
      ),
    },
    {
      id: 'code',
      header: t('departments.code', { defaultValue: 'Mã phòng ban' }),
      align: 'left',
      width: '130px',
      sortable: true,
      sortKey: 'code',
      render: (d) => (
        <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
          {d.code || (d.id ? d.id.slice(0, 6).toUpperCase() : 'PB')}
        </span>
      ),
    },
    {
      id: 'parent',
      header: t('departments.parent', { defaultValue: 'Trực thuộc' }),
      render: (d) => {
        if (!d.parentDepartmentId) {
          return <span className="text-slate-400 dark:text-zinc-500 text-xs italic">Gốc</span>;
        }
        const parentDept = departmentMap.get(d.parentDepartmentId);
        return (
          <span className="text-xs text-slate-700 dark:text-zinc-300 font-normal">
            {parentDept ? parentDept.name : (d.parentDepartment || d.parentDepartmentId)}
          </span>
        );
      },
    },
    {
      id: 'head',
      header: t('departments.head', { defaultValue: 'Trưởng phòng / Quản lý' }),
      render: (d) => {
        let managerText = 'Chưa phân công';
        if (d.managerUserId) {
          managerText = userMap.get(d.managerUserId) || d.managerName || d.head || 'Chưa phân công';
        } else if (d.head || d.manager) {
          managerText = d.head || d.manager || 'Chưa phân công';
        }

        return (
          <span className="text-xs text-slate-700 dark:text-zinc-300 font-normal">
            {managerText}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: t('departments.status', { defaultValue: 'Trạng thái' }),
      align: 'left',
      width: '130px',
      sortable: true,
      sortKey: 'status',
      render: (d) => {
        const isActive = d.status === 'Active' || d.status === 'Đang hoạt động';
        return <StatusBadge status={isActive} activeText="Hoạt động" inactiveText="Tạm khóa" />;
      },
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: '50px',
      render: (d) => (
        <TableRowActions
          align="right"
          items={[
            {
              label: 'Chỉnh sửa phòng ban',
              icon: <Edit2 className="w-3.5 h-3.5" />,
              onClick: () => handleOpenEdit(d),
            },
            {
              label: 'Lưu trữ phòng ban',
              icon: <Trash2 className="w-3.5 h-3.5" />,
              variant: 'danger',
              onClick: () => handleArchive(d),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header
        title={t('departments.title', { defaultValue: 'Quản lý phòng ban' })}
        subTitle={t('departments.subtitle', { defaultValue: 'Cấu trúc phòng ban, sơ đồ tổ chức và phân công quản lý' })}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-7xl mx-auto space-y-4">
        {/* Error Alert */}
        {isError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Không thể đồng bộ với máy chủ: {(error as any)?.message || 'Đang sử dụng dữ liệu dự phòng'}.</span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-2 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Unified Enterprise Table Container */}
        <CustomTable<Department>
          toolbar={
            <TableToolbar
              isIntegratedHeader
              searchValue={search}
              onSearchChange={(q) => {
                setSearch(q);
                setPage(1);
              }}
              searchPlaceholder="Tìm kiếm theo tên, mã phòng ban..."
              totalCount={departments.length}
              filteredCount={filteredDepartments.length}
              filterSlot={
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-slate-50/70 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Tạm khóa</option>
                </select>
              }
              secondaryAction={{
                label: 'Làm mới',
                icon: <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />,
                onClick: () => refetch(),
              }}
              primaryAction={{
                label: t('departments.addDept', { defaultValue: 'Thêm phòng ban' }),
                icon: <Plus className="w-3.5 h-3.5" />,
                onClick: handleOpenAdd,
              }}
            />
          }
          columns={departmentColumns}
          data={paginatedDepartments}
          isLoading={isLoading || isFetching}
          skeletonRowCount={5}
          selectable
          selectedIds={selectedDeptIds}
          onSelectionChange={setSelectedDeptIds}
          sortConfig={sortConfig}
          onSort={handleSort}
          keyExtractor={(d) => d.id}
          emptyState={{
            isSearch: Boolean(search || statusFilter !== 'all'),
            actionText: search ? undefined : t('departments.addDept', { defaultValue: 'Thêm phòng ban' }),
            onAction: search ? undefined : handleOpenAdd,
          }}
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: filteredDepartments.length,
            pageSize,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
            pageSizeOptions: [10, 20, 50],
          }}
        />
      </div>

      {/* Modal Thêm/Sửa Phòng ban */}
      {isModalOpen && (
        <DepartmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          departmentToEdit={deptToEdit}
          onSuccessToast={(msg) => {
            showToast(msg, 'success');
            refetch();
          }}
        />
      )}

      {/* Modal Cảnh báo Lưu trữ Phòng ban */}
      <ConfirmModal
        isOpen={Boolean(deptToArchive)}
        onClose={() => setDeptToArchive(null)}
        onConfirm={handleConfirmArchive}
        title="Lưu trữ phòng ban"
        message={`Bạn có chắc chắn muốn lưu trữ phòng ban "${deptToArchive?.name}" không? Thao tác này sẽ ẩn phòng ban khỏi danh sách hoạt động.`}
        confirmText="Lưu trữ"
        type="warning"
        isLoading={archiveMutation.isPending}
      />
    </div>
  );
};

export default DepartmentsPage;
