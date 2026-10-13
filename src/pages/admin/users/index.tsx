import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { User } from '@/types';
import {
  useUsersQuery,
  useDeactivateUserMutation,
  useReactivateUserMutation,
  useResetPasswordMutation,
} from '@/api/users.api';
import { useRolesQuery } from '@/api/roles.api';
import { useDepartmentsQuery } from '@/api/departments.api';
import { UserModal } from './UserModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { Modal } from '@/components/disclosure';
import { CustomTable, TableRowActions } from '@/components/customTable';
import {
  Plus,
  Edit2,
  Lock,
  Unlock,
  KeyRound,
  Download,
  AlertCircle,
  RefreshCw,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Clock,
  UserCheck,
  CheckCircle2,
  FileText,
  Key,
  ShieldAlert,
  Info,
  TrendingUp,
} from 'lucide-react';

const getInitials = (name?: string): string => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const UsersPage: React.FC = () => {
  const { showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;

  // TanStack Queries
  const {
    data: users = [],
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
    refetch: refetchUsers,
    isFetching: isUsersFetching,
  } = useUsersQuery();

  const { data: roles = [] } = useRolesQuery();
  const { data: departments = [] } = useDepartmentsQuery();

  const deactivateMutation = useDeactivateUserMutation();
  const reactivateMutation = useReactivateUserMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  // Local Filters & Pagination State
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Active Selected User for Side Drawer Detail Panel
  const [activeUserDetail, setActiveUserDetail] = useState<User | null>(null);

  // Modals State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

  // Filtered Users
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
          return u.roles.some((r) => r.roleName === roleFilter || r.roleId === roleFilter);
        }
        return u.role === roleFilter;
      });
    }

    if (departmentFilter !== 'all') {
      list = list.filter((u) => u.department === departmentFilter || u.departmentId === departmentFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter((u) => {
        const isActive = u.isActive !== undefined ? u.isActive : (u.status === 'Active' || u.status === 'Đang hoạt động');
        const isPending = /pending|chờ/i.test(String(u.status || ''));
        if (statusFilter === 'pending') return isPending;
        if (statusFilter === 'active' || statusFilter === 'Đang hoạt động' || statusFilter === 'Active') return isActive;
        if (statusFilter === 'inactive' || statusFilter === 'Bị khóa' || statusFilter === 'Inactive') return !isActive;
        return true;
      });
    }

    return list;
  }, [users, userSearch, roleFilter, departmentFilter, statusFilter]);

  // Paginated Users
  const totalPages = Math.ceil(processedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, currentPage, pageSize]);

  // Metrics Summary Row matching 08.Màn hình người dùng.png
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => (u.isActive !== undefined ? u.isActive : u.status === 'Active' || u.status === 'Đang hoạt động')).length;
    const locked = users.filter((u) => {
      const isActive = u.isActive !== undefined ? u.isActive : u.status === 'Active' || u.status === 'Đang hoạt động';
      return !isActive;
    }).length;
    const pending = users.filter((u) => /pending|chờ|pending/i.test(String(u.status || ''))).length;

    return { total, active, locked, pending };
  }, [users]);

  // Handlers
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
    const isCurrentlyActive = user.isActive !== undefined ? user.isActive : (user.status === 'Active' || user.status === 'Đang hoạt động');
    if (isCurrentlyActive) {
      deactivateMutation.mutate(user.id, {
        onSuccess: () => {
          showToast(tr(`Account "${user.name || user.userName}" locked.`, `Đã khóa tài khoản "${user.name || user.userName}" thành công!`), 'info');
          refetchUsers();
          if (activeUserDetail?.id === user.id) {
            setActiveUserDetail({ ...activeUserDetail, isActive: false, status: 'Inactive' });
          }
        },
        onError: (err: any) => {
          showToast(err.message || tr('Could not lock account', 'Không thể khóa tài khoản'), 'error');
        },
      });
    } else {
      reactivateMutation.mutate(user.id, {
        onSuccess: () => {
          showToast(tr(`Account "${user.name || user.userName}" unlocked.`, `Đã mở khóa tài khoản "${user.name || user.userName}" thành công!`), 'success');
          refetchUsers();
          if (activeUserDetail?.id === user.id) {
            setActiveUserDetail({ ...activeUserDetail, isActive: true, status: 'Active' });
          }
        },
        onError: (err: any) => {
          showToast(err.message || tr('Could not unlock account', 'Không thể mở khóa tài khoản'), 'error');
        },
      });
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedUserIds.length === paginatedUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(paginatedUsers.map((u) => u.id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCsv = () => {
    if (processedUsers.length === 0) {
      showToast(tr('No user data to export', 'Không có dữ liệu người dùng để xuất'), 'warning');
      return;
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [tr('Full name,Username,Email,Department,Role,Status', 'Họ và tên,Tên tài khoản,Email,Phòng ban,Vai trò,Trạng thái')]
        .concat(
          processedUsers.map((u) => {
            const roleStr = u.roles?.map((r) => r.roleName).join(';') || u.role || '';
            const statusStr = (u.isActive !== undefined ? u.isActive : u.status === 'Active') ? tr('Active', 'Hoạt động') : tr('Inactive', 'Tạm khóa');
            return `"${u.name}","${u.userName}","${u.email}","${u.department || ''}","${roleStr}","${statusStr}"`;
          })
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(tr(`Exported ${processedUsers.length} users to CSV`, `Đã xuất ${processedUsers.length} người dùng ra file CSV`), 'info');
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* ==================================================================== */}
        {/* 1. LEFT / MAIN COLUMN: User Management Workbench matching 08.png */}
        {/* ==================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-w-0">
          
          {/* Page Title & Subtitle matching 08.Màn hình người dùng.png */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                {tr('Users', 'Người dùng')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {tr('Manage accounts, roles, and system access.', 'Quản lý tài khoản, vai trò và trạng thái truy cập hệ thống.')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenAddUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{tr('Add user', 'Thêm người dùng')}</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{tr('Export data', 'Xuất dữ liệu')}</span>
              </button>
            </div>
          </div>

          {/* Top Metrics Pills Row matching 08.Màn hình người dùng.png */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-800 dark:text-zinc-200 pt-0.5">
            <span>
              <strong>{metrics.total}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">{tr('users', 'người dùng')}</span>
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span>
              <strong>{metrics.active}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">{tr('active', 'đang hoạt động')}</span>
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span>
              <strong>{metrics.locked}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">{tr('locked', 'tạm khóa')}</span>
            </span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span>
              <strong>{metrics.pending}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">{tr('pending', 'đang chờ')}</span>
            </span>
          </div>

          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            {[
              { value: 'all', label: tr('All users', 'Tất cả người dùng') },
              { value: 'pending', label: tr('Pending', 'Đang chờ') },
              { value: 'inactive', label: tr('Locked', 'Tạm khóa') },
            ].map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab.value);
                    setCurrentPage(1);
                  }}
                  className={`relative -mb-px min-h-10 px-1 transition-colors cursor-pointer ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'hover:text-slate-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab.label}
                  {isActive && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />}
                </button>
              );
            })}
          </div>

          {/* Filter & Actions Bar matching 08.Màn hình người dùng.png */}
          <CustomTable.Filters>
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              
              {/* Left Search & Dropdown Filters */}
              <div className="flex flex-1 flex-wrap items-center gap-2.5">
                {/* Search Box */}
                <div className="relative flex-1 min-w-[220px]">
                  <input
                    type="text"
                    placeholder={tr('Search by name, email, or department...', 'Tìm theo tên, email hoặc phòng ban...')}
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="min-w-[170px] px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">{tr('Role', 'Vai trò')}</option>
                  {roles.map((r) => {
                    const rName = r.name || (r as any).role || r.id;
                    return (
                      <option key={r.id || rName} value={rName}>
                        {rName}
                      </option>
                    );
                  })}
                </select>

                {/* Department Filter */}
                <select
                  value={departmentFilter}
                  onChange={(e) => {
                    setDepartmentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="min-w-[210px] px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">{tr('Department', 'Phòng ban')}</option>
                  {departments.map((d) => (
                    <option key={d.id || d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="min-w-[150px] px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">{tr('Status', 'Trạng thái')}</option>
                  <option value="active">{tr('Active', 'Hoạt động')}</option>
                  <option value="pending">{tr('Pending', 'Đang chờ')}</option>
                  <option value="inactive">{tr('Locked', 'Tạm khóa')}</option>
                </select>
              </div>

            </div>
          </CustomTable.Filters>

          {/* Error Alert */}
          {isUsersError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{tr('Could not load users:', 'Lỗi khi tải dữ liệu người dùng:')} {(usersError as any)?.message || tr('Check the API connection', 'Vui lòng kiểm tra kết nối API')}.</span>
              </div>
              <button
                onClick={() => refetchUsers()}
                className="px-2 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{tr('Retry', 'Thử lại')}</span>
              </button>
            </div>
          )}

          {/* Users Table matching 08.Màn hình người dùng.png */}
          <CustomTable<any> columns={[]} data={[]} className="bg-white dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <CustomTable.Table className="w-full text-left border-collapse text-xs">
                <CustomTable.Head>
                  <CustomTable.Row className="bg-slate-50/80 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                    <CustomTable.HeaderCell className="py-3.5 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedUsers.length > 0 &&
                          selectedUserIds.length === paginatedUsers.length
                        }
                        onChange={handleToggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="py-3.5 px-4">{tr('FULL NAME', 'HỌ VÀ TÊN')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="py-3.5 px-4">{tr('DEPARTMENT', 'PHÒNG BAN')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="py-3.5 px-4">{tr('ROLE', 'VAI TRÒ')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="py-3.5 px-4">{tr('STATUS', 'TRẠNG THÁI')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="py-3.5 px-4">{tr('LAST ACTIVITY', 'HOẠT ĐỘNG GẦN NHẤT')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="nexora-table-action-cell py-3.5 px-4 text-right"></CustomTable.HeaderCell>
                  </CustomTable.Row>
                </CustomTable.Head>

                <CustomTable.Body className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {isUsersLoading ? (
                    <CustomTable.Row>
                      <CustomTable.Cell colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                        <span>{tr('Loading users...', 'Đang tải danh sách người dùng...')}</span>
                      </CustomTable.Cell>
                    </CustomTable.Row>
                  ) : paginatedUsers.length === 0 ? (
                    <CustomTable.Row>
                      <CustomTable.Cell colSpan={7} className="py-12 text-center text-slate-400">
                        {tr('No matching users found.', 'Không tìm thấy người dùng nào phù hợp.')}
                      </CustomTable.Cell>
                    </CustomTable.Row>
                  ) : (
                    paginatedUsers.map((user) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      const isDetailActive = activeUserDetail?.id === user.id;
                      const isActive = user.isActive !== undefined ? user.isActive : (user.status === 'Active' || user.status === 'Đang hoạt động');
                      const roleName = user.roles?.[0]?.roleName || user.role || tr('Member', 'Thành viên');
                      const deptName = user.department || tr('Not assigned', 'Chưa phân công');

                      return (
                        <CustomTable.Row
                          key={user.id}
                          className={`hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                            isDetailActive ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          {/* Checkbox */}
                          <CustomTable.Cell className="py-3.5 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectUser(user.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </CustomTable.Cell>

                          {/* HỌ VÀ TÊN */}
                          <CustomTable.Cell className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-zinc-100 block leading-tight">
                                  {user.name || user.displayName || user.userName}
                                </span>
                                <span className="text-[11px] text-slate-400 dark:text-zinc-500 block leading-none mt-0.5">
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </CustomTable.Cell>

                          {/* PHÒNG BAN */}
                          <CustomTable.Cell className="py-3.5 px-4 text-slate-700 dark:text-zinc-300 font-normal">
                            {deptName}
                          </CustomTable.Cell>

                          {/* VAI TRÒ */}
                          <CustomTable.Cell className="py-3.5 px-4 font-normal text-slate-700 dark:text-zinc-300">
                            {roleName}
                          </CustomTable.Cell>

                          {/* TRẠNG THÁI */}
                          <CustomTable.Cell className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              <span>{isActive ? tr('Active', 'Hoạt động') : tr('Locked', 'Tạm khóa')}</span>
                            </div>
                          </CustomTable.Cell>

                          {/* HOẠT ĐỘNG GẦN NHẤT */}
                          <CustomTable.Cell className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-normal">
                            {tr('Not available', 'Chưa có dữ liệu')}
                          </CustomTable.Cell>

                          {/* THAO TÁC (⋯) */}
                          <CustomTable.Cell className="nexora-table-action-cell py-3.5 px-4 text-right">
                            <TableRowActions
                              align="right"
                              items={[
                                {
                                  label: tr('View details', 'Xem chi tiết'),
                                  icon: <UserCheck className="w-3.5 h-3.5" />,
                                  onClick: () => setActiveUserDetail(user),
                                },
                                {
                                  label: tr('Edit details', 'Chỉnh sửa thông tin'),
                                  icon: <Edit2 className="w-3.5 h-3.5" />,
                                  onClick: () => handleOpenEditUser(user),
                                },
                                {
                                  label: tr('Reset password', 'Đặt lại mật khẩu'),
                                  icon: <KeyRound className="w-3.5 h-3.5" />,
                                  onClick: () => handleOpenResetPassword(user),
                                },
                                {
                                  label: isActive ? tr('Lock account', 'Khóa tài khoản') : tr('Unlock account', 'Mở khóa tài khoản'),
                                  icon: isActive ? <Lock className="w-3.5 h-3.5 text-rose-500" /> : <Unlock className="w-3.5 h-3.5 text-emerald-500" />,
                                  danger: isActive,
                                  onClick: () => handleToggleUserStatus(user),
                                },
                              ]}
                            />
                          </CustomTable.Cell>
                        </CustomTable.Row>
                      );
                    })
                  )}
                </CustomTable.Body>
              </CustomTable.Table>
            </div>

            {/* Pagination Footer matching 08.Màn hình người dùng.png */}
            <div className="nexora-table-footer py-3 px-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-600 dark:text-zinc-400">
              <div>
                {tr('Showing', 'Hiển thị')}{' '}
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {processedUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, processedUsers.length)}
                </span>{' '}
                {tr('of', 'trong')}{' '}
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {processedUsers.length}
                </span>{' '}
                {tr('users', 'người dùng')}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-6 h-6 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                      currentPage === num
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {num}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </CustomTable>

        </div>

        {/* ==================================================================== */}
        {/* 2. RIGHT COLUMN: Side Drawer Chi tiết người dùng matching 08.png */}
        {/* ==================================================================== */}
        {activeUserDetail && (
          <Modal isOpen={Boolean(activeUserDetail)} onClose={() => setActiveUserDetail(null)} title={tr('User details', 'Chi tiết người dùng')} maxWidth="lg">
            <div className="max-h-[72vh] overflow-y-auto">

            {/* Drawer Body */}
            <div className="p-5 space-y-6 flex-1 text-xs">
              
              {/* Profile Card Header */}
              <div className="flex items-center gap-3.5 pb-2">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shadow-xs">
                    {getInitials(activeUserDetail.name || activeUserDetail.userName)}
                  </div>
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 absolute -bottom-0.5 -right-0.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100 truncate">
                    {activeUserDetail.name || activeUserDetail.displayName || activeUserDetail.userName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                    {activeUserDetail.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {tr('Active', 'Hoạt động')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 1: Thông tin cơ bản */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="grid grid-cols-3 gap-2 text-slate-500 dark:text-zinc-400">
                  <span>{tr('Department', 'Phòng ban')}</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-zinc-100 text-right">
                    {activeUserDetail.department || tr('Not assigned', 'Chưa phân công')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-slate-500 dark:text-zinc-400">
                  <span>{tr('Role', 'Vai trò')}</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-zinc-100 text-right">
                    {activeUserDetail.roles?.[0]?.roleName || activeUserDetail.role || 'SuperAdmin'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-slate-500 dark:text-zinc-400">
                  <span>{tr('Language', 'Ngôn ngữ')}</span>
                  <span className="col-span-2 font-medium text-slate-900 dark:text-zinc-100 text-right">
                    {activeUserDetail.preferredLanguage === 'vi' ? tr('Vietnamese', 'Tiếng Việt') : tr('English', 'Tiếng Anh')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-slate-500 dark:text-zinc-400">
                  <span>{tr('Last login', 'Đăng nhập gần nhất')}</span>
                  <span className="col-span-2 font-mono text-slate-900 dark:text-zinc-100 text-right">
                    {tr('Not available', 'Chưa có dữ liệu')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-slate-500 dark:text-zinc-400">
                  <span>{tr('Account created', 'Tạo tài khoản')}</span>
                  <span className="col-span-2 font-mono text-slate-900 dark:text-zinc-100 text-right">
                    {tr('Not available', 'Chưa có dữ liệu')}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-slate-500 dark:text-zinc-400 block">{tr('Effective permissions', 'Quyền hiệu lực')}</span>
                  <div className="p-2.5 bg-slate-50 dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-0.5">
                    <span className="font-semibold text-slate-900 dark:text-zinc-100 block">
                      {tr('Based on assigned role', 'Theo vai trò được gán')}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                      {activeUserDetail.roles?.map(role => role.roleName).join(', ') || activeUserDetail.role || tr('No role assigned', 'Chưa gán vai trò')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Hoạt động gần đây matching 08.png */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-zinc-100">
                    {tr('Recent activity', 'Hoạt động gần đây')}
                  </h5>
                  <button
                    onClick={() => showToast(tr('Open the user activity history', 'Mở toàn bộ lịch sử thao tác của người dùng'), 'info')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {tr('View all', 'Xem tất cả')}
                  </button>
                </div>

                <div className="space-y-3 pl-1">
                  {/* Item 1 */}
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400 pt-0.5 w-8 shrink-0">10:24</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{tr('Signed in from Chrome on Windows', 'Đăng nhập thành công từ Chrome trên Windows')}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">IP: 113.160.72.45</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400 pt-0.5 w-8 shrink-0">09:58</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{tr('Uploaded a document', 'Tải tài liệu')} "Kế hoạch kiểm thử UAT_Tuần 21-22.xlsx"</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{tr('From the ERP Nexora project folder', 'Từ thư mục Dự án ERP Nexora')}</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400 pt-0.5 w-8 shrink-0">09:31</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <Edit2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{tr('Updated project information', 'Cập nhật thông tin dự án')} "Kiểm thử UAT — ERP"</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{tr('Changed priority from Medium to High', 'Thay đổi trạng thái từ Trung bình → Cao')}</span>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400 pt-0.5 w-8 shrink-0">08:45</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <Key className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{tr('Reset the password for phat1', 'Đặt lại mật khẩu cho người dùng phat1')}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{tr('By: lenhu', 'Bởi: lenhu')}</span>
                    </div>
                  </div>

                  {/* Item 5 */}
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-400 pt-0.5 w-8 shrink-0">08:12</span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-zinc-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{tr('Updated the role for Phat', 'Cập nhật vai trò cho người dùng Phat')}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">{tr('From Member to Administrator', 'Từ Thành viên → Quản trị viên')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Actions row matching 08.png */}
              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleOpenEditUser(activeUserDetail)}
                    className="py-2 px-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{tr('Edit', 'Chỉnh sửa')}</span>
                  </button>

                  <button
                    onClick={() => handleOpenResetPassword(activeUserDetail)}
                    className="py-2 px-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{tr('Reset password', 'Đặt lại MK')}</span>
                  </button>

                  <button
                    onClick={() => showToast(tr('Open user permissions', 'Mở điều chỉnh phân quyền người dùng'), 'info')}
                    className="py-2 px-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{tr('Change role', 'Đổi vai trò')}</span>
                  </button>
                </div>

                {/* Lock / Unlock button */}
                <button
                  onClick={() => handleToggleUserStatus(activeUserDetail)}
                  className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{tr('Lock account', 'Tạm khóa tài khoản')}</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{tr('System changes are recorded in the audit trail.', 'Audit trail được ghi lại đầy đủ cho mọi thay đổi hệ thống.')}</span>
                </p>
              </div>

            </div>

            </div>
          </Modal>
        )}

      </div>

      {/* Modals */}
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
            refetchUsers();
          }}
        />
      )}

    </div>
  );
};

export default UsersPage;
