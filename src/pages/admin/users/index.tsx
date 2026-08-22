import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/button';
import { CustomTable, Column, TableToolbar, SortConfig } from '@/components/customTable';
import { UserModal } from './UserModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import {
  useUsersQuery,
  useDeactivateUserMutation,
  useReactivateUserMutation,
} from '@/api/users.api';
import { User } from '@/types';
import {
  Plus,
  Lock,
  Unlock,
  KeyRound,
  Edit2,
  RefreshCw,
  AlertCircle,
  Download
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { departments, showToast } = useApp();

  // TanStack Query for Users
  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
    isFetching: isUsersFetching
  } = useUsersQuery();

  const deactivateMutation = useDeactivateUserMutation();
  const reactivateMutation = useReactivateUserMutation();

  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', order: 'asc' });

  // Bulk Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

  // Sorting Handler
  const handleSort = (sortKey: string) => {
    setSortConfig((prev) => ({
      key: sortKey,
      order: prev.key === sortKey && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    let list = users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.department && u.department.toLowerCase().includes(userSearch.toLowerCase()));

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort
    list.sort((a: any, b: any) => {
      const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
      const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
      if (aVal < bVal) return sortConfig.order === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.order === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [users, userSearch, roleFilter, statusFilter, sortConfig]);

  // Paginated Slice
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, currentPage, pageSize]);

  const totalPages = Math.ceil(processedUsers.length / pageSize) || 1;

  const getRoleBadgeVariant = (role: string) => {
    if (role === 'Quản trị viên') return 'primary';
    if (role === 'Trưởng dự án' || role === 'Trưởng phòng') return 'info';
    return 'secondary';
  };

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
    const isCurrentlyActive = user.status === 'Đang hoạt động';

    if (isCurrentlyActive) {
      deactivateMutation.mutate(user.id, {
        onSuccess: () => {
          showToast(`Đã vô hiệu hóa tài khoản ${user.name}`, 'warning');
        },
        onError: (err: any) => {
          showToast(err.message || 'Không thể vô hiệu hóa tài khoản', 'error');
        },
      });
    } else {
      reactivateMutation.mutate(user.id, {
        onSuccess: () => {
          showToast(`Đã kích hoạt lại tài khoản ${user.name}`, 'success');
        },
        onError: (err: any) => {
          showToast(err.message || 'Không thể kích hoạt lại tài khoản', 'error');
        },
      });
    }
  };

  // Bulk Actions
  const handleBulkDeactivate = (ids: (string | number)[]) => {
    ids.forEach((id) => deactivateMutation.mutate(String(id)));
    setSelectedUserIds([]);
    showToast(`Đã gửi yêu cầu vô hiệu hóa cho ${ids.length} tài khoản`, 'warning');
  };

  const handleBulkReactivate = (ids: (string | number)[]) => {
    ids.forEach((id) => reactivateMutation.mutate(String(id)));
    setSelectedUserIds([]);
    showToast(`Đã gửi yêu cầu kích hoạt lại cho ${ids.length} tài khoản`, 'success');
  };

  const handleBulkExport = (ids: (string | number)[]) => {
    const selected = users.filter((u) => ids.includes(u.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Họ tên,Email,Phòng ban,Vai trò,Trạng thái']
        .concat(selected.map((u) => `${u.id},${u.name},${u.email},${u.department},${u.role},${u.status}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_nguoi_dung_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã xuất danh sách ${selected.length} người dùng thành công!`, 'success');
  };

  // Cột cho CustomTable
  const userColumns: Column<User>[] = [
    {
      header: 'STT',
      width: '50px',
      align: 'center',
      render: (_, idx) => (
        <span className="text-slate-500 dark:text-slate-400 font-medium">{(currentPage - 1) * pageSize + idx + 1}</span>
      ),
    },
    {
      header: 'Người dùng',
      sortable: true,
      sortKey: 'name',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
            {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate">{u.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal leading-tight mt-0.5 truncate">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Phòng ban',
      sortable: true,
      sortKey: 'department',
      render: (u) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">{u.department || 'Chưa phân bổ'}</span>
      ),
    },
    {
      header: 'Vai trò',
      align: 'center',
      sortable: true,
      sortKey: 'role',
      render: (u) => (
        <Badge variant={getRoleBadgeVariant(u.role)}>{u.role}</Badge>
      ),
    },
    {
      header: 'Số điện thoại',
      align: 'left',
      render: (u) => (
        <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">{u.phone || '—'}</span>
      ),
    },
    {
      header: 'Trạng thái',
      align: 'center',
      sortable: true,
      sortKey: 'status',
      render: (u) => {
        const isActive = u.status === 'Đang hoạt động';
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
              isActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {u.status}
          </span>
        );
      },
    },
    {
      header: 'Hành động',
      align: 'right',
      className: 'text-right',
      render: (u) => {
        const isActive = u.status === 'Đang hoạt động';
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Sửa - Bút chì xanh */}
            <button
              onClick={() => handleOpenEditUser(u)}
              className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded transition-colors cursor-pointer"
              title="Chỉnh sửa thông tin"
            >
              <Edit2 className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
            {/* Đặt lại mật khẩu */}
            <button
              onClick={() => handleOpenResetPassword(u)}
              className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/60 rounded transition-colors cursor-pointer"
              title="Đặt lại mật khẩu"
            >
              <KeyRound className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
            {/* Khóa / Mở khóa */}
            <button
              onClick={() => handleToggleUserStatus(u)}
              disabled={deactivateMutation.isPending || reactivateMutation.isPending}
              className={`p-1 rounded transition-colors cursor-pointer ${
                isActive
                  ? 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60'
                  : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
              }`}
              title={isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            >
              {isActive ? <Lock className="w-3.5 h-3.5 stroke-[2.2]" /> : <Unlock className="w-3.5 h-3.5 stroke-[2.2]" />}
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <Header
        title="Quản lý Người dùng"
        subTitle="Danh sách tài khoản, phân quyền và trạng thái người dùng trong hệ thống"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-6xl mx-auto w-full">
        {/* Table Toolbar */}
        <TableToolbar
          searchValue={userSearch}
          onSearchChange={setUserSearch}
          searchPlaceholder="Tìm theo tên, email, phòng ban..."
          totalCount={users.length}
          filteredCount={processedUsers.length}
          selectedIds={selectedUserIds}
          onClearSelection={() => setSelectedUserIds([])}
          bulkActions={[
            {
              label: 'Kích hoạt lại',
              icon: <Unlock className="w-3.5 h-3.5" />,
              variant: 'primary',
              onClick: (ids) => handleBulkReactivate(ids),
            },
            {
              label: 'Khóa tài khoản',
              icon: <Lock className="w-3.5 h-3.5" />,
              variant: 'warning',
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
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="Quản trị viên">Quản trị viên</option>
                <option value="Trưởng phòng">Trưởng phòng</option>
                <option value="Trưởng dự án">Trưởng dự án</option>
                <option value="Nhân viên">Nhân viên</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đang hoạt động">Đang hoạt động</option>
                <option value="Bị khóa">Bị khóa / Vô hiệu hóa</option>
              </select>
            </div>
          }
          secondaryAction={{
            label: 'Làm mới',
            icon: <RefreshCw className={`w-3.5 h-3.5 ${isUsersFetching ? 'animate-spin text-blue-600' : ''}`} />,
            onClick: () => refetchUsers(),
          }}
          primaryAction={{
            label: 'Thêm người dùng',
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: handleOpenAddUser,
          }}
        />

        {/* Error Alert */}
        {isUsersError && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold">Lỗi khi kết nối đến API Backend Users</h5>
              <p className="mt-0.5">{(usersError as any)?.message || 'Vui lòng kiểm tra lại server backend.'}</p>
              <button
                onClick={() => refetchUsers()}
                className="mt-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300 underline hover:text-rose-900 cursor-pointer"
              >
                Thử lại ngay
              </button>
            </div>
          </div>
        )}

        {/* CustomTable Component */}
        <CustomTable<User>
          title="Danh sách người dùng"
          columns={userColumns}
          data={paginatedUsers}
          isLoading={isUsersLoading}
          skeletonRowCount={6}
          selectable
          selectedIds={selectedUserIds}
          onSelectionChange={setSelectedUserIds}
          sortConfig={sortConfig}
          onSort={handleSort}
          keyExtractor={(u) => u.id}
          emptyState={{
            isSearch: Boolean(userSearch || roleFilter !== 'all' || statusFilter !== 'all'),
            title: userSearch ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào',
            description: userSearch ? 'Hãy thử điều chỉnh từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc.' : 'Hãy tạo tài khoản người dùng đầu tiên vào hệ thống.',
            actionText: userSearch ? undefined : 'Thêm người dùng mới',
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
            pageSizeOptions: [10, 20, 50, 100],
          }}
        />
      </div>

      {/* User Create & Edit Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userToEdit={userToEdit}
        departments={departments}
        onSuccessToast={showToast}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        user={userToResetPassword}
        onSuccessToast={showToast}
      />
    </div>
  );
};
export default UsersPage;
