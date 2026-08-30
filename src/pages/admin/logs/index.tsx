import React, { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import {
  useActivityLogsQuery,
  ActivityLogItem,
} from '@/api/activity-logs.api';
import { LogDetailModal } from './LogDetailModal';
import {
  CustomTable,
  Column,
  TableToolbar,
  TableRowActions,
  StatusBadge,
  SortConfig,
} from '@/components/customTable';
import {
  Eye,
  Copy,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const LogsPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common', 'table']);

  // TanStack Query for Activity Logs
  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useActivityLogsQuery();

  // Local Filter & Pagination State
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig | undefined>(undefined);

  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLogItem | null>(null);

  const handleOpenDetail = (log: ActivityLogItem) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const handleCopyLog = (log: ActivityLogItem) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    showToast('Đã sao chép chi tiết log vào clipboard', 'info');
  };

  const handleSort = (key: string) => {
    let order: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
  };

  // Filtered & Sorted Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.description.toLowerCase().includes(q) ||
        log.ip.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q) ||
        (log.actorName && log.actorName.toLowerCase().includes(q)) ||
        (log.actorUserId && log.actorUserId.toLowerCase().includes(q));

      const matchModule =
        moduleFilter === 'all' ||
        log.module.toLowerCase() === moduleFilter.toLowerCase();

      const matchResult =
        resultFilter === 'all' ||
        log.result.toUpperCase() === resultFilter.toUpperCase();

      return matchSearch && matchModule && matchResult;
    });
  }, [logs, search, moduleFilter, resultFilter]);

  const sortedLogs = useMemo(() => {
    if (!sortConfig) return filteredLogs;
    return [...filteredLogs].sort((a, b) => {
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
  }, [filteredLogs, sortConfig]);

  const totalPages = Math.ceil(sortedLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedLogs.slice(start, start + pageSize);
  }, [sortedLogs, page, pageSize]);

  // Export CSV Handler
  const handleExportCsv = () => {
    if (logs.length === 0) {
      showToast('Không có dữ liệu log để xuất', 'warning');
      return;
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Thời gian,Phương thức,Mô tả/Endpoint,Phân hệ,Địa chỉ IP,Mã phản hồi,Thời gian xử lý,Kết quả']
        .concat(
          filteredLogs.map(
            (l) =>
              `"${l.occurredAt}","${l.action}","${l.description}","${l.module}","${l.ip}","${l.parsedMetadata?.statusCode || ''}","${l.parsedMetadata?.elapsedMilliseconds || ''}","${l.result}"`
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
    showToast(`Đã xuất ${filteredLogs.length} dòng log ra file CSV`, 'info');
  };

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'POST':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'DELETE':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
    }
  };

  // Enterprise SaaS Minimalist Columns for Activity Logs
  const logColumns: Column<ActivityLogItem>[] = [
    {
      id: 'occurredAt',
      header: 'Thời gian',
      width: '150px',
      sortable: true,
      sortKey: 'occurredAt',
      render: (l) => {
        const d = new Date(l.occurredAt);
        const formatted = d.toLocaleString('vi-VN', {
          hour12: false,
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        return (
          <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
            {formatted}
          </span>
        );
      },
    },
    {
      id: 'action_desc',
      header: 'Thao tác & Endpoint',
      sortable: true,
      sortKey: 'description',
      render: (l) => (
        <div className="flex items-center gap-2 py-0.5 min-w-0">
          <span
            className={`px-1.5 py-0.2 font-mono text-[10px] font-bold rounded border shrink-0 ${getMethodBadgeClass(
              l.action
            )}`}
          >
            {l.action}
          </span>
          <span
            onClick={() => handleOpenDetail(l)}
            className="font-mono text-xs font-semibold text-slate-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors truncate"
          >
            {l.description || l.parsedMetadata?.routeTemplate || '—'}
          </span>
        </div>
      ),
    },
    {
      id: 'module',
      header: 'Phân hệ',
      width: '100px',
      sortable: true,
      sortKey: 'module',
      render: (l) => (
        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded border border-slate-200 dark:border-zinc-700">
          {l.module}
        </span>
      ),
    },
    {
      id: 'status_perf',
      header: 'Phản hồi / Tốc độ',
      width: '130px',
      render: (l) => {
        const code = l.parsedMetadata?.statusCode;
        const ms = l.parsedMetadata?.elapsedMilliseconds;

        return (
          <div className="flex items-center gap-2 text-xs font-mono">
            {code ? (
              <span
                className={`font-semibold ${
                  code >= 200 && code < 300
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {code}
              </span>
            ) : (
              <span className="text-slate-400">—</span>
            )}
            {ms !== undefined && (
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                {ms}ms
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: 'ip',
      header: 'Địa chỉ IP',
      width: '110px',
      render: (l) => (
        <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
          {l.ip}
        </span>
      ),
    },
    {
      id: 'result',
      header: 'Kết quả',
      width: '120px',
      sortable: true,
      sortKey: 'result',
      render: (l) => (
        <StatusBadge
          status={l.result === 'SUCCESS'}
          activeText="Thành công"
          inactiveText={l.result || 'Thất bại'}
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      align: 'right',
      width: '50px',
      render: (l) => (
        <TableRowActions
          align="right"
          items={[
            {
              label: 'Xem chi tiết log',
              icon: <Eye className="w-3.5 h-3.5" />,
              onClick: () => handleOpenDetail(l),
            },
            {
              label: 'Sao chép JSON',
              icon: <Copy className="w-3.5 h-3.5" />,
              onClick: () => handleCopyLog(l),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header
        title={t('logs.title', { defaultValue: 'Nhật ký Hoạt động (Activity Logs)' })}
        subTitle={t('logs.subtitle', { defaultValue: 'Theo dõi và kiểm toán các yêu cầu HTTP, thay đổi dữ liệu và phiên truy cập hệ thống' })}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 w-full max-w-7xl mx-auto space-y-4">
        {/* Error Alert */}
        {isError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Không thể đồng bộ log từ máy chủ: {(error as any)?.message || 'Vui lòng kiểm tra kết nối API'}.</span>
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
        <CustomTable<ActivityLogItem>
          toolbar={
            <TableToolbar
              isIntegratedHeader
              searchValue={search}
              onSearchChange={(q) => {
                setSearch(q);
                setPage(1);
              }}
              searchPlaceholder="Tìm kiếm theo endpoint, IP, phân hệ..."
              totalCount={logs.length}
              filteredCount={filteredLogs.length}
              filterSlot={
                <div className="flex items-center gap-2">
                  <select
                    value={moduleFilter}
                    onChange={(e) => {
                      setModuleFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50/70 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả phân hệ</option>
                    <option value="HTTP">HTTP</option>
                    <option value="User">User</option>
                    <option value="Role">Role</option>
                    <option value="Department">Department</option>
                    <option value="Auth">Auth</option>
                    <option value="Organization">Organization</option>
                  </select>

                  <select
                    value={resultFilter}
                    onChange={(e) => {
                      setResultFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-slate-50/70 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Tất cả kết quả</option>
                    <option value="SUCCESS">Thành công</option>
                    <option value="FAILED">Thất bại</option>
                  </select>
                </div>
              }
              secondaryAction={{
                label: 'Làm mới',
                icon: <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-600' : ''}`} />,
                onClick: () => refetch(),
              }}
              primaryAction={{
                label: 'Xuất CSV',
                icon: <Download className="w-3.5 h-3.5" />,
                onClick: handleExportCsv,
              }}
            />
          }
          columns={logColumns}
          data={paginatedLogs}
          isLoading={isLoading || isFetching}
          skeletonRowCount={6}
          sortConfig={sortConfig}
          onSort={handleSort}
          onRowClick={handleOpenDetail}
          keyExtractor={(l) => l.id}
          emptyState={{
            isSearch: Boolean(search || moduleFilter !== 'all' || resultFilter !== 'all'),
            actionText: search ? undefined : 'Làm mới dữ liệu',
            onAction: search ? undefined : () => refetch(),
          }}
          pagination={{
            currentPage: page,
            totalPages,
            totalItems: filteredLogs.length,
            pageSize,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              setPage(1);
            },
            pageSizeOptions: [10, 20, 50, 100],
          }}
        />
      </div>

      {/* Modal Chi tiết Activity Log */}
      {isDetailModalOpen && (
        <LogDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          log={selectedLog}
        />
      )}
    </div>
  );
};

export default LogsPage;
