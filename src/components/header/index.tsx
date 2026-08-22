import React from 'react';
import { useApp } from '@/context/AppContext';
import { NavModule } from '@/types';
import { Pin, Bell, RefreshCw, MoreHorizontal, ChevronDown, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subTitle }) => {
  const { activeModule, showToast, isDark, toggleTheme } = useApp();

  const moduleTitles: Record<NavModule, { title: string; sub?: string }> = {
    chat: { title: 'Trợ lý AI NEXORA', sub: 'Trợ lý thông minh hỗ trợ công việc' },
    dashboard: { title: 'Dashboard Quản Lý', sub: 'Trung tâm điều hành tổng quan và phân hệ quản lý' },
    'data-repo': { title: 'Kho dữ liệu', sub: 'Quản lý tài liệu và thư mục doanh nghiệp' },
    meetings: { title: 'Phòng họp', sub: 'Lịch họp và biên bản tự động' },
    projects: { title: 'Dự án', sub: 'Quản lý tiến độ và thành viên dự án' },
    tasks: { title: 'Công việc', sub: 'Bảng theo dõi công việc Kanban' },
    calendar: { title: 'Lịch', sub: 'Lịch biểu làm việc và sự kiện' },
    reports: { title: 'Báo cáo', sub: 'Thống kê hiệu suất và báo cáo tổng hợp' },
    admin: { title: 'Quản trị', sub: 'Cấu hình hệ thống và phân quyền' },
  };

  const currentInfo = moduleTitles[activeModule] || { title: title || 'NEXORA AI', sub: subTitle || '' };

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 px-6 flex items-center justify-between shrink-0 select-none transition-colors">
      {/* Title & Subtitle or Breadcrumb */}
      <div className="flex items-center gap-3">
        {activeModule === 'chat' ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base">{currentInfo.title}</span>
            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" />
          </div>
        ) : (
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">
              {title || currentInfo.title}
            </h1>
            {currentInfo.sub && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                {subTitle || currentInfo.sub}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5">
        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        <button
          onClick={() => showToast('Đã ghim phiên làm việc hiện tại', 'success')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Ghim phiên làm việc"
        >
          <Pin className="w-4 h-4" />
        </button>

        <button
          onClick={() => showToast('Đang làm mới dữ liệu...', 'info')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => showToast('Không có thông báo mới', 'info')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors relative cursor-pointer"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
        </button>

        <button
          onClick={() => showToast('Menu tùy chọn', 'info')}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          title="Tùy chọn khác"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
export default Header;
