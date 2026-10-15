import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Menu,
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
  const { currentUser, logout, isDark, toggleTheme, showToast, isMobileSidebarOpen, toggleMobileSidebar } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation(['header', 'common']);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const displayName = currentUser?.name || currentUser?.displayName || currentUser?.userName || 'Admin';
  const roleName = currentUser?.roles?.[0]?.roleName || currentUser?.role || 'SuperAdmin';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="h-[60px] bg-white dark:bg-[#090e1a] border-b border-[var(--nexora-border)] dark:border-[#172033] px-3 sm:px-4 lg:px-6 flex items-center justify-between shrink-0 select-none transition-colors">

      {/* 1. Left: Workspace Switcher Dropdown matching 01-executive-dashboard.png */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-[#121929] transition-colors cursor-pointer"
          title={isMobileSidebarOpen ? t('closeMenu') : t('openMenu')}
          aria-label={isMobileSidebarOpen ? t('closeMenu') : t('openMenu')}
          aria-expanded={isMobileSidebarOpen}
        >
          <Menu className="w-[18px] h-[18px]" />
        </button>
        <div className="cursor-pointer group">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-zinc-100 text-xs hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap">
            <span>NEXORA Workbench</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200 transition-transform" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
            {t('company')}
          </p>
        </div>
      </div>

      {/* 2. Center: Global Search Bar with ⌘ K matching 01-executive-dashboard.png */}
      <div className="flex-1 max-w-lg mx-4 lg:mx-8 hidden sm:block">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && globalSearch.trim()) {
                showToast(t('searchNotice', { query: globalSearch }), 'info');
              }
            }}
            className="w-full pl-8 pr-12 py-2 bg-[var(--nexora-surface-muted)] dark:bg-[#121929] border border-[var(--nexora-border)] dark:border-[#1d293d] rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          />
          <kbd className="absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-400 dark:text-zinc-500 bg-white dark:bg-[#182238] border border-slate-200 dark:border-zinc-700 rounded shadow-2xs">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* 3. Right: Status Icons & Profile Avatar matching 01-executive-dashboard.png */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 shrink-0">

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121929] transition-colors cursor-pointer"
          title={isDark ? t('common:theme.light') : t('common:theme.dark')}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell with Badge 3 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => showToast(t('unreadNotifications', { count: 3 }), 'info')}
            className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121929] transition-colors cursor-pointer relative"
            title={t('notifications')}
          >
            <Bell className="w-4 h-4" />
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center absolute -top-0.5 -right-0.5 shadow-xs">
              3
            </span>
          </button>
        </div>

        {/* Help Icon */}
        <button
          onClick={() => showToast(t('helpNotice'), 'info')}
          className="p-1.5 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-100 rounded-lg hover:bg-slate-100 dark:hover:bg-[#121929] transition-colors cursor-pointer"
          title={t('help')}
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Profile Avatar & Info Dropdown */}
        <div ref={profileDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
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
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-50 p-1.5 shadow-xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-[#1d293d] rounded-xl w-48 text-xs text-slate-700 dark:text-zinc-200 space-y-0.5 animate-in fade-in-50 zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-zinc-800 font-medium">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('account')}</span>
                <span className="font-bold text-slate-900 dark:text-zinc-100">{displayName}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate({ to: '/account' });
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors text-left"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('manageAccount')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-semibold transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('signOut')}</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

export default Header;
