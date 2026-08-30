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
    <header className="navbar min-h-14 h-14 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800/80 px-4 md:px-6 flex items-center justify-between shrink-0 select-none transition-colors">
      {/* Left: Sidebar Toggle + Title & Subtitle */}
      <div className="flex items-center gap-3">
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggleSidebar}
          className="btn btn-sm btn-ghost btn-square text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
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
              onClick={() => navigate({ to: '/admin/users' as any })}
              className="ml-2 btn btn-xs btn-primary btn-outline gap-1.5 font-semibold text-xs"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{t('buttons.goToDashboard', { defaultValue: 'Vào Dashboard Quản lý' })}</span>
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
              className="ml-2 btn btn-xs btn-ghost border border-slate-200 dark:border-zinc-700 gap-1.5 font-medium text-xs text-slate-700 dark:text-zinc-200"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('buttons.openAiChat', { defaultValue: 'Open AI Assistant' })}</span>
            </button>
          </div>
        )}
      </div>

      {/* Right Controls with DaisyUI Tooltips */}
      <div className="flex items-center gap-1">
        {/* Language Switcher Component (🇬🇧 EN / 🇻🇳 VI) */}
        <LanguageSwitcher />

        {/* Dark / Light Theme Toggle Button */}
        <div className="tooltip tooltip-bottom" data-tip={isDark ? t('common:theme.light', { defaultValue: 'Giao diện Sáng' }) : t('common:theme.dark', { defaultValue: 'Giao diện Tối' })}>
          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-ghost btn-square text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
            )}
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip={t('common:actions.pin', { defaultValue: 'Ghim phiên làm việc' })}>
          <button
            onClick={() => showToast(t('common:notifications.savedSuccess', { defaultValue: 'Pinned session' }), 'success')}
            className="btn btn-sm btn-ghost btn-square text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
          >
            <Pin className="w-4 h-4" />
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip={t('common:actions.refresh', { defaultValue: 'Làm mới dữ liệu' })}>
          <button
            onClick={() => showToast(t('common:actions.refresh', { defaultValue: 'Refreshing...' }), 'info')}
            className="btn btn-sm btn-ghost btn-square text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Thông báo hệ thống">
          <button
            onClick={() => showToast(t('common:notifications.noNew', { defaultValue: 'No new notifications' }), 'info')}
            className="btn btn-sm btn-ghost btn-square text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 relative"
          >
            <Bell className="w-4 h-4" />
            <span className="badge badge-xs badge-primary absolute top-2 right-2 p-0.5" />
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip={t('common:actions.options', { defaultValue: 'Tùy chọn khác' })}>
          <button
            onClick={() => showToast(t('common:actions.options', { defaultValue: 'Options' }), 'info')}
            className="btn btn-sm btn-ghost btn-square text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
export default Header;
