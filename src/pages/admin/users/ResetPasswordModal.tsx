import React, { useState } from 'react';
import { Modal } from '@/components/disclosure';
import { useResetPasswordMutation } from '@/api/users.api';
import { User } from '@/types';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccessToast: (msg: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccessToast,
}) => {
  const [newPassword, setNewPassword] = useState('Nexora@2026');
  const [confirmPassword, setConfirmPassword] = useState('Nexora@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPasswordMutation = useResetPasswordMutation();

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    resetPasswordMutation.mutate(
      {
        userId: user.id,
        data: { newPassword, confirmPassword },
      },
      {
        onSuccess: () => {
          onSuccessToast(`Đã đặt lại mật khẩu cho tài khoản ${user.name} thành công!`);
          onClose();
        },
        onError: (err: any) => {
          setError(err.message || 'Không thể đặt lại mật khẩu');
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đặt lại mật khẩu người dùng">
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-[11px]">
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-2xs shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {resetPasswordMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đặt lại'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default ResetPasswordModal;
