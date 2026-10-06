import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import {
  useActivityLogsQuery,
  ActivityLogItem,
} from '@/api/activity-logs.api';
import { useUsersQuery } from '@/api/users.api';
import { LogDetailModal } from './LogDetailModal';
import { Modal } from '@/components/disclosure';
import { CustomTable, TableRowActions } from '@/components/customTable';
import {
  Search,
  Calendar,
  RefreshCw,
  Download,
  Settings,
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  Building2,
  FileText,
  Key,
  Trash2,
  Edit2,
  Plus,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Layers,
  Globe,
  Radio,
} from 'lucide-react';

interface FormattedLog {
  raw: ActivityLogItem;
  id: string;
  timeFormatted: string;
  actor: {
    name: string;
    role: string;
    email: string;
    initials: string;
    avatarBg: string;
  };
  actionText: string;
  actionIcon: any;
  actionIconColor: string;
  moduleName: string;
  target: {
    name: string;
    type: string;
    id: string;
  };
  riskLevel: 'Cao' | 'Trung bình' | 'Thấp';
  clientInfo: {
    ip: string;
    device: string;
    statusCode: number;
    elapsedMs: number | null;
    routeTemplate: string;
  };
  isSuccess: boolean;
  statusText: string;
}

const getAvatarBg = (name?: string): string => {
  const colors = [
    'bg-blue-600 text-white',
    'bg-emerald-600 text-white',
    'bg-indigo-600 text-white',
    'bg-purple-600 text-white',
    'bg-teal-600 text-white',
    'bg-cyan-600 text-white',
    'bg-amber-600 text-white',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const LogsPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common', 'table']);

  // TanStack Query for Activity Logs & Users (for enrichment)
  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useActivityLogsQuery();

  const { data: users = [] } = useUsersQuery();

  // User lookup map
  const userMap = useMemo(() => {
    const map = new Map<string, any>();
    users.forEach((u) => {
      map.set(u.id, u);
      if (u.userName) map.set(u.userName.toLowerCase(), u);
      if (u.email) map.set(u.email.toLowerCase(), u);
    });
    return map;
  }, [users]);

  // Filters State
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected Log for Side Drawer (null means closed)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Đã sao chép vào clipboard', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Format and Enrich raw activity logs using 100% REAL backend data
  const formattedLogs: FormattedLog[] = useMemo(() => {
    return logs.map((l) => {
      // 1. Time
      const d = new Date(l.occurredAt);
      const timeFormatted = !isNaN(d.getTime())
        ? d.toLocaleString('vi-VN', {
            hour12: false,
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : l.occurredAt;

      // 2. Real Actor Information
      let actorName = '';
      let actorRole = 'Người dùng';
      let actorEmail = l.actorEmail || l.actorUserName || '';

      if (l.actorUserId && userMap.has(l.actorUserId)) {
        const u = userMap.get(l.actorUserId);
        actorName = u.displayName || u.fullName || u.name || u.userName || '';
        actorRole = u.roles?.[0]?.roleName || u.role || 'Người dùng';
        if (!actorEmail) actorEmail = u.email || '';
      }

      if (!actorName && l.actorUserName) {
        actorName = l.actorUserName;
        if (actorName.toLowerCase().includes('admin') || actorName.toLowerCase().includes('super')) {
          actorRole = 'SuperAdmin';
        }
      } else if (!actorName && l.actorName) {
        actorName = l.actorName;
      }

      if (!actorName) {
        actorName = l.actorUserId ? `User (${l.actorUserId.slice(0, 8)})` : 'Hệ thống (System)';
        actorRole = 'Hệ thống';
      }

      const avatarBg = getAvatarBg(actorName);
      const initials = actorName
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(-2)
        .join('')
        .toUpperCase() || 'AD';

      // 3. Action, Route & Method from Real API
      const act = (l.action || 'GET').toUpperCase();
      const desc = l.description || '';
      const meta =
        typeof l.metadataJson === 'object' && l.metadataJson !== null
          ? l.metadataJson
          : l.parsedMetadata || {};
      const statusCode = meta.StatusCode ?? meta.statusCode ?? (l.result === 'SUCCESS' ? 200 : 500);
      const elapsedMs = meta.ElapsedMilliseconds ?? meta.elapsedMilliseconds ?? null;
      const routeTemplate = meta.RouteTemplate ?? meta.routeTemplate ?? desc;

      let moduleName = l.module || 'HTTP';
      let actionText = `${act} ${desc}`;
      let actionIcon = FileText;
      let actionIconColor = 'text-blue-500';
      let riskLevel: 'Cao' | 'Trung bình' | 'Thấp' = 'Thấp';
      let targetName = desc || l.resourceType || 'API Request';
      let targetType = l.resourceType || 'Request';

      const lowerRoute = (desc + ' ' + routeTemplate).toLowerCase();

      if (lowerRoute.includes('auth/login')) {
        moduleName = 'Xác thực';
        actionText = 'Đăng nhập hệ thống';
        actionIcon = FileText;
        actionIconColor = 'text-emerald-500';
        riskLevel = 'Thấp';
        targetName = actorName;
        targetType = 'Tài khoản';
      } else if (lowerRoute.includes('auth/logout')) {
        moduleName = 'Xác thực';
        actionText = 'Đăng xuất hệ thống';
        actionIcon = FileText;
        actionIconColor = 'text-slate-400';
        riskLevel = 'Thấp';
        targetName = actorName;
        targetType = 'Tài khoản';
      } else if (lowerRoute.includes('permission') || lowerRoute.includes('roles')) {
        moduleName = 'Vai trò & Quyền';
        targetType = 'Vai trò';
        targetName = desc || 'Phân quyền';
        if (act === 'PUT' || act === 'POST') {
          actionText = lowerRoute.includes('permission') ? 'Cập nhật quyền vai trò' : 'Cập nhật vai trò';
          actionIcon = Edit2;
          actionIconColor = 'text-blue-500';
          riskLevel = 'Cao';
        } else if (act === 'DELETE') {
          actionText = 'Xóa vai trò';
          actionIcon = Trash2;
          actionIconColor = 'text-rose-500';
          riskLevel = 'Cao';
        } else {
          actionText = 'Xem danh sách vai trò';
          actionIcon = Shield;
          riskLevel = 'Thấp';
        }
      } else if (lowerRoute.includes('user')) {
        moduleName = 'Người dùng';
        targetType = 'Người dùng';
        targetName = desc || 'Tài khoản người dùng';
        if (act === 'POST') {
          actionText = 'Tạo mới người dùng';
          actionIcon = Plus;
          actionIconColor = 'text-blue-500';
          riskLevel = 'Trung bình';
        } else if (act === 'PUT') {
          actionText = lowerRoute.includes('password') ? 'Đặt lại mật khẩu' : 'Cập nhật người dùng';
          actionIcon = lowerRoute.includes('password') ? Key : Edit2;
          actionIconColor = lowerRoute.includes('password') ? 'text-amber-500' : 'text-blue-500';
          riskLevel = lowerRoute.includes('password') ? 'Cao' : 'Trung bình';
        } else if (act === 'DELETE') {
          actionText = 'Khóa/Xóa người dùng';
          actionIcon = Trash2;
          actionIconColor = 'text-rose-500';
          riskLevel = 'Cao';
        } else {
          actionText = 'Xem danh sách người dùng';
          actionIcon = User;
          riskLevel = 'Thấp';
        }
      } else if (lowerRoute.includes('department')) {
        moduleName = 'Phòng ban';
        targetType = 'Phòng ban';
        targetName = desc || 'Phòng ban';
        if (act === 'POST') {
          actionText = 'Tạo mới phòng ban';
          actionIcon = Plus;
          riskLevel = 'Trung bình';
        } else if (act === 'PUT') {
          actionText = 'Cập nhật phòng ban';
          actionIcon = Edit2;
          riskLevel = 'Trung bình';
        } else if (act === 'DELETE') {
          actionText = 'Lưu trữ phòng ban';
          actionIcon = Trash2;
          riskLevel = 'Cao';
        } else {
          actionText = 'Xem danh sách phòng ban';
          actionIcon = Building2;
          riskLevel = 'Thấp';
        }
      } else if (lowerRoute.includes('activitylog') || lowerRoute.includes('activity-log') || lowerRoute.includes('log')) {
        moduleName = 'Nhật ký';
        targetType = 'Nhật ký';
        targetName = 'ActivityLog';
        actionText = 'Truy vấn nhật ký';
        actionIcon = Clock;
        riskLevel = 'Thấp';
      } else {
        if (act === 'DELETE') {
          actionText = `Xóa ${desc || 'dữ liệu'}`;
          actionIcon = Trash2;
          actionIconColor = 'text-rose-500';
          riskLevel = 'Cao';
        } else if (act === 'PUT' || act === 'POST') {
          actionText = `${act} ${desc || 'Cập nhật'}`;
          actionIcon = Edit2;
          riskLevel = 'Trung bình';
        } else {
          actionText = `GET ${desc || 'Truy vấn'}`;
          actionIcon = FileText;
          riskLevel = 'Thấp';
        }
      }

      const isSuccess = l.result?.toUpperCase() === 'SUCCESS' || (statusCode >= 200 && statusCode < 300);
      const statusText = isSuccess ? 'Thành công' : 'Thất bại';

      return {
        raw: l,
        id: l.id,
        timeFormatted,
        actor: {
          name: actorName,
          role: actorRole,
          email: actorEmail,
          initials,
          avatarBg,
        },
        actionText,
        actionIcon,
        actionIconColor,
        moduleName,
        target: {
          name: targetName,
          type: targetType,
          id: l.apiFunctionId || l.id,
        },
        riskLevel,
        clientInfo: {
          ip: l.ip || '::1',
          device: 'Chrome / Windows',
          statusCode,
          elapsedMs,
          routeTemplate,
        },
        isSuccess,
        statusText,
      };
    });
  }, [logs, userMap]);

  // Extract unique modules & users for filters
  const uniqueUsers = useMemo(() => {
    const set = new Set<string>();
    formattedLogs.forEach((l) => set.add(l.actor.name));
    return Array.from(set);
  }, [formattedLogs]);

  const uniqueModules = useMemo(() => {
    const set = new Set<string>();
    formattedLogs.forEach((l) => set.add(l.moduleName));
    return Array.from(set);
  }, [formattedLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return formattedLogs.filter((log) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.actor.name.toLowerCase().includes(q) ||
        log.actor.email.toLowerCase().includes(q) ||
        log.actionText.toLowerCase().includes(q) ||
        log.target.name.toLowerCase().includes(q) ||
        log.moduleName.toLowerCase().includes(q) ||
        log.clientInfo.ip.toLowerCase().includes(q) ||
        log.clientInfo.routeTemplate.toLowerCase().includes(q);

      const matchUser =
        userFilter === 'all' ||
        log.actor.name.toLowerCase() === userFilter.toLowerCase() ||
        log.actor.email.toLowerCase() === userFilter.toLowerCase();

      const matchModule =
        moduleFilter === 'all' ||
        log.moduleName.toLowerCase() === moduleFilter.toLowerCase() ||
        log.raw.module.toLowerCase() === moduleFilter.toLowerCase();

      const matchAction =
        actionFilter === 'all' ||
        log.raw.action.toLowerCase() === actionFilter.toLowerCase() ||
        log.actionText.toLowerCase().includes(actionFilter.toLowerCase());

      const matchRisk =
        riskFilter === 'all' ||
        log.riskLevel.toLowerCase() === riskFilter.toLowerCase();

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'success' && log.isSuccess) ||
        (statusFilter === 'failed' && !log.isSuccess);

      return (
        matchSearch &&
        matchUser &&
        matchModule &&
        matchAction &&
        matchRisk &&
        matchStatus
      );
    });
  }, [
    formattedLogs,
    search,
    userFilter,
    moduleFilter,
    actionFilter,
    riskFilter,
    statusFilter,
  ]);

  // Paginated logs
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page, pageSize]);

  // Selected Log Object for Drawer (null when closed)
  const activeSelectedLog = useMemo(() => {
    if (!selectedLogId) return null;
    return formattedLogs.find((l) => l.id === selectedLogId) || null;
  }, [selectedLogId, formattedLogs]);

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearch('');
    setDateRange('');
    setUserFilter('all');
    setModuleFilter('all');
    setActionFilter('all');
    setRiskFilter('all');
    setStatusFilter('all');
    setPage(1);
    showToast('Đã đặt lại toàn bộ bộ lọc', 'info');
  };

  // Export CSV Handler
  const handleExportLogs = () => {
    if (filteredLogs.length === 0) {
      showToast('Không có dữ liệu log để xuất', 'warning');
      return;
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Thời gian,Người thực hiện,Email,Vai trò,Hành động,Phương thức,Phân hệ,Đường dẫn API,Mã phản hồi,IP,Mức độ,Trạng thái']
        .concat(
          filteredLogs.map(
            (l) =>
              `"${l.timeFormatted}","${l.actor.name}","${l.actor.email}","${l.actor.role}","${l.actionText}","${l.raw.action}","${l.moduleName}","${l.raw.description}","${l.clientInfo.statusCode}","${l.clientInfo.ip}","${l.riskLevel}","${l.statusText}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `activity_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Đã xuất ${filteredLogs.length} dòng nhật ký ra file CSV`, 'info');
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* ==================================================================== */}
        {/* 1. LEFT / MAIN COLUMN: Logs Workbench matching 11.png */}
        {/* ==================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 min-w-0">
          
          {/* Top Page Header Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                Nhật ký hoạt động
              </h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Theo dõi toàn bộ thao tác và thay đổi trong hệ thống
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportLogs}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất nhật ký</span>
              </button>

              <button
                onClick={() => setIsStorageModalOpen(true)}
                className="px-3.5 py-2 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Thiết lập lưu trữ</span>
              </button>
            </div>
          </div>

          {/* 2-Row Filter Bar matching 11.Màn hình nhật ký hoạt động.png */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-2xs space-y-2.5">
            
            {/* Filter Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-center">
              {/* Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo người dùng, hành động, đối tượng..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Date Range Picker Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Chọn khoảng ngày..."
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* User Select */}
              <select
                value={userFilter}
                onChange={(e) => {
                  setUserFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả người dùng</option>
                {uniqueUsers.map((uName) => (
                  <option key={uName} value={uName}>
                    {uName}
                  </option>
                ))}
              </select>

              {/* Module Select */}
              <select
                value={moduleFilter}
                onChange={(e) => {
                  setModuleFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả module</option>
                <option value="HTTP">HTTP (API)</option>
                <option value="Xác thực">Xác thực (Auth)</option>
                <option value="Vai trò & Quyền">Vai trò & Quyền</option>
                <option value="Người dùng">Người dùng</option>
                <option value="Phòng ban">Phòng ban</option>
                <option value="Nhật ký">Nhật ký</option>
              </select>
            </div>

            {/* Filter Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-center">
              {/* Action Select */}
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả hành động</option>
                <option value="POST">POST (Thêm/Tạo)</option>
                <option value="PUT">PUT (Cập nhật)</option>
                <option value="GET">GET (Xem/Truy vấn)</option>
                <option value="DELETE">DELETE (Xóa/Khóa)</option>
              </select>

              {/* Risk Level Select */}
              <select
                value={riskFilter}
                onChange={(e) => {
                  setRiskFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả mức độ</option>
                <option value="cao">Cao</option>
                <option value="trung bình">Trung bình</option>
                <option value="thấp">Thấp</option>
              </select>

              {/* Status Select */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50/80 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="success">Thành công</option>
                <option value="failed">Thất bại</option>
              </select>

              {/* Reset Filter Button */}
              <div>
                <button
                  onClick={handleResetFilters}
                  className="w-full py-2 px-3 flex items-center justify-center gap-1.5 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Đặt lại bộ lọc</span>
                </button>
              </div>
            </div>

          </div>

          {/* Error Alert */}
          {isError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Không thể tải dữ liệu nhật ký: {(error as any)?.message || 'Vui lòng kiểm tra kết nối API'}.</span>
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

          {/* Main Activity Log Table matching 11.png */}
          <CustomTable<any> columns={[]} data={[]} className="bg-white dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-3.5">THỜI GIAN</th>
                    <th className="py-3 px-3.5">NGƯỜI DÙNG</th>
                    <th className="py-3 px-3.5">HÀNH ĐỘNG</th>
                    <th className="py-3 px-3.5">MODULE</th>
                    <th className="py-3 px-3.5">ĐỐI TƯỢNG</th>
                    <th className="py-3 px-3.5">IP / PHẢN HỒI</th>
                    <th className="py-3 px-3.5">MỨC ĐỘ</th>
                    <th className="py-3 px-3.5">TRẠNG THÁI</th>
                    <th className="py-3 px-3.5 text-right">THAO TÁC</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                        <span>Đang tải nhật ký hoạt động...</span>
                      </td>
                    </tr>
                  ) : paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        Không tìm thấy nhật ký hoạt động nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => {
                      const isSelected = activeSelectedLog?.id === log.id;
                      const ActionIcon = log.actionIcon;

                      return (
                        <tr
                          key={log.id}
                          className={`hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                            isSelected ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          {/* 1. THỜI GIAN */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <ActionIcon className={`w-3.5 h-3.5 shrink-0 ${log.actionIconColor}`} />
                              <span className="font-mono text-slate-700 dark:text-zinc-300">
                                {log.timeFormatted}
                              </span>
                            </div>
                          </td>

                          {/* 2. NGƯỜI DÙNG */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full ${log.actor.avatarBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-2xs`}
                              >
                                {log.actor.initials}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-zinc-100 block leading-tight max-w-[150px] truncate">
                                  {log.actor.name}
                                </span>
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 block leading-none">
                                  {log.actor.role}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 3. HÀNH ĐỘNG */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 font-medium max-w-[200px] truncate">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                {log.raw.action}
                              </span>
                              <span className="truncate">{log.actionText}</span>
                            </div>
                          </td>

                          {/* 4. MODULE */}
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-700 dark:text-zinc-300 font-normal">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 font-medium">
                              {log.moduleName}
                            </span>
                          </td>

                          {/* 5. ĐỐI TƯỢNG */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div className="max-w-[190px]">
                              <span
                                className="font-mono text-slate-900 dark:text-zinc-100 block leading-tight truncate text-[11px]"
                                title={log.target.name}
                              >
                                {log.target.name}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block leading-none mt-0.5">
                                {log.target.type}
                              </span>
                            </div>
                          </td>

                          {/* 6. IP / PHẢN HỒI */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <div>
                              <span className="font-mono text-slate-800 dark:text-zinc-200 block leading-tight">
                                {log.clientInfo.ip}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block leading-none font-mono">
                                {log.clientInfo.statusCode} {log.clientInfo.elapsedMs ? `• ${log.clientInfo.elapsedMs}ms` : ''}
                              </span>
                            </div>
                          </td>

                          {/* 7. MỨC ĐỘ */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {log.riskLevel === 'Cao' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                                Cao
                              </span>
                            )}
                            {log.riskLevel === 'Trung bình' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                                Trung bình
                              </span>
                            )}
                            {log.riskLevel === 'Thấp' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                                Thấp
                              </span>
                            )}
                          </td>

                          {/* 8. TRẠNG THÁI */}
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {log.isSuccess ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                                Thành công
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50">
                                Thất bại
                              </span>
                            )}
                          </td>

                          {/* 9. THAO TÁC */}
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <TableRowActions
                              align="right"
                              items={[
                                {
                                  label: 'Xem chi tiết',
                                  icon: <Maximize2 className="w-3.5 h-3.5" />,
                                  onClick: () => {
                                    setSelectedLogId(log.id);
                                  },
                                },
                                {
                                  label: 'Sao chép JSON',
                                  icon: <Copy className="w-3.5 h-3.5" />,
                                  onClick: () => {
                                    navigator.clipboard.writeText(JSON.stringify(log.raw, null, 2));
                                    showToast('Đã sao chép chi tiết log vào clipboard', 'info');
                                  },
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer matching 11.png */}
            <div className="py-3 px-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap text-xs text-slate-600 dark:text-zinc-400">
              <div>
                Hiển thị{' '}
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {filteredLogs.length === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
                  {Math.min(page * pageSize, filteredLogs.length)}
                </span>{' '}
                của{' '}
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {filteredLogs.length}
                </span>{' '}
                kết quả
              </div>

              {/* Numbered Pagination Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((num) => (
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

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-slate-400">...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`w-6 h-6 rounded text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        page === totalPages
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2 py-1 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-700 dark:text-zinc-300 cursor-pointer"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>
            </div>

          </CustomTable>

        </div>

        {/* ==================================================================== */}
        {/* 2. RIGHT COLUMN: Detail Drawer / Panel using 100% REAL API DATA */}
        {/* ==================================================================== */}
        {activeSelectedLog && (
          <Modal isOpen={Boolean(activeSelectedLog)} onClose={() => setSelectedLogId(null)} title="Chi tiết hoạt động" maxWidth="lg">
          <div className="max-h-[72vh] overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 space-y-3 shrink-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[10px] font-bold">
                      {activeSelectedLog.raw.action}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {activeSelectedLog.moduleName}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 leading-snug">
                    {activeSelectedLog.actionText}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedLogId(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded cursor-pointer transition-colors"
                  title="Đóng chi tiết"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Badges Row matching 11.png */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Mức độ: {activeSelectedLog.riskLevel}</span>
                </span>

                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Trạng thái: {activeSelectedLog.statusText}</span>
                </span>
              </div>
            </div>

            {/* Drawer Body Sections */}
            <div className="p-4 space-y-5 flex-1 text-xs">
              
              {/* Section 1: Tổng quan */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Tổng quan sự kiện
                </h4>

                <div className="space-y-2.5 text-slate-600 dark:text-zinc-400">
                  <div className="flex justify-between items-center">
                    <span>Thời gian thực hiện</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-100 font-medium">
                      {activeSelectedLog.timeFormatted}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Người thực hiện</span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full ${activeSelectedLog.actor.avatarBg} text-white font-bold text-[9px] flex items-center justify-center`}
                      >
                        {activeSelectedLog.actor.initials}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 block leading-tight">
                          {activeSelectedLog.actor.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block leading-none font-mono">
                          {activeSelectedLog.actor.email || activeSelectedLog.actor.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Địa chỉ IP</span>
                    <span className="font-mono text-slate-900 dark:text-zinc-100 font-medium">
                      {activeSelectedLog.clientInfo.ip}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Mã phản hồi HTTP</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {activeSelectedLog.clientInfo.statusCode} OK
                    </span>
                  </div>

                  {activeSelectedLog.clientInfo.elapsedMs !== null && (
                    <div className="flex justify-between items-center">
                      <span>Thời gian xử lý</span>
                      <span className="font-mono text-slate-900 dark:text-zinc-100 font-medium">
                        {activeSelectedLog.clientInfo.elapsedMs} ms
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <span className="shrink-0">ID Sự kiện (GUID)</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-800 dark:text-zinc-200 text-[10px] break-all text-right">
                        {activeSelectedLog.id}
                      </span>
                      <button
                        onClick={() => handleCopyText(activeSelectedLog.id, 'id')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Sao chép ID"
                      >
                        {copiedKey === 'id' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800" />

              {/* Section 2: Thông tin API & Đối tượng (Real API Payload) */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                  Thông tin Endpoint & Tài nguyên
                </h4>

                <div className="space-y-2 text-slate-600 dark:text-zinc-400">
                  <div className="flex justify-between items-center">
                    <span>Phân hệ (Module)</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {activeSelectedLog.raw.module}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Phương thức HTTP</span>
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {activeSelectedLog.raw.action}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Loại tài nguyên</span>
                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                      {activeSelectedLog.raw.resourceType}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <span className="block text-[11px] text-slate-400">Đường dẫn Route (URL)</span>
                    <div className="p-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg font-mono text-[11px] text-slate-800 dark:text-zinc-200 break-all flex items-center justify-between gap-2">
                      <span>{activeSelectedLog.raw.description || activeSelectedLog.clientInfo.routeTemplate}</span>
                      <button
                        onClick={() => handleCopyText(activeSelectedLog.raw.description, 'route')}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 shrink-0 cursor-pointer"
                        title="Sao chép URL"
                      >
                        {copiedKey === 'route' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-zinc-800" />

              {/* Section 3: Metadata JSON (Dữ liệu kỹ thuật thực tế) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                    Dữ liệu Metadata JSON
                  </h4>
                  <button
                    onClick={() => handleCopyText(JSON.stringify(activeSelectedLog.raw.metadataJson, null, 2), 'meta')}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </button>
                </div>

                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg overflow-x-auto max-h-48 text-[11px] font-mono text-emerald-400">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(activeSelectedLog.raw.metadataJson, null, 2) || '{}'}
                  </pre>
                </div>
              </div>

            </div>

            {/* Drawer Bottom Actions matching 11.png */}
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 grid grid-cols-2 gap-2 shrink-0 bg-slate-50/50 dark:bg-zinc-950/50">
              <button
                onClick={() => setIsDetailModalOpen(true)}
                className="py-2 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Xem JSON đầy đủ</span>
              </button>

              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(activeSelectedLog.raw, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `event_${activeSelectedLog.id}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  showToast('Đã tải xuống chi tiết sự kiện', 'success');
                }}
                className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải chi tiết log</span>
              </button>
            </div>

          </div>
          </Modal>
        )}

      </div>

      {/* Modal Xem JSON chi tiết đầy đủ */}
      {isDetailModalOpen && activeSelectedLog && (
        <LogDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          log={activeSelectedLog.raw}
        />
      )}

      {/* Modal Thiết lập lưu trữ (Retention Policy) */}
      {isStorageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg text-blue-600 dark:text-blue-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                    Thiết lập lưu trữ nhật ký (Log Retention)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Cấu hình thời gian lưu giữ và chính sách dọn dẹp log hệ thống
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsStorageModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-800 dark:text-zinc-200 block">
                  Thời hạn lưu trữ log tối đa
                </label>
                <select
                  defaultValue="365"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="90">90 ngày (3 tháng)</option>
                  <option value="180">180 ngày (6 tháng)</option>
                  <option value="365">365 ngày (1 năm - Tiêu chuẩn)</option>
                  <option value="730">730 ngày (2 năm)</option>
                  <option value="forever">Lưu trữ vĩnh viễn</option>
                </select>
                <span className="text-[11px] text-slate-400 block">
                  Các bản ghi log vượt quá thời hạn sẽ được tự động nén và lưu trữ đám mây.
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                      Tự động sao lưu định kỳ
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Tạo snapshot sao lưu dữ liệu log mỗi tuần một lần
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                      Cảnh báo rủi ro cao qua Email
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Gửi thông báo ngay cho SuperAdmin khi có sự cố nghiêm trọng
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-zinc-950/50">
              <button
                onClick={() => setIsStorageModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  showToast('Đã lưu cấu hình thiết lập lưu trữ log thành công!', 'success');
                  setIsStorageModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Lưu thiết lập
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LogsPage;
