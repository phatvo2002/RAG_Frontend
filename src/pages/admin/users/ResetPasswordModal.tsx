import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Modal } from '@/components/disclosure';
import { User, resetPasswordYupSchema, ResetPasswordFormData } from '@/types';
import { useResetPasswordMutation } from '@/api/users.api';
import { Lock, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';

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
  const { language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const resetMutation = useResetPasswordMutation();

  const form = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    } as ResetPasswordFormData,
    validators: {
      onSubmit: ({ value }) => {
        try {
          resetPasswordYupSchema.validateSync(value, { abortEarly: false });
          return undefined;
        } catch (err: any) {
          return err.message || tr('Invalid password', 'Dữ liệu mật khẩu không hợp lệ');
        }
      },
    },
    onSubmit: async ({ value }) => {
      if (!user) return;
      setServerError(null);

      resetMutation.mutate(
        {
          userId: user.id,
          data: { newPassword: value.newPassword },
        },
        {
          onSuccess: () => {
            onSuccessToast(tr(`Password reset for ${user.name}.`, `Đã đặt lại mật khẩu cho tài khoản ${user.name} thành công!`));
            form.reset();
            onClose();
          },
          onError: (err: any) => {
            setServerError(err.message || tr('Could not reset password', 'Không thể đặt lại mật khẩu'));
          },
        }
      );
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      setShowPassword(false);
      setServerError(null);
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tr(`Reset password: ${user.name}`, `Đặt lại mật khẩu: ${user.name}`)}
      maxWidth="sm"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-3.5 text-xs"
      >
        <div className="p-3 bg-amber-50 dark:bg-zinc-800/80 border border-amber-200 dark:border-zinc-700 rounded-box text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
          <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            {tr('You are resetting the password for', 'Bạn đang đặt lại mật khẩu cho tài khoản')} <strong>{user.email}</strong>. {tr('The old password will no longer work.', 'Sau khi hoàn tất, mật khẩu cũ sẽ bị vô hiệu hóa.')}
          </span>
        </div>

        {serverError && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-box text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Field: newPassword */}
        <form.Field
          name="newPassword"
          validators={{
            onChange: ({ value }) =>
              !value
                ? tr('Enter a new password', 'Vui lòng nhập mật khẩu mới')
                : value.length < 6
                ? tr('Password must have at least 6 characters', 'Mật khẩu phải có ít nhất 6 ký tự')
                : undefined,
          }}
        >
          {(field) => {
            const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
            const hasError = Boolean(errorMessage);

            return (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {tr('New password', 'Mật khẩu mới')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={tr('Enter at least 6 characters', 'Nhập tối thiểu 6 ký tự')}
                    className={`input input-bordered input-sm w-full pl-9 pr-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                      hasError ? 'input-error' : ''
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
                {hasError && (
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>

        {/* Field: confirmPassword */}
        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ['newPassword'],
            onChange: ({ value, fieldApi }) => {
              if (!value) return tr('Confirm the new password', 'Vui lòng xác nhận lại mật khẩu mới');
              if (value !== fieldApi.form.getFieldValue('newPassword')) {
                return tr('Passwords do not match', 'Mật khẩu xác nhận không khớp');
              }
              return undefined;
            },
          }}
        >
          {(field) => {
            const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
            const hasError = Boolean(errorMessage);

            return (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {tr('Confirm new password', 'Xác nhận mật khẩu mới')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={tr('Re-enter the new password', 'Nhập lại mật khẩu mới')}
                    className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                      hasError ? 'input-error' : ''
                    }`}
                  />
                  <Lock className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
                </div>
                {hasError && (
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost text-slate-700 dark:text-zinc-300 font-medium"
          >
            {tr('Cancel', 'Hủy')}
          </button>
          <button
            type="submit"
            disabled={resetMutation.isPending}
            className="btn btn-sm btn-primary text-white font-medium shadow-xs"
          >
            {resetMutation.isPending && (
              <span className="loading loading-spinner loading-xs" />
            )}
            <span>{tr('Reset password', 'Xác nhận đổi mật khẩu')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;
