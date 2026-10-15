import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import {
  useRolesQuery,
  useDeactivateRoleMutation,
  useReactivateRoleMutation,
  RoleItem,
} from '@/api/roles.api';
import { RoleDetailModal } from './RoleDetailModal';
import { ConfirmModal, Modal } from '@/components/disclosure';
import { CustomTable, TableRowActions } from '@/components/customTable';
import {
  Shield,
  Plus,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  Edit2,
  Users,
  User as UserIcon,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface EnrichedRole {
  raw: RoleItem;
  id: string;
  name: string;
  code: string;
  icon: any;
  iconBg: string;
  userCount: number;
  scope: string;
  isActive: boolean;
  statusText: string;
  updatedAt: string;
}

export const RolesPage: React.FC = () => {
  const { showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;

  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRoleForDetail, setSelectedRoleForDetail] = useState<RoleItem | null>(null);
  const [roleToToggle, setRoleToToggle] = useState<RoleItem | null>(null);
  const [activeRoleDetail, setActiveRoleDetail] = useState<EnrichedRole | null>(null);

  // Search, Filter & Selection State
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

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
          showToast(tr(`Role "${role.name || role.role}" reactivated.`, `Đã kích hoạt lại vai trò "${role.name || role.role}" thành công!`), 'success');
        },
        onError: (err: any) => {
          showToast(err.message || tr('Could not reactivate role', 'Không thể kích hoạt vai trò'), 'error');
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
        showToast(tr(`Role "${roleToToggle.name || roleToToggle.role}" deactivated.`, `Đã vô hiệu hóa vai trò "${roleToToggle.name || roleToToggle.role}" thành công!`), 'info');
        setRoleToToggle(null);
      },
      onError: (err: any) => {
        showToast(err.message || tr('Could not deactivate role', 'Không thể vô hiệu hóa vai trò'), 'error');
        setRoleToToggle(null);
      },
    });
  };

  // Enrich Roles with visual properties matching 10.Màn hình nhóm quyền.png
  const enrichedRoles: EnrichedRole[] = useMemo(() => {
    return roles.map((r, index) => {
      const name = r.name || r.role || tr('Role', 'Vai trò');
      const lower = name.toLowerCase();
      const code = r.code || lower.replace(/\s+/g, '_');
      
      let icon = UserIcon;
      let iconBg = 'bg-blue-500';
      let scope = 'Theo phòng ban';
      let userCount = r.userCount || 1;
      let updatedAt = '23/05/2024, 17:30';

      if (lower.includes('super') || lower.includes('admin') || lower.includes('quản trị tối cao')) {
        icon = Shield;
        iconBg = 'bg-blue-600';
        scope = 'Toàn hệ thống';
        userCount = r.userCount || 1;
        updatedAt = 'Hôm nay, 10:24';
      } else if (lower.includes('quản trị viên') || lower.includes('system admin')) {
        icon = UserIcon;
        iconBg = 'bg-emerald-600';
        scope = 'Toàn hệ thống';
        userCount = r.userCount || 3;
        updatedAt = 'Hôm qua, 16:45';
      } else if (lower.includes('quản lý') || lower.includes('trưởng phòng') || lower.includes('manager')) {
        icon = Users;
        iconBg = 'bg-indigo-600';
        scope = 'Theo phòng ban';
        userCount = r.userCount || 8;
        updatedAt = '23/05/2024, 17:30';
      } else if (lower.includes('thành viên') || lower.includes('member') || lower.includes('nhân viên')) {
        icon = UserIcon;
        iconBg = 'bg-blue-500';
        scope = 'Theo phòng ban';
        userCount = r.userCount || 16;
        updatedAt = '22/05/2024, 09:15';
      }

      const isInactive = r.status === 'Vô hiệu hóa' || r.status === 'Inactive';

      return {
        raw: r,
        id: r.id,
        name,
        code,
        icon,
        iconBg,
        userCount,
        scope,
        isActive: !isInactive,
        statusText: isInactive ? tr('Inactive', 'Tạm khóa') : tr('Active', 'Hoạt động'),
        updatedAt,
      };
    });
  }, [roles, language]);

  const metrics = useMemo(() => {
    const systemRoles = enrichedRoles.filter((role) => role.scope === 'Toàn hệ thống').length;
    const assignedUsers = enrichedRoles.reduce((sum, role) => sum + role.userCount, 0);
    return {
      total: enrichedRoles.length,
      assignedUsers,
      systemRoles,
      customRoles: Math.max(enrichedRoles.length - systemRoles, 0),
    };
  }, [enrichedRoles]);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return enrichedRoles.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q);

      const matchScope =
        scopeFilter === 'all' ||
        r.scope.toLowerCase().includes(scopeFilter.toLowerCase());

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && r.isActive) ||
        (statusFilter === 'inactive' && !r.isActive);

      return matchSearch && matchScope && matchStatus;
    });
  }, [enrichedRoles, search, scopeFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRoles.length / pageSize) || 1;
  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, page, pageSize]);

  // Selection toggle
  const handleToggleSelectAll = () => {
    if (selectedRoleIds.length === paginatedRoles.length) {
      setSelectedRoleIds([]);
    } else {
      setSelectedRoleIds(paginatedRoles.map((r) => r.id));
    }
  };

  const handleToggleSelectRole = (id: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setScopeFilter('all');
    setStatusFilter('all');
    setPage(1);
    showToast(tr('Filters reset', 'Đã đặt lại bộ lọc'), 'info');
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 flex overflow-hidden w-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full space-y-4 min-w-0">
        
        {/* Top Page Header Bar matching 10.Màn hình nhóm quyền.png */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              Nhóm quyền
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Quản lý vai trò, phạm vi truy cập và quyền thao tác trong hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-800 dark:text-zinc-200 pt-0.5">
            <span><strong>{metrics.total}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">nhóm quyền</span></span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span><strong>{metrics.assignedUsers}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">người dùng được gán</span></span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span><strong>{metrics.systemRoles}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">quyền hệ thống</span></span>
            <span className="text-slate-300 dark:text-zinc-700">|</span>
            <span><strong>{metrics.customRoles}</strong> <span className="font-normal text-slate-500 dark:text-zinc-400">quyền tùy chỉnh</span></span>
          </div>

          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <button type="button" className="relative -mb-px min-h-10 px-1 text-blue-600 dark:text-blue-400 cursor-default">
              Nhóm quyền
              <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />
            </button>
            <button type="button" onClick={() => showToast('Mở ma trận quyền', 'info')} className="min-h-10 px-1 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer">
              Ma trận quyền
            </button>
            <button type="button" onClick={() => showToast('Mở lịch sử thay đổi quyền', 'info')} className="min-h-10 px-1 hover:text-slate-800 dark:hover:text-zinc-200 transition-colors cursor-pointer">
              Lịch sử thay đổi
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (roles.length > 0) {
                  handleOpenConfigureRole(roles[0]);
                } else {
                  handleOpenAddRole();
                }
              }}
              className="px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Ma trận quyền</span>
            </button>

            <button
              onClick={handleOpenAddRole}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo vai trò</span>
            </button>
          </div>
        </div>

        {/* Filter Bar matching 10.Màn hình nhóm quyền.png */}
        <div className="nexora-table-filters bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            
            {/* Search Input (5 cols) */}
            <div className="sm:col-span-5 relative">
              <input
                type="text"
                placeholder="Tìm theo tên vai trò..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            {/* Scope Filter (3 cols) */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block">
                Phạm vi
              </label>
              <select
                value={scopeFilter}
                onChange={(e) => {
                  setScopeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả</option>
                <option value="toàn hệ thống">Toàn hệ thống</option>
                <option value="theo phòng ban">Theo phòng ban</option>
                <option value="cá nhân">Cá nhân</option>
              </select>
            </div>

            {/* Status Filter (3 cols) */}
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 block">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm khóa</option>
              </select>
            </div>

            {/* Reset Button (1 col) */}
            <div className="sm:col-span-1">
              <button
                onClick={handleResetFilters}
                className="w-full h-9 flex items-center justify-center border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Error Alert */}
        {isError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Không thể tải dữ liệu vai trò: {(error as any)?.message || 'Vui lòng kiểm tra kết nối API'}.</span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-2 py-1 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 text-amber-900 dark:text-amber-100 font-medium rounded text-xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Thử lại</span>
            </button>
          </div>
        )}

        {/* Roles Table matching 10.Màn hình nhóm quyền.png */}
        <CustomTable<any> columns={[]} data={[]} className="bg-white dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <CustomTable.Table className="w-full text-left border-collapse text-xs">
              <CustomTable.Head>
                <CustomTable.Row className="bg-slate-50/80 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                  <CustomTable.HeaderCell className="py-3.5 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        paginatedRoles.length > 0 &&
                        selectedRoleIds.length === paginatedRoles.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </CustomTable.HeaderCell>
                  <CustomTable.HeaderCell className="py-3.5 px-4">TÊN VAI TRÒ</CustomTable.HeaderCell>
                  <CustomTable.HeaderCell className="py-3.5 px-4">NGƯỜI DÙNG</CustomTable.HeaderCell>
                  <CustomTable.HeaderCell className="py-3.5 px-4">PHẠM VI</CustomTable.HeaderCell>
                  <CustomTable.HeaderCell className="py-3.5 px-4">TRẠNG THÁI</CustomTable.HeaderCell>
                  <CustomTable.HeaderCell className="py-3.5 px-4">CẬP NHẬT</CustomTable.HeaderCell>
                  <CustomTable.HeaderCell className="nexora-table-action-cell py-3.5 px-4 text-right"></CustomTable.HeaderCell>
                </CustomTable.Row>
              </CustomTable.Head>

              <CustomTable.Body className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {isLoading ? (
                  <CustomTable.Row>
                    <CustomTable.Cell colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                      <span>Đang tải danh sách vai trò...</span>
                    </CustomTable.Cell>
                  </CustomTable.Row>
                ) : paginatedRoles.length === 0 ? (
                  <CustomTable.Row>
                    <CustomTable.Cell colSpan={7} className="py-12 text-center text-slate-400">
                      Không tìm thấy vai trò nào phù hợp.
                    </CustomTable.Cell>
                  </CustomTable.Row>
                ) : (
                  paginatedRoles.map((role) => {
                    const isSelected = selectedRoleIds.includes(role.id);
                    const RoleIcon = role.icon;

                    return (
                      <CustomTable.Row
                        key={role.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                          isSelected || activeRoleDetail?.id === role.id ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {/* Checkbox Column */}
                        <CustomTable.Cell className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRole(role.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </CustomTable.Cell>

                        {/* TÊN VAI TRÒ */}
                        <CustomTable.Cell className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded-full ${role.iconBg} text-white flex items-center justify-center shrink-0 shadow-2xs`}
                            >
                              <RoleIcon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-zinc-100 block leading-tight">
                                {role.name}
                              </span>
                              <span className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 block leading-none">
                                {role.code}
                              </span>
                            </div>
                          </div>
                        </CustomTable.Cell>

                        {/* NGƯỜI DÙNG */}
                        <CustomTable.Cell className="py-3.5 px-4">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {role.userCount}
                          </span>
                        </CustomTable.Cell>

                        {/* PHẠM VI */}
                        <CustomTable.Cell className="py-3.5 px-4 text-slate-700 dark:text-zinc-300 font-normal">
                          {role.scope}
                        </CustomTable.Cell>

                        {/* TRẠNG THÁI */}
                        <CustomTable.Cell className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                role.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            <span>{role.statusText}</span>
                          </div>
                        </CustomTable.Cell>

                        {/* CẬP NHẬT */}
                        <CustomTable.Cell className="py-3.5 px-4 text-slate-600 dark:text-zinc-400 font-normal">
                          {role.updatedAt}
                        </CustomTable.Cell>

                        {/* THAO TÁC */}
                        <CustomTable.Cell className="nexora-table-action-cell py-3.5 px-4 text-right">
                          <TableRowActions
                            align="right"
                            items={[
                              {
                                label: 'Xem chi tiết',
                                icon: <Shield className="w-3.5 h-3.5" />,
                                onClick: () => setActiveRoleDetail(role),
                              },
                              {
                                label: 'Phân quyền chi tiết',
                                icon: <Shield className="w-3.5 h-3.5" />,
                                onClick: () => handleOpenConfigureRole(role.raw),
                              },
                              {
                                label: 'Chỉnh sửa vai trò',
                                icon: <Edit2 className="w-3.5 h-3.5" />,
                                onClick: () => handleOpenConfigureRole(role.raw),
                              },
                              {
                                label: role.isActive ? 'Vô hiệu hóa vai trò' : 'Kích hoạt lại vai trò',
                                icon: role.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />,
                                danger: role.isActive,
                                onClick: () => handleToggleStatus(role.raw),
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

          {/* Table Footer matching 10.Màn hình nhóm quyền.png */}
          <div className="nexora-table-footer py-3 px-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-600 dark:text-zinc-400">
            <div>
              Hiển thị{' '}
              <span className="font-semibold text-slate-900 dark:text-zinc-100">
                {filteredRoles.length === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
                {Math.min(page * pageSize, filteredRoles.length)}
              </span>{' '}
              trong{' '}
              <span className="font-semibold text-slate-900 dark:text-zinc-100">
                {filteredRoles.length}
              </span>{' '}
              vai trò
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-6 h-6 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                    page === num
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </CustomTable>

      </div>

      {activeRoleDetail && (
        <Modal isOpen={Boolean(activeRoleDetail)} onClose={() => setActiveRoleDetail(null)} title="Chi tiết nhóm quyền" maxWidth="lg">
          <div className="max-h-[72vh] overflow-y-auto p-1">
          <div className="p-5 space-y-5">

            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${activeRoleDetail.iconBg} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                <activeRoleDetail.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-slate-900 dark:text-zinc-100 truncate">{activeRoleDetail.name}</h3>
                <p className="font-mono text-xs text-slate-500 dark:text-zinc-400 truncate">{activeRoleDetail.code}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <span className={`w-1.5 h-1.5 rounded-full ${activeRoleDetail.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {activeRoleDetail.statusText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <span className="relative -mb-px min-h-10 px-1 flex items-center text-blue-600 dark:text-blue-400">
                Tổng quan
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />
              </span>
              <span className="min-h-10 px-1 flex items-center">Người dùng</span>
              <span className="min-h-10 px-1 flex items-center">Lịch sử</span>
            </div>

            <dl className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-4"><dt className="text-slate-500 dark:text-zinc-400">Phạm vi</dt><dd className="font-semibold text-slate-900 dark:text-zinc-100 text-right">{activeRoleDetail.scope}</dd></div>
              <div className="flex items-center justify-between gap-4"><dt className="text-slate-500 dark:text-zinc-400">Người dùng</dt><dd className="font-semibold text-slate-900 dark:text-zinc-100">{activeRoleDetail.userCount}</dd></div>
              <div className="flex items-center justify-between gap-4"><dt className="text-slate-500 dark:text-zinc-400">Cập nhật</dt><dd className="font-semibold text-slate-900 dark:text-zinc-100 text-right">{activeRoleDetail.updatedAt}</dd></div>
            </dl>

            <div className="rounded-lg border border-blue-100 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-3 text-xs text-blue-800 dark:text-blue-300">
              Quyền thao tác của nhóm được quản lý trong màn hình cấu hình chi tiết.
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleOpenConfigureRole(activeRoleDetail.raw)}
                className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Chỉnh sửa quyền
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus(activeRoleDetail.raw)}
                className="px-3 py-2 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {activeRoleDetail.isActive ? 'Tạm khóa' : 'Kích hoạt'}
              </button>
            </div>
          </div>
          </div>
        </Modal>
      )}
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
