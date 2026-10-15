import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const NotFoundPage: React.FC = () => {
  const { language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center p-6 space-y-4 bg-slate-50/50 dark:bg-black transition-colors select-none">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 flex items-center justify-center shadow-2xs">
        <ShieldAlert className="w-7 h-7 text-slate-600 dark:text-zinc-300" />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
          404 — {tr('Page not found or access denied', 'Không tìm thấy trang hoặc không có quyền truy cập')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
          {tr('This page does not exist, has not been implemented, or your account does not have permission to access it.', 'Trang bạn đang cố gắng truy cập không tồn tại, chưa được triển khai hoặc tài khoản của bạn chưa được phân quyền trong phân hệ này.')}
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-medium rounded-md shadow-2xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{tr('Back to main page', 'Quay lại trang chính')}</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
