import React from 'react';
import { Modal } from './index';
import { AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận hành động',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: Trash2,
      iconBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400',
      btnClass: 'btn-error text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400',
      btnClass: 'btn-warning text-white',
    },
    info: {
      icon: Info,
      iconBg: 'bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400',
      btnClass: 'btn-primary text-white',
    },
    success: {
      icon: CheckCircle,
      iconBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400',
      btnClass: 'btn-success text-white',
    },
  }[type];

  const IconComponent = typeConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4 text-xs">
        <div className="flex items-start gap-3.5 pt-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeConfig.iconBg}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex-1 text-slate-700 dark:text-zinc-300 text-xs leading-relaxed pt-1 font-medium">
            {typeof message === 'string' ? <p>{message}</p> : message}
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-sm btn-ghost text-slate-700 dark:text-zinc-300 font-medium cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn btn-sm ${typeConfig.btnClass} font-semibold shadow-xs cursor-pointer gap-1.5`}
          >
            {isLoading && <span className="loading loading-spinner loading-xs" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
export default ConfirmModal;

