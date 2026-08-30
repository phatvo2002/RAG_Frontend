import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/disclosure';
import { User, resetPasswordYupSchema, ResetPasswordFormData } from '@/types';
import { useResetPasswordMutation } from '@/api/users.api';
import { Lock, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  const resetMutation = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordYupSchema) as any,
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        newPassword: '',
        confirmPassword: '',
      });
      setShowPassword(false);
    }
  }, [isOpen, reset]);

  if (!isOpen || !user) return null;

  const onSubmit = (data: ResetPasswordFormData) => {
    resetMutation.mutate(
      {
        userId: user.id,
        data: { newPassword: data.newPassword },
      },
      {
        onSuccess: () => {
          onSuccessToast(`Đã đặt lại mật khẩu cho tài khoản ${user.name} thành công!`);
          reset();
          onClose();
        },
        onError: (err: any) => {
          setError('root', { message: err.message || 'Không thể đặt lại mật khẩu' });
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
        <div className="p-3 bg-amber-50 dark:bg-zinc-800/80 border border-amber-200 dark:border-zinc-700 rounded-box text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
          <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            Bạn đang đặt lại mật khẩu cho tài khoản <strong>{user.email}</strong>. Sau khi hoàn tất, mật khẩu cũ sẽ bị vô hiệu hóa.
          </span>
        </div>

        {errors.root && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-box text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('newPassword')}
              placeholder="Nhập tối thiểu 6 ký tự"
              className={`input input-bordered input-sm w-full pl-9 pr-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                errors.newPassword ? 'input-error' : ''
              }`}
            />
            <Lock className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer z-10"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.newPassword.message}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="Nhập lại mật khẩu mới"
              className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                errors.confirmPassword ? 'input-error' : ''
              }`}
            />
            <Lock className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.confirmPassword.message}</span>
            </p>
          )}
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost text-slate-700 dark:text-zinc-300 font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="btn btn-sm btn-primary text-white font-medium shadow-xs"
          >
            {resetMutation.isPending && (
              <span className="loading loading-spinner loading-xs" />
            )}
            <span>Xác nhận đổi mật khẩu</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default ResetPasswordModal;
