import React, { useState } from 'react';
import { Modal } from '@/components/disclosure';
import { User } from '@/types';
import { useResetPasswordMutation } from '@/api/users.api';
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetMutation = useResetPasswordMutation();

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không trùng khớp');
      return;
    }

    resetMutation.mutate(
      {
        userId: user.id,
        data: { newPassword },
      },
      {
        onSuccess: () => {
          onSuccessToast(`Đã đặt lại mật khẩu cho tài khoản ${user.name} thành công!`);
          setNewPassword('');
          setConfirmPassword('');
          onClose();
        },
        onError: (err: any) => {
          setError(err.message || 'Không thể đặt lại mật khẩu');
        },
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Đặt lại mật khẩu: ${user.name}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="p-3 bg-amber-50 dark:bg-zinc-800/80 border border-amber-200 dark:border-zinc-700 rounded text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
          <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Bạn đang đặt lại mật khẩu cho tài khoản <strong>{user.email}</strong>. Sau khi hoàn tất, mật khẩu cũ sẽ bị vô hiệu hóa.
          </span>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300 text-[11px]">
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
            Mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập tối thiểu 6 ký tự"
              className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
            Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs"
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium rounded cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-2xs shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {resetMutation.isPending && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>Xác nhận đổi mật khẩu</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default ResetPasswordModal;
