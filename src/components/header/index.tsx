import React from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { NavModule } from '@/types';
import { LanguageSwitcher } from '@/components/languageSwitcher';
import {
  Pin,
  Bell,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  Sun,
  Moon,
  LayoutDashboard,
  MessageSquare,
  Menu
} from 'lucide-react';

interface HeaderProps {
  title?: string;
  subTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subTitle }) => {
  const { activeModule, showToast, isDark, toggleTheme, toggleSidebar, isSidebarOpen } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation(['header', 'common']);

  const getModuleTitle = (mod: NavModule) => {
    return {
      title: t(`modules.${mod}.title` as any, { defaultValue: 'NEXORA AI' }),
      sub: t(`modules.${mod}.sub` as any, { defaultValue: '' }),
    };
  };

  const currentInfo = getModuleTitle(activeModule);

  return (
    <header className="h-14 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800/80 px-4 md:px-6 flex items-center justify-between shrink-0 select-none transition-colors">
      {/* Left: Sidebar Toggle + Title & Subtitle */}
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          title={isSidebarOpen ? t('common:actions.close', { defaultValue: 'Close sidebar' }) : t('common:actions.viewAll', { defaultValue: 'Open sidebar' })}
        >
          <Menu className="w-4 h-4" />
        </button>

        {activeModule === 'chat' ? (
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-900 dark:text-zinc-100 text-base">{currentInfo.title}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-zinc-500 cursor-pointer hover:text-slate-600 dark:hover:text-zinc-300" />
            
            {/* Quick Switch to Dashboard */}
            <button
              onClick={() => navigate({ to: '/dashboard' as any })}
              className="ml-2 px-2.5 py-1 bg-blue-50 dark:bg-zinc-800/90 hover:bg-blue-100 dark:hover:bg-zinc-700 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-zinc-700/80 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('buttons.goToDashboard', { defaultValue: 'Dashboard' })}</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-zinc-100 leading-none">
                {title || currentInfo.title}
              </h1>
              {(subTitle || currentInfo.sub) && (
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-normal mt-0.5">
                  {subTitle || currentInfo.sub}
                </p>
              )}
            </div>

            {/* Quick Switch back to Chat */}
            <button
              onClick={() => navigate({ to: '/chat' as any })}
              className="ml-2 px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700 rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('buttons.openAiChat', { defaultValue: 'Open AI Assistant' })}</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Language Switcher Component (🇬🇧 EN / 🇻🇳 VI) */}
        <LanguageSwitcher />

        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title={isDark ? t('common:theme.light', { defaultValue: 'Light Mode' }) : t('common:theme.dark', { defaultValue: 'Dark Mode' })}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        <button
          onClick={() => showToast(t('common:notifications.savedSuccess', { defaultValue: 'Pinned session' }), 'success')}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title={t('common:actions.pin', { defaultValue: 'Pin Session' })}
        >
          <Pin className="w-4 h-4" />
        </button>

        <button
          onClick={() => showToast(t('common:actions.refresh', { defaultValue: 'Refreshing...' }), 'info')}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title={t('common:actions.refresh', { defaultValue: 'Refresh' })}
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => showToast(t('common:notifications.noNew', { defaultValue: 'No new notifications' }), 'info')}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors relative cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
        </button>

        <button
          onClick={() => showToast(t('common:actions.options', { defaultValue: 'Options' }), 'info')}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title={t('common:actions.options', { defaultValue: 'Options' })}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
export default Header;
