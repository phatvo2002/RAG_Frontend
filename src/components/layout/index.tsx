import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/sidebar';
import { ToastContainer } from '@/components/alert/Toast';
import { LoginPage } from '@/pages/auth/LoginPage';
import { Sparkles } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useApp();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center font-sans antialiased text-slate-800 dark:text-zinc-100 transition-colors">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/30 relative animate-pulse">
            <span>N</span>
            <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-blue-200 fill-blue-200" />
          </div>
          <div className="text-center">
            <h2 className="font-bold text-slate-900 dark:text-zinc-100 text-lg">NEXORA AI</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Đang xác thực phiên làm việc...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col font-sans antialiased text-slate-800 dark:text-zinc-100 transition-colors">
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-black overflow-hidden font-sans antialiased text-slate-800 dark:text-zinc-100 transition-colors">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50 dark:bg-black transition-colors">
        {children}
      </main>
      <ToastContainer />
    </div>
  );
};
export default AppLayout;
