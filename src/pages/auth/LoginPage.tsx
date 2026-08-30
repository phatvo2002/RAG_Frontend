import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginYupSchema, LoginFormData } from '@/types';
import { useApp } from '@/context/AppContext';
import { useLoginMutation } from '@/api/auth.api';
import { useNavigate } from '@tanstack/react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setCurrentUser, setIsAuthenticated, showToast } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginYupSchema) as any,
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    loginMutation.mutate(
      {
        email: data.email,
        username: data.email,
        password: data.password,
      },
      {
        onSuccess: (result) => {
          setCurrentUser(result.user);
          setIsAuthenticated(true);
          navigate({ to: '/chat' as any });
          showToast(`Đăng nhập thành công! Chào mừng trở lại ${result.user.name}`);
        },
        onError: (error: any) => {
          const msg = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin tài khoản.';
          setServerError(msg);
          showToast(msg, 'error');
        },
      }
    );
  };

  const handleMicrosoftLogin = () => {
    showToast('Tính năng đăng nhập Single Sign-On (SSO) Microsoft đang được thiết lập', 'info');
  };

  const isSubmitting = loginMutation.isPending;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-black relative overflow-hidden transition-colors">
      {/* Decorative Wave Graphics */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1440 900" fill="none">
          <path d="M-100 200 C300 100 600 400 1500 200 C1800 100 2000 300 2200 400" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6 6" />
          <path d="M-100 400 C400 300 800 600 1600 300" stroke="#60a5fa" strokeWidth="1" />
          <path d="M200 -100 C500 300 900 200 1500 800" stroke="#93c5fd" strokeWidth="1" />
        </svg>
      </div>

      <div className="card w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200 transition-colors">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-xs shadow-blue-500/30 relative mb-2.5">
            <span>N</span>
            <Sparkles className="w-3.5 h-3.5 absolute -top-1 -right-1 text-blue-200 fill-blue-200" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">NEXORA AI</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">Trợ lý AI nội bộ</p>
        </div>

        {/* Title */}
        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100">Chào mừng trở lại</h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Đăng nhập để tiếp tục sử dụng hệ thống
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-box text-xs text-rose-700 dark:text-rose-300 animate-in fade-in flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Email hoặc Tên đăng nhập
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                {...register('email')}
                placeholder="email@congty.vn hoặc username"
                className={`input input-bordered input-sm w-full pl-10 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                  errors.email ? 'input-error' : ''
                }`}
                disabled={isSubmitting}
              />
              <Mail className={`w-4 h-4 absolute left-3.5 pointer-events-none z-10 ${errors.email ? 'text-rose-400' : 'text-slate-400 dark:text-zinc-400'}`} />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => showToast('Vui lòng liên hệ quản trị viên IT để đặt lại mật khẩu', 'info')}
                className="btn btn-link btn-xs text-blue-600 dark:text-blue-400 p-0 font-medium no-underline hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                className={`input input-bordered input-sm w-full pl-10 pr-10 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                  errors.password ? 'input-error' : ''
                }`}
                disabled={isSubmitting}
              />
              <Lock className={`w-4 h-4 absolute left-3.5 pointer-events-none z-10 ${errors.password ? 'text-rose-400' : 'text-slate-400 dark:text-zinc-400'}`} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer z-10"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 pl-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-sm btn-primary w-full text-white text-xs font-semibold shadow-xs mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs" />
                <span>Đang xác thực...</span>
              </span>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-3">
          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={isSubmitting}
            className="btn btn-sm btn-outline border-slate-200 dark:border-zinc-700 w-full text-slate-700 dark:text-zinc-200 text-xs font-medium"
          >
            {/* Microsoft 4-square Logo */}
            <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
              <div className="bg-[#f25022] w-1.5 h-1.5" />
              <div className="bg-[#7fba00] w-1.5 h-1.5" />
              <div className="bg-[#00a4ef] w-1.5 h-1.5" />
              <div className="bg-[#ffb900] w-1.5 h-1.5" />
            </div>
            <span>Đăng nhập bằng Microsoft</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 dark:text-zinc-500 text-center mt-5 leading-relaxed">
          Bằng việc đăng nhập, bạn đồng ý với{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            điều khoản bảo mật
          </a>{' '}
          và{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
            xử lý dữ liệu
          </a>
          .
        </p>
      </div>
    </div>
  );
};
export default LoginPage;
