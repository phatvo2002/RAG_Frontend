import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  Home,
  Database,
  FolderKanban,
  CheckSquare,
  LayoutGrid,
  Calendar,
  Users2,
  Users,
  Building2,
  ShieldCheck,
  Clock,
  Layers,
  CalendarDays,
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  module?: string | string[];
  isImplemented?: boolean;
}

interface MenuGroup {
  id: string;
  title: string;
  icon: any;
  items: MenuItem[];
  defaultOpen?: boolean;
}

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useApp();
  const { hasModuleAccess, isSuperAdmin } = useUserPermissions();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { t } = useTranslation(['sidebar', 'common']);

  // Quản lý trạng thái đóng/mở của từng nhóm menu
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    operations: true,
    collaboration: true,
    admin: true,
  });

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // 1. Root Item: Tổng quan
  const rootOverviewItem: MenuItem = useMemo(() => ({
    id: 'overview',
    label: 'Tổng quan',
    path: '/admin',
    icon: Home,
    module: 'all',
    isImplemented: true,
  }), []);

  // 2. Danh mục các nhóm Menu theo thiết kế mới (media_1788333010410.png)
  const menuGroups: MenuGroup[] = useMemo(() => [
    {
      id: 'operations',
      title: 'Vận hành & dữ liệu',
      icon: Layers,
      items: [
        {
          id: 'knowledge',
          label: 'Kho tri thức',
          path: '/data-repo',
          icon: Database,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
        {
          id: 'projects',
          label: 'Dự án',
          path: '/projects',
          icon: FolderKanban,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
        {
          id: 'tasks',
          label: 'Công việc',
          path: '/tasks',
          icon: CheckSquare,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
        {
          id: 'reports',
          label: 'Báo cáo',
          path: '/reports',
          icon: LayoutGrid,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
      ],
    },
    {
      id: 'collaboration',
      title: 'Lịch & công tác',
      icon: CalendarDays,
      items: [
        {
          id: 'calendar',
          label: 'Lịch',
          path: '/calendar',
          icon: Calendar,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
        {
          id: 'meetings',
          label: 'Cuộc họp',
          path: '/meetings',
          icon: Users2,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
      ],
    },
    {
      id: 'admin',
      title: 'Quản trị hệ thống',
      icon: Users,
      items: [
        {
          id: 'users',
          label: 'Người dùng',
          path: '/admin/users',
          icon: Users,
          module: 'user',
          isImplemented: true, // Đã có Backend API GET /api/users
        },
        {
          id: 'departments',
          label: 'Phòng ban',
          path: '/admin/departments',
          icon: Building2,
          module: 'department',
          isImplemented: true, // Đã có Backend API GET /api/departments
        },
        {
          id: 'roles',
          label: 'Vai trò & Quyền',
          path: '/admin/roles',
          icon: ShieldCheck,
          module: ['role', 'authorization'],
          isImplemented: true, // Đã có Backend API GET /api/roles
        },
        {
          id: 'logs',
          label: 'Nhật ký hoạt động',
          path: '/admin/logs',
          icon: Clock,
          module: ['activitylog', 'activity_log', 'log', 'logs', 'audit'],
          isImplemented: true, // Đã có Backend API GET /api/activity-logs
        },
      ],
    },
  ], []);

  // Helper kiểm tra quyền và trạng thái implement của một item
  const isItemVisible = (item: MenuItem): boolean => {
    if (item.isImplemented === false) return false;
    if (isSuperAdmin) return true;
    if (!item.module || item.module === 'all') {
      return (
        hasModuleAccess('user') ||
        hasModuleAccess('department') ||
        hasModuleAccess(['role', 'authorization']) ||
        hasModuleAccess(['activitylog', 'activity_log', 'log', 'logs', 'audit'])
      );
    }
    return hasModuleAccess(item.module);
  };

  // Lọc danh sách menu hiển thị theo nghiệp vụ phân quyền
  const isRootOverviewVisible = isItemVisible(rootOverviewItem);

  const visibleGroups = useMemo(() => {
    return menuGroups
      .map((group) => {
        const visibleItems = group.items.filter(isItemVisible);
        return {
          ...group,
          items: visibleItems,
        };
      })
      .filter((group) => group.items.length > 0); // Ẩn hoàn toàn nhóm nếu không có item nào được cấp quyền
  }, [menuGroups, isSuperAdmin, hasModuleAccess]);

  // =========================================================================
  // 1. GIAO DIỆN KHI THU GỌN (COLLAPSED MINI SIDEBAR - w-16)
  // =========================================================================
  if (!isSidebarOpen) {
    return (
      <aside className="w-16 bg-[#040a17] border-r border-[#131d2e] flex flex-col h-screen shrink-0 select-none text-slate-300 font-sans transition-all duration-200">
        
        {/* 1. Header Mini: Logo N */}
        <div className="h-14 px-2 border-b border-[#131d2e] flex items-center justify-center shrink-0">
          <button
            onClick={() => navigate({ to: '/admin/users' as any })}
            className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs shadow-blue-500/30 cursor-pointer"
            title="NEXORA AI"
          >
            N
          </button>
        </div>

        {/* 2. Nút Mở Trợ lý AI (Icon Only) */}
        <div className="p-2 flex justify-center">
          <button
            onClick={() => navigate({ to: '/chat' as any })}
            className="w-10 h-10 bg-[#0d1524] hover:bg-[#142033] border border-[#1b2a42] rounded-lg text-slate-200 flex items-center justify-center shadow-xs transition-colors cursor-pointer group"
            title="Mở Trợ lý AI"
          >
            <MessageSquare className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* 3. Danh sách Icon Menu */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 text-xs custom-scrollbar flex flex-col items-center">
          
          {/* Mục đơn: Tổng quan */}
          {isRootOverviewVisible && (
            <button
              onClick={() => navigate({ to: rootOverviewItem.path as any })}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer relative ${
                currentPath === rootOverviewItem.path
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={rootOverviewItem.label}
            >
              <Home className="w-4 h-4" />
              {currentPath === rootOverviewItem.path && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute right-1 top-1 shadow-xs" />
              )}
            </button>
          )}

          {/* Các mục con được cấp quyền */}
          {visibleGroups.map((group) => (
            <div key={group.id} className="space-y-1.5 w-full flex flex-col items-center pt-1.5 border-t border-[#131d2e]/60">
              {group.items.map((item) => {
                const isActive = currentPath === item.path;
                const ItemIcon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate({ to: item.path as any })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer relative ${
                      isActive
                        ? 'bg-blue-600 text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={`${group.title}: ${item.label}`}
                  >
                    <ItemIcon className="w-4 h-4" />
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute right-1 top-1 shadow-xs" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}

        </div>

        {/* 4. Chân trang: Nút Mở rộng » */}
        <div className="p-2 border-t border-[#131d2e] flex justify-center">
          <button
            onClick={toggleSidebar}
            className="w-10 h-10 hover:bg-[#121c2d] rounded-lg text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Mở rộng menu"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

      </aside>
    );
  }

  // =========================================================================
  // 2. GIAO DIỆN KHI MỞ RỘNG (EXPANDED SIDEBAR - w-56)
  // =========================================================================
  return (
    <aside className="w-56 bg-[#040a17] border-r border-[#131d2e] flex flex-col h-screen shrink-0 select-none text-slate-300 font-sans transition-all duration-200">
      
      {/* 1. Header: Logo N + NEXORA AI + Nút thu gọn « */}
      <div className="h-14 px-4 border-b border-[#131d2e] flex items-center justify-between shrink-0">
        <div
          onClick={() => navigate({ to: '/admin/users' as any })}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-xs shadow-blue-500/30 shrink-0">
            N
          </div>
          <span className="font-bold text-white tracking-wide text-sm truncate">
            NEXORA AI
          </span>
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-[#121c2d] text-slate-400 hover:text-slate-200 rounded cursor-pointer transition-colors"
          title="Thu gọn menu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Nút Mở Trợ lý AI */}
      <div className="p-3 pb-1">
        <button
          onClick={() => navigate({ to: '/chat' as any })}
          className="w-full py-2 px-3 bg-[#0d1524] hover:bg-[#142033] border border-[#1b2a42] rounded-lg text-xs font-semibold text-slate-200 flex items-center justify-between shadow-xs transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>Mở Trợ lý AI</span>
          </div>
          <span className="text-[10px] text-slate-500 group-hover:text-slate-300">›</span>
        </button>
      </div>

      {/* 3. Danh sách Menu theo đúng mẫu thiết kế media_1788333010410.png */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 text-xs custom-scrollbar">
        
        {/* Mục đơn: Tổng quan */}
        {isRootOverviewVisible && (
          <div>
            <button
              onClick={() => navigate({ to: rootOverviewItem.path as any })}
              className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                currentPath === rootOverviewItem.path
                  ? 'bg-blue-600 text-white font-medium shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Home className={`w-4 h-4 shrink-0 ${currentPath === rootOverviewItem.path ? 'text-white' : 'text-slate-300'}`} />
                <span className="truncate">{rootOverviewItem.label}</span>
              </div>

              {currentPath === rootOverviewItem.path && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-xs" />
              )}
            </button>
          </div>
        )}

        {/* Các Nhóm Menu Dropdown (Vận hành & dữ liệu, Lịch & công tác, Quản trị hệ thống) */}
        {visibleGroups.map((group) => {
          const isOpen = openGroups[group.id] ?? true;
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="space-y-0.5 pt-0.5">
              {/* Tiêu đề nhóm có icon và mũi tên dropdown ⌄ */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon className="w-4 h-4 shrink-0 text-slate-300" />
                  <span className="truncate">{group.title}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {/* Danh sách các menu con được thụt lề vào */}
              {isOpen && (
                <div className="space-y-0.5 pl-3">
                  {group.items.map((item) => {
                    const isActive = currentPath === item.path;
                    const ItemIcon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate({ to: item.path as any })}
                        className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white font-medium shadow-xs'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <ItemIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 shadow-xs" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* 4. Chân trang: Nút Thu gọn */}
      <div className="p-3 border-t border-[#131d2e]">
        <button
          onClick={toggleSidebar}
          className="w-full py-1.5 px-3 hover:bg-[#121c2d] rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ChevronsLeft className="w-4 h-4" />
          <span>Thu gọn</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
