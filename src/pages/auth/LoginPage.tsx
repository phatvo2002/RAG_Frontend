import React, { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { loginYupSchema, LoginFormData } from '@/types';
import { useApp } from '@/context/AppContext';
import { useLoginMutation } from '@/api/auth.api';
import { useNavigate } from '@tanstack/react-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setCurrentUser, setIsAuthenticated, showToast } = useApp();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginMutation = useLoginMutation();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    } as LoginFormData,
    validators: {
      onSubmit: ({ value }) => {
        try {
          loginYupSchema.validateSync(value, { abortEarly: false });
          return undefined;
        } catch (err: any) {
          return err.message || 'Dữ liệu không hợp lệ';
        }
      },
    },
    onSubmit: async ({ value }) => {
      setServerError(null);

      loginMutation.mutate(
        {
          email: value.email,
          username: value.email,
          password: value.password,
        },
        {
          onSuccess: (result) => {
            setCurrentUser(result.user);
            setIsAuthenticated(true);
            navigate({ to: '/chat' as any });
            showToast(`Đăng nhập thành công! Chào mừng trở lại ${result.user.name}`, 'success');
          },
          onError: (error: any) => {
            const msg = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin tài khoản.';
            setServerError(msg);
            showToast(msg, 'error');
          },
        }
      );
    },
  });

  const handleMicrosoftLogin = () => {
    showToast('Tính năng đăng nhập Single Sign-On (SSO) Microsoft đang được thiết lập', 'info');
  };

  const isSubmitting = loginMutation.isPending;

  return (
    <div className="nexora-login min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-[#ebf3ff] via-[#f7faff] to-[#e4efff] dark:from-[#0a0f1d] dark:via-[#070b14] dark:to-[#04060b] relative overflow-hidden transition-colors selection:bg-blue-500 selection:text-white">
      {/* Dynamic Background Light Waves & Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle radial ambient glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[650px] h-[650px] bg-blue-300/25 dark:bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[700px] h-[700px] bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-3xl" />
        
        {/* Flowing Wave Curves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 dark:opacity-20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <path
            d="M-100,450 C320,300 450,700 900,400 C1250,150 1400,500 1600,350"
            fill="none"
            stroke="url(#waveGrad1)"
            strokeWidth="1.8"
            strokeDasharray="5 7"
          />
          <path
            d="M-50,250 C280,100 550,550 1000,280 C1300,100 1450,450 1650,200"
            fill="none"
            stroke="url(#waveGrad2)"
            strokeWidth="1.2"
          />
          <path
            d="M0,600 C400,450 700,800 1150,500 C1380,320 1520,620 1700,480"
            fill="none"
            stroke="url(#waveGrad3)"
            strokeWidth="1.4"
          />
          <defs>
            <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#93c5fd" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="waveGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Soft glowing ambient light points */}
        <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-blue-400 rounded-full blur-[1px] opacity-70 animate-pulse" />
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-blue-300 rounded-full blur-[1px] opacity-60 animate-pulse" />
        <div className="absolute top-1/2 right-1/6 w-2.5 h-2.5 bg-indigo-300 rounded-full blur-[1px] opacity-50" />
      </div>

      {/* Main Login Card - Exact Match with 03-login-nexora-ai.png */}
      <div className="w-full max-w-[460px] bg-white dark:bg-zinc-900 rounded-[28px] p-8 sm:p-10 shadow-[0_20px_60px_rgba(28,78,173,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-slate-100/90 dark:border-zinc-800 relative z-10 animate-in fade-in zoom-in-95 duration-200 transition-all">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-7">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-9 h-9" viewBox="0 0 44 44" fill="none">
              <path
                d="M12 34V10L32 34V10"
                stroke="url(#brand-blue-grad)"
                strokeWidth="6.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="brand-blue-grad" x1="12" y1="10" x2="32" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
            {/* Sparkle Star */}
            <div className="absolute -top-0.5 -right-0.5 text-indigo-500 dark:text-indigo-400">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-tight">
              NEXORA AI
            </h2>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
              Trợ lý AI nội bộ
            </p>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="mb-6 text-left">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Chào mừng trở lại
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Đăng nhập để tiếp tục sử dụng NEXORA AI
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 animate-in fade-in flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <span className="leading-relaxed">{serverError}</span>
          </div>
        )}

        {/* Form Powered by TanStack Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          {/* Field: Email */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => (!value ? 'Vui lòng nhập email hoặc tên đăng nhập' : undefined),
            }}
          >
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1.5">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Nhập email"
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-white dark:bg-zinc-800/60 border rounded-xl text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none transition-all ${
                        hasError
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                          : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                      }`}
                      disabled={isSubmitting}
                    />
                    <Mail className={`w-4 h-4 absolute left-3 pointer-events-none ${hasError ? 'text-rose-400' : 'text-slate-400 dark:text-zinc-400'}`} />
                  </div>
                  {hasError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 pl-0.5">
                      {errorMessage}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Field: Password */}
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Vui lòng nhập mật khẩu'
                  : value.length < 6
                  ? 'Mật khẩu phải có ít nhất 6 ký tự'
                  : undefined,
            }}
          >
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => showToast('Vui lòng liên hệ quản trị viên IT để đặt lại mật khẩu', 'info')}
                      className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline p-0 cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      className={`w-full pl-9 pr-9 py-2.5 bg-white dark:bg-zinc-800/60 border rounded-xl text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none transition-all ${
                        hasError
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-rose-50/20'
                          : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
                      }`}
                      disabled={isSubmitting}
                    />
                    <Lock className={`w-4 h-4 absolute left-3 pointer-events-none ${hasError ? 'text-rose-400' : 'text-slate-400 dark:text-zinc-400'}`} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
                      disabled={isSubmitting}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {hasError && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1 pl-0.5">
                      {errorMessage}
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          {/* Primary CTA Submit Button: "Đăng nhập ->" */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-xs rounded-xl shadow-xs shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-5"
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Secondary Microsoft SSO Button */}
        <button
          type="button"
          onClick={handleMicrosoftLogin}
          className="w-full py-2.5 bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-medium text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer mt-3 shadow-2xs"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          <span>Đăng nhập bằng Microsoft</span>
        </button>

        {/* Footer Disclaimer / Terms of Service */}
        <div className="text-center mt-7 text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
          Bằng việc đăng nhập, bạn đồng ý với{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              showToast('Điều khoản bảo mật NEXORA AI', 'info');
            }}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            điều khoản bảo mật
          </a>
          <br />
          và{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              showToast('Chính sách xử lý dữ liệu NEXORA AI', 'info');
            }}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            xử lý dữ liệu
          </a>
          .
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
