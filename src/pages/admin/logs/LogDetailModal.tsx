import React from 'react';
import { Modal } from '@/components/disclosure';
import { ActivityLogItem } from '@/api/activity-logs.api';
import { StatusBadge } from '@/components/customTable';
import { Copy, Check, Clock, Terminal, Globe, User, Activity, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface LogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: ActivityLogItem | null;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({ isOpen, onClose, log }) => {
  const { showToast } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!log) return null;

  const metadata = log.parsedMetadata || {};
  const statusCode = metadata.statusCode;
  const elapsedMs = metadata.elapsedMilliseconds;
  const formattedDate = new Date(log.occurredAt).toLocaleString('vi-VN', {
    hour12: false,
  });

  const getMethodBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'POST':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'DELETE':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700';
    }
  };

  const handleCopyJson = () => {
    const rawContent =
      typeof log.metadataJson === 'string'
        ? log.metadataJson
        : JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(rawContent);
    setCopied(true);
    showToast('Đã sao chép nội dung log vào clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết Nhật ký Hoạt động"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Header Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 bg-slate-50/70 dark:bg-zinc-900/60 rounded-lg border border-slate-200 dark:border-zinc-800">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Thời gian
            </span>
            <p className="font-mono text-xs text-slate-800 dark:text-zinc-200 font-semibold truncate">
              {formattedDate}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Kết quả
            </span>
            <div>
              <StatusBadge
                status={log.result === 'SUCCESS'}
                activeText="Thành công"
                inactiveText={log.result || 'Thất bại'}
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Thời gian xử lý
            </span>
            <p className="font-mono text-xs text-slate-800 dark:text-zinc-200 font-semibold">
              {elapsedMs !== undefined ? `${elapsedMs} ms` : '—'}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Địa chỉ IP
            </span>
            <p className="font-mono text-xs text-slate-800 dark:text-zinc-200 font-semibold">
              {log.ip}
            </p>
          </div>
        </div>

        {/* Request & Module Info */}
        <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[11px] font-bold font-mono rounded border ${getMethodBadgeClass(log.action)}`}>
                {log.action}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-900 dark:text-zinc-100">
                {log.description || metadata.routeTemplate || '—'}
              </span>
            </div>

            {statusCode && (
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold font-mono ${
                statusCode >= 200 && statusCode < 300
                  ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}>
                HTTP {statusCode}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-[11px]">
            <div>
              <span className="text-slate-400 dark:text-zinc-500">Phân hệ (Module): </span>
              <strong className="text-slate-700 dark:text-zinc-300 font-semibold">{log.module}</strong>
            </div>
            <div>
              <span className="text-slate-400 dark:text-zinc-500">Loại tài nguyên: </span>
              <strong className="text-slate-700 dark:text-zinc-300 font-semibold">{log.resourceType}</strong>
            </div>
            {log.actorUserId && (
              <div>
                <span className="text-slate-400 dark:text-zinc-500">Mã người dùng (Actor ID): </span>
                <span className="font-mono text-slate-700 dark:text-zinc-300">{log.actorUserId}</span>
              </div>
            )}
            {log.apiFunctionId && (
              <div>
                <span className="text-slate-400 dark:text-zinc-500">Mã ApiFunction: </span>
                <span className="font-mono text-slate-700 dark:text-zinc-300">{log.apiFunctionId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Metadata JSON Payload */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Dữ liệu chi tiết (Metadata JSON)
            </span>
            <button
              type="button"
              onClick={handleCopyJson}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Đã sao chép' : 'Sao chép JSON'}</span>
            </button>
          </div>

          <pre className="p-3 bg-slate-900 text-emerald-400 dark:bg-zinc-950 dark:text-emerald-400 rounded-lg border border-slate-800 dark:border-zinc-800 text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
            {JSON.stringify(log.parsedMetadata && Object.keys(log.parsedMetadata).length > 0 ? log.parsedMetadata : log, null, 2)}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LogDetailModal;
