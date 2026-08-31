import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { useRolesQuery, useDeactivateRoleMutation, useReactivateRoleMutation, RoleItem } from '@/api/roles.api';
import { RoleDetailModal } from './RoleDetailModal';
import { ConfirmModal } from '@/components/disclosure';
import { CustomTable, Column, TableToolbar, TableRowActions, StatusBadge, SortConfig } from '@/components/customTable';
import {
  Plus,
  AlertCircle,
  RefreshCw,
  Lock,
  Unlock,
  Settings
} from 'lucide-react';

export const RolesPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common', 'table']);

  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<RoleItem | null>(null);
  const [roleToToggle, setRoleToToggle] = useState<RoleItem | null>(null);

  // Search, Filter & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRoleIds, setSelectedRoleIds] = useState<(string | number)[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(undefined);

  // TanStack Query for Roles
  const {
    data: roles = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useRolesQuery();

  const deactivateMutation = useDeactivateRoleMutation();
  const reactivateMutation = useReactivateRoleMutation();

  const handleOpenAddRole = () => {
    setSelectedRoleForDetail(null);
    setIsDetailModalOpen(true);
  };

  const handleOpenConfigureRole = (role: RoleItem) => {
    setSelectedRoleForDetail(role);
    setIsDetailModalOpen(true);
  };

  const handleToggleStatus = (role: RoleItem) => {
    const isInactive = role.status === 'Vô hiệu hóa' || role.status === 'Inactive';
    if (isInactive) {
      reactivateMutation.mutate(role.id, {
        onSuccess: () => {
          showToast(`Đã kích hoạt lại vai trò "${role.name || role.role}" thành công!`, 'success');
        },
        onError: (err: any) => {
          showToast(err.message || 'Không thể kích hoạt vai trò', 'error');
        },
      });
    } else {
      setRoleToToggle(role);
    }
  };

  const handleConfirmDeactivate = () => {
    if (!roleToToggle) return;
    deactivateMutation.mutate(roleToToggle.id, {
      onSuccess: () => {
        showToast(`Đã vô hiệu hóa vai trò "${roleToToggle.name || roleToToggle.role}" thành công!`, 'info');
        setRoleToToggle(null);
      },
      onError: (err: any) => {
        showToast(err.message || 'Không thể vô hiệu hóa vai trò', 'error');
        setRoleToToggle(null);
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

  // Filtered & Sorted Roles
  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (role.name && role.name.toLowerCase().includes(q)) ||
        (role.role && role.role.toLowerCase().includes(q)) ||
        (role.code && role.code.toLowerCase().includes(q)) ||
        (role.description && role.description.toLowerCase().includes(q));

      const isInactive = role.status === 'Vô hiệu hóa' || role.status === 'Inactive';
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !isInactive) ||
        (statusFilter === 'inactive' && isInactive);

      return matchSearch && matchStatus;
    });
  }, [roles, search, statusFilter]);

  const sortedRoles = useMemo(() => {
    if (!sortConfig) return filteredRoles;
    return [...filteredRoles].sort((a, b) => {
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
  }, [filteredRoles, sortConfig]);

  const totalPages = Math.ceil(sortedRoles.length / pageSize) || 1;
  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedRoles.slice(start, start + pageSize);
  }, [sortedRoles, page, pageSize]);

  // Enterprise SaaS Minimalist Role Columns (No STT, Low Noise)
  const roleColumns: Column<RoleItem>[] = [
    {
      id: 'name',
      header: t('roles.roleName', { defaultValue: 'Tên vai trò' }),
      sortable: true,
      sortKey: 'name',
      render: (r) => {
        const isSuper = r.name?.toLowerCase().includes('admin') || r.role?.toLowerCase().includes('admin');
        const roleName = r.name || r.role || 'Vai trò';

        return (
          <div className="min-w-0 py-0.5">
            <div className="flex items-center gap-2">
              <span
                onClick={() => handleOpenConfigureRole(r)}
                className="font-semibold text-slate-900 dark:text-zinc-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors truncate"
              >
                {roleName}
              </span>
              {isSuper && (
                <span className="px-1.5 py-0.2 text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded border border-slate-200 dark:border-zinc-700 shrink-0">
                  Hệ thống
                </span>
              )}
            </div>
            {r.description && (
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal leading-normal truncate mt-0.5 max-w-md">
                {r.description}
              </p>
            )}
          </div>
        );
      },
    },
    {
      id: 'code',
      header: 'Mã vai trò',
      align: 'left',
      width: '140px',
      sortable: true,
      sortKey: 'code',
      render: (r) => (
        <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
          {r.code || (r.name || r.role).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      id: 'userCount',
      header: 'Thành viên',
      align: 'left',
      width: '120px',
      sortable: true,
      sortKey: 'userCount',
      render: (r) => (
        <span className="text-xs text-slate-600 dark:text-zinc-400 font-normal">
          {r.userCount || 0} người dùng
        </span>
      ),
    },
    {
      id: 'status',
      header: t('roles.status', { defaultValue: 'Trạng thái' }),
      align: 'left',
      width: '130px',
      sortable: true,
      sortKey: 'status',
      render: (r) => {
        const isInactive = r.status === 'Vô hiệu hóa' || r.status === 'Inactive';
        return <StatusBadge status={!isInactive} activeText="Hoạt động" inactiveText="Tạm khóa" />;
      },
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: '50px',
      render: (r) => {
        const isInactive = r.status === 'Vô hiệu hóa' || r.status === 'Inactive';

        return (
          <TableRowActions
            align="right"
            items={[
              {
                label: 'Cấu hình quyền',
                icon: <Settings className="w-3.5 h-3.5" />,
                onClick: () => handleOpenConfigureRole(r),
              },
              {
                label: isInactive ? 'Kích hoạt lại' : 'Vô hiệu hóa',
                icon: isInactive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />,
                variant: isInactive ? 'default' : 'danger',
                onClick: () => handleToggleStatus(r),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full space-y-4">
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('roles.title', { defaultValue: 'Vai trò & Phân quyền' })}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t('roles.subtitle', { defaultValue: 'Chính sách kiểm soát truy cập và phân quyền chi tiết cho các nhóm người dùng' })}
          </p>
        </div>

        {/* Error Alert */}
        {isError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Không thể đồng bộ vai trò từ máy chủ: {(error as any)?.message || 'Đang sử dụng dữ liệu dự phòng'}.</span>
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
        <CustomTable<RoleItem>
          toolbar={
            <TableToolbar
              isIntegratedHeader
              searchValue={search}
              onSearchChange={(q) => {
                setSearch(q);
                setPage(1);
              }}
              searchPlaceholder="Tìm kiếm vai trò, mã..."
              totalCount={roles.length}
              filteredCount={filteredRoles.length}
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
              primaryAction={{
                label: t('roles.addRole', { defaultValue: 'Thêm vai trò' }),
                icon: <Plus className="w-3.5 h-3.5" />,
                onClick: handleOpenAddRole,
              }}
            />
          }
          columns={roleColumns}
          data={paginatedRoles}
          isLoading={isLoading || isFetching}
          skeletonRowCount={5}
          sortConfig={sortConfig}
          onSort={handleSort}
          keyExtractor={(r) => r.id}
          emptyState={{
            isSearch: Boolean(search || statusFilter !== 'all'),
            actionText: search ? undefined : t('roles.addRole', { defaultValue: 'Thêm vai trò' }),
            onAction: search ? undefined : handleOpenAddRole,
          }}
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: filteredRoles.length,
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

      {/* Modal Cấu hình chi tiết vai trò & Phân quyền */}
      {isDetailModalOpen && (
        <RoleDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          roleToEdit={selectedRoleForDetail}
          onSuccessToast={(msg) => {
            showToast(msg, 'success');
            refetch();
          }}
        />
      )}

      {/* Modal Cảnh báo Vô hiệu hóa vai trò */}
      <ConfirmModal
        isOpen={Boolean(roleToToggle)}
        onClose={() => setRoleToToggle(null)}
        onConfirm={handleConfirmDeactivate}
        title="Vô hiệu hóa vai trò"
        message={`Bạn có chắc chắn muốn vô hiệu hóa vai trò "${roleToToggle?.name || roleToToggle?.role}" không? Người dùng thuộc vai trò này sẽ tạm thời không thể sử dụng các quyền tương ứng.`}
        confirmText="Vô hiệu hóa"
        type="warning"
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
};

export default RolesPage;
