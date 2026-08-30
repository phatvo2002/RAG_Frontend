import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { User } from '@/types';
import {
  useUsersQuery,
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useResetPasswordMutation,
} from '@/api/users.api';
import { useRolesQuery } from '@/api/roles.api';
import { UserModal } from './UserModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { CustomTable, Column, TableToolbar, TableRowActions, StatusBadge, SortConfig } from '@/components/customTable';
import {
  Plus,
  Edit2,
  Lock,
  Unlock,
  KeyRound,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common', 'table']);

  // TanStack Query for Users
  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
    isFetching: isUsersFetching,
  } = useUsersQuery();

  // Roles from Backend
  const { data: roles = [] } = useRolesQuery();

  const deactivateMutation = useDeactivateUserMutation();
  const reactivateMutation = useReactivateUserMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  // Local Filter & Pagination State
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(undefined);

  // Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    let list = [...users];

    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.displayName && u.displayName.toLowerCase().includes(q)) ||
          (u.fullName && u.fullName.toLowerCase().includes(q)) ||
          (u.userName && u.userName.toLowerCase().includes(q)) ||
          u.email.toLowerCase().includes(q) ||
          (u.department && u.department.toLowerCase().includes(q))
      );
    }

    if (roleFilter !== 'all') {
      list = list.filter((u) => {
        if (u.roles && u.roles.length > 0) {
          return u.roles.some((r) => r.roleName === roleFilter);
        }
        return u.role === roleFilter;
      });
    }

    if (statusFilter !== 'all') {
      list = list.filter((u) => {
        const isActive = u.isActive !== undefined ? u.isActive : (u.status === 'Active' || u.status === 'Đang hoạt động');
        if (statusFilter === 'active' || statusFilter === 'Đang hoạt động') return isActive;
        if (statusFilter === 'inactive' || statusFilter === 'Bị khóa') return !isActive;
        return true;
      });
    }

    if (sortConfig) {
      list.sort((a, b) => {
        let aVal = (a as any)[sortConfig.key] ?? '';
        let bVal = (b as any)[sortConfig.key] ?? '';
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortConfig.order === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
      });
    }

    return list;
  }, [users, userSearch, roleFilter, statusFilter, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(processedUsers.length / pageSize) || 1;

  const handleOpenAddUser = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setUserToEdit(user);
    setIsUserModalOpen(true);
  };

  const handleOpenResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setIsResetPasswordOpen(true);
  };

  const handleToggleUserStatus = (user: User) => {
    const isActive = user.isActive !== undefined ? user.isActive : (user.status === 'Active' || user.status === 'Đang hoạt động');
    if (isActive) {
      deactivateMutation.mutate(user.id, {
        onSuccess: () => {
          showToast(t('users.deactivateSuccess', { name: user.name, defaultValue: `Đã khóa tài khoản "${user.name}" thành công!` }), 'warning');
        },
        onError: (err: any) => {
          showToast(err.message || 'Thao tác thất bại', 'error');
        },
      });
    } else {
      reactivateMutation.mutate(user.id, {
        onSuccess: () => {
          showToast(t('users.reactivateSuccess', { name: user.name, defaultValue: `Đã kích hoạt lại tài khoản "${user.name}" thành công!` }), 'success');
        },
        onError: (err: any) => {
          showToast(err.message || 'Thao tác thất bại', 'error');
        },
      });
    }
  };

  // Bulk Actions
  const handleBulkReactivate = async (ids: (string | number)[]) => {
    try {
      await Promise.all(ids.map((id) => reactivateMutation.mutateAsync(String(id))));
      showToast(`Đã kích hoạt ${ids.length} tài khoản thành công!`, 'success');
      setSelectedUserIds([]);
    } catch {
      showToast('Có lỗi khi kích hoạt hàng loạt', 'error');
    }
  };

  const handleBulkDeactivate = async (ids: (string | number)[]) => {
    try {
      await Promise.all(ids.map((id) => deactivateMutation.mutateAsync(String(id))));
      showToast(`Đã khóa ${ids.length} tài khoản thành công!`, 'warning');
      setSelectedUserIds([]);
    } catch {
      showToast('Có lỗi khi khóa hàng loạt', 'error');
    }
  };

  const handleBulkExport = (ids: (string | number)[]) => {
    const exportUsers = users.filter((u) => ids.includes(u.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Họ tên,Email,Số điện thoại,Phòng ban,Vai trò,Trạng thái']
        .concat(
          exportUsers.map(
            (u) =>
              `"${u.name}","${u.email}","${u.phoneNumber || u.phone || ''}","${u.department || ''}","${u.role}","${u.status}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_nguoi_dung_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã xuất ${exportUsers.length} người dùng ra file CSV`, 'info');
  };

  const handleSort = (key: string) => {
    let order: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
  };

  // Enterprise SaaS Minimalist User Columns (No STT, Low Noise)
  const userColumns: Column<User>[] = [
    {
      id: 'name',
      header: t('users.name', { defaultValue: 'Họ và tên' }),
      sortable: true,
      sortKey: 'name',
      render: (u) => {
        const titleName = u.displayName || u.fullName || u.name || u.userName || 'User';

        return (
          <div className="min-w-0 py-0.5">
            <span
              onClick={() => handleOpenEditUser(u)}
              className="font-semibold text-slate-900 dark:text-zinc-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors block truncate"
            >
              {titleName}
            </span>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal leading-normal truncate mt-0.5">
              {u.userName && u.userName !== u.email ? `@${u.userName} • ` : ''}
              {u.email}
            </p>
          </div>
        );
      },
    },
    {
      id: 'department',
      header: t('users.department', { defaultValue: 'Phòng ban' }),
      sortable: true,
      sortKey: 'department',
      render: (u) => (
        <span className="text-xs text-slate-700 dark:text-zinc-300 font-normal">
          {u.department || '—'}
        </span>
      ),
    },
    {
      id: 'role',
      header: t('users.role', { defaultValue: 'Vai trò' }),
      sortable: true,
      sortKey: 'role',
      render: (u) => {
        const rolesList = u.roles && u.roles.length > 0 ? u.roles.map((r) => r.roleName) : [u.role || 'Nhân viên'];

        return (
          <div className="flex flex-wrap items-center gap-1">
            {rolesList.map((rName, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded border border-slate-200 dark:border-zinc-700"
              >
                {rName}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'phone',
      header: t('users.phone', { defaultValue: 'Số điện thoại' }),
      align: 'left',
      width: '120px',
      render: (u) => (
        <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
          {u.phoneNumber || u.phone || '—'}
        </span>
      ),
    },
    {
      id: 'language',
      header: 'Ngôn ngữ',
      align: 'left',
      width: '90px',
      render: (u) => {
        const lang = u.preferredLanguage || 'vi';
        return (
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-50 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 rounded border border-slate-200 dark:border-zinc-800 uppercase">
            {lang}
          </span>
        );
      },
    },
    {
      id: 'status',
      header: t('users.status', { defaultValue: 'Trạng thái' }),
      align: 'left',
      width: '130px',
      sortable: true,
      sortKey: 'status',
      render: (u) => {
        const isActive = u.isActive !== undefined ? u.isActive : (u.status === 'Active' || u.status === 'Đang hoạt động');
        return <StatusBadge status={isActive} activeText="Hoạt động" inactiveText="Tạm khóa" />;
      },
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: '50px',
      render: (u) => {
        const isActive = u.isActive !== undefined ? u.isActive : (u.status === 'Active' || u.status === 'Đang hoạt động');

        return (
          <TableRowActions
            align="right"
            items={[
              {
                label: 'Chỉnh sửa thông tin',
                icon: <Edit2 className="w-3.5 h-3.5" />,
                onClick: () => handleOpenEditUser(u),
              },
              {
                label: 'Đặt lại mật khẩu',
                icon: <KeyRound className="w-3.5 h-3.5" />,
                onClick: () => handleOpenResetPassword(u),
              },
              {
                label: isActive ? 'Khóa tài khoản' : 'Kích hoạt lại',
                icon: isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />,
                variant: isActive ? 'danger' : 'default',
                onClick: () => handleToggleUserStatus(u),
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header
        title={t('users.title', { defaultValue: 'Quản lý Người dùng' })}
        subTitle={t('users.subtitle', { defaultValue: 'Danh sách tài khoản, phân quyền và trạng thái người dùng trong hệ thống' })}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-7xl mx-auto space-y-4">
        {/* Error Alert */}
        {isUsersError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Lỗi khi tải dữ liệu người dùng: {(usersError as any)?.message || 'Vui lòng kiểm tra kết nối API'}.</span>
            </div>
            <button
              onClick={() => refetchUsers()}
              className="px-2 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Unified Enterprise Table Container */}
        <CustomTable<User>
          toolbar={
            <TableToolbar
              isIntegratedHeader
              searchValue={userSearch}
              onSearchChange={(q) => {
                setUserSearch(q);
                setCurrentPage(1);
              }}
              searchPlaceholder="Tìm theo tên, email, phòng ban..."
              totalCount={users.length}
              filteredCount={processedUsers.length}
              selectedIds={selectedUserIds}
              onClearSelection={() => setSelectedUserIds([])}
              bulkActions={[
                {
                  label: 'Kích hoạt',
                  icon: <Unlock className="w-3.5 h-3.5" />,
                  variant: 'primary',
                  onClick: (ids) => handleBulkReactivate(ids),
                },
                {
                  label: 'Khóa tài khoản',
                  icon: <Lock className="w-3.5 h-3.5" />,
                  variant: 'danger',
                  onClick: (ids) => handleBulkDeactivate(ids),
                },
                {
                  label: 'Xuất CSV',
                  icon: <Download className="w-3.5 h-3.5" />,
                  variant: 'secondary',
                  onClick: (ids) => handleBulkExport(ids),
                },
              ]}
              filterSlot={
                <div className="flex items-center gap-2">
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50/70 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả vai trò</option>
                    {roles.map((r) => {
                      const roleName = r.name || r.role;
                      return (
                        <option key={r.id} value={roleName}>
                          {roleName}
                        </option>
                      );
                    })}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50/70 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Tạm khóa</option>
                  </select>
                </div>
              }
              secondaryAction={{
                label: 'Làm mới',
                icon: <RefreshCw className={`w-3.5 h-3.5 ${isUsersFetching ? 'animate-spin text-blue-600' : ''}`} />,
                onClick: () => refetchUsers(),
              }}
              primaryAction={{
                label: t('users.addUser', { defaultValue: 'Thêm người dùng' }),
                icon: <Plus className="w-3.5 h-3.5" />,
                onClick: handleOpenAddUser,
              }}
            />
          }
          columns={userColumns}
          data={paginatedUsers}
          isLoading={isUsersLoading}
          skeletonRowCount={5}
          selectable
          selectedIds={selectedUserIds}
          onSelectionChange={setSelectedUserIds}
          sortConfig={sortConfig}
          onSort={handleSort}
          keyExtractor={(u) => u.id}
          emptyState={{
            isSearch: Boolean(userSearch || roleFilter !== 'all' || statusFilter !== 'all'),
            actionText: userSearch ? undefined : t('users.addUser', { defaultValue: 'Thêm người dùng' }),
            onAction: userSearch ? undefined : handleOpenAddUser,
          }}
          pagination={{
            currentPage,
            totalPages,
            totalItems: processedUsers.length,
            pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setCurrentPage(1);
            },
            pageSizeOptions: [10, 20, 50],
          }}
        />
      </div>

      {/* Modal Thêm/Sửa Người dùng */}
      {isUserModalOpen && (
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          userToEdit={userToEdit}
          onSuccessToast={(msg) => {
            showToast(msg, 'success');
            refetchUsers();
          }}
        />
      )}

      {/* Modal Đặt lại mật khẩu */}
      {isResetPasswordOpen && userToResetPassword && (
        <ResetPasswordModal
          isOpen={isResetPasswordOpen}
          onClose={() => {
            setIsResetPasswordOpen(false);
            setUserToResetPassword(null);
          }}
          user={userToResetPassword}
          onSuccessToast={(msg) => {
            showToast(msg, 'success');
          }}
        />
      )}
    </div>
  );
};

export default UsersPage;
