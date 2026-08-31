import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { LanguageSwitcher } from '@/components/languageSwitcher';

export const Header: React.FC = () => {
  const { currentUser, logout, isDark, toggleTheme, showToast } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation(['header', 'common']);
  const [globalSearch, setGlobalSearch] = useState('');

  const displayName = currentUser?.name || currentUser?.displayName || currentUser?.userName || 'Admin';
  const roleName = currentUser?.roles?.[0]?.roleName || currentUser?.role || 'SuperAdmin';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="h-14 bg-white dark:bg-[#090e1a] border-b border-slate-200 dark:border-[#172033] px-4 md:px-6 flex items-center justify-between shrink-0 select-none transition-colors">
      
      {/* 1. Left: Workspace Switcher Dropdown matching 01-executive-dashboard.png */}
      <div className="flex items-center gap-3">
        <div className="cursor-pointer group">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <span>NEXORA Workbench</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
            Công ty Cổ phần Nexora
          </p>
        </div>
      </div>

      {/* 2. Center: Global Search Bar with ⌘ K matching 01-executive-dashboard.png */}
      <div className="flex-1 max-w-md mx-6 hidden sm:block">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm hoặc gõ lệnh..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && globalSearch.trim()) {
                showToast(`Tìm kiếm: "${globalSearch}"`, 'info');
              }
            }}
            className="w-full pl-8 pr-12 py-1.5 bg-slate-50/80 dark:bg-[#121929] border border-slate-200 dark:border-[#1d293d] rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 dark:text-zinc-500 bg-white dark:bg-[#182238] border border-slate-200 dark:border-zinc-700 rounded shadow-2xs">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* 3. Right: Notifications (bell badge 3), Help, Profile Avatar */}
      <div className="flex items-center gap-3">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121929] transition-colors cursor-pointer"
          title={isDark ? 'Giao diện sáng' : 'Giao diện tối'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications with red count 3 */}
        <div className="relative">
          <button
            onClick={() => showToast('Bạn có 3 thông báo mới chưa đọc', 'info')}
            className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121929] transition-colors cursor-pointer relative"
            title="Thông báo"
          >
            <Bell className="w-4 h-4" />
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center absolute -top-0.5 -right-0.5 shadow-xs">
              3
            </span>
          </button>
        </div>

        {/* Help Icon */}
        <button
          onClick={() => showToast('Mở tài liệu hướng dẫn sử dụng NEXORA AI', 'info')}
          className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121929] transition-colors cursor-pointer"
          title="Trợ giúp"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Profile Avatar & Info Dropdown */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121929] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 block leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block leading-none">
                {roleName}
              </span>
            </div>
          </div>

          <ul
            tabIndex={0}
            className="dropdown-content z-30 menu p-1.5 shadow-lg bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-[#1d293d] rounded-xl w-48 text-xs text-slate-700 dark:text-zinc-200 mt-1 space-y-0.5"
          >
            <li className="px-2.5 py-1.5 border-b border-slate-100 dark:border-zinc-800 font-medium">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Tài khoản</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100">{displayName}</span>
            </li>
            <li>
              <button
                onClick={() => navigate({ to: '/admin/users' as any })}
                className="flex items-center gap-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Quản lý tài khoản</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </li>
          </ul>
        </div>

      </div>

    </header>
  );
};

export default Header;
