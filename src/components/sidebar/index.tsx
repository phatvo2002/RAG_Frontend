import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import {
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  Home,
  Database,
  Folder,
  LayoutGrid,
  Calendar,
  Users,
  Building2,
  ShieldCheck,
  Shield,
  Settings,
  LayoutDashboard,
  Clock,
  Layers,
  FileBarChart,
  CalendarClock,
  Sparkles,
  User as UserIcon,
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
  const {
    isSidebarOpen,
    toggleSidebar,
    currentUser,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useApp();
  const { hasModuleAccess, isSuperAdmin, isLoading } = useUserPermissions();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Thông tin user hiển thị ở User Card footer
  const displayName = currentUser?.name || currentUser?.displayName || currentUser?.userName || 'Phat';
  const roleName = currentUser?.roles?.[0]?.roleName || currentUser?.role || 'Nhân viên';
  const initials = displayName.slice(0, 2).toUpperCase();

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

  const defaultHomePath = useMemo(() => {
    if (isSuperAdmin || hasModuleAccess(['user', 'users'])) return '/admin/users';
    if (hasModuleAccess('dashboard')) return '/dashboard';
    if (hasModuleAccess(['chat', 'ai'])) return '/chat';
    if (hasModuleAccess(['document', 'documents', 'data-repo'])) return '/data-repo';
    if (hasModuleAccess(['project', 'projects', 'proj'])) return '/projects';
    if (hasModuleAccess(['task', 'tasks'])) return '/tasks';
    if (hasModuleAccess([
      'department', 'departments', 'dept',
      'role', 'roles', 'authorization', 'permission', 'permissions',
      'activitylog', 'activity_log', 'log', 'logs', 'audit',
      'policy', 'policies',
      'config', 'configuration', 'system',
    ])) return '/admin';
    return '/chat';
  }, [hasModuleAccess, isSuperAdmin]);

  // 1. Root Item: Tổng quan
  const rootOverviewItem: MenuItem = useMemo(() => ({
    id: 'overview',
    label: 'Tổng quan',
    path: '/admin',
    icon: Home,
    module: 'all',
    isImplemented: true,
  }), []);

  // 2. Danh mục các nhóm Menu theo thiết kế nexora-workbench-v3
  const menuGroups: MenuGroup[] = useMemo(() => [
    {
      id: 'operations',
      title: 'Vận hành & dữ liệu',
      icon: Layers,
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Tổng quan',
          path: '/dashboard',
          icon: LayoutDashboard,
          module: 'dashboard',
          isImplemented: true,
        },
        {
          id: 'knowledge',
          label: 'Kho tri thức',
          path: '/data-repo',
          icon: Database,
          module: ['document', 'documents', 'data-repo'],
          isImplemented: true,
        },
        {
          id: 'projects',
          label: 'Dự án',
          path: '/projects',
          icon: Folder,
          module: ['project', 'projects', 'proj'],
          isImplemented: true,
        },
        {
          id: 'tasks',
          label: 'Công việc',
          path: '/tasks',
          icon: LayoutGrid,
          module: ['task', 'tasks'],
          isImplemented: true,
        },
        {
          id: 'reports',
          label: 'Báo cáo',
          path: '/reports',
          icon: FileBarChart,
          module: ['report', 'reports', 'rep'],
          isImplemented: true,
        },
      ],
    },
    {
      id: 'collaboration',
      title: 'Lịch & công tác',
      icon: Calendar,
      items: [
        {
          id: 'calendar',
          label: 'Lịch',
          path: '/calendar',
          icon: Calendar,
          module: ['calendar', 'cal'],
          isImplemented: true,
        },
        {
          id: 'meetings',
          label: 'Cuộc họp',
          path: '/meetings',
          icon: CalendarClock,
          module: ['meeting', 'meetings', 'meet'],
          isImplemented: true,
        },
      ],
    },
    {
      id: 'admin',
      title: 'Quản trị hệ thống',
      icon: ShieldCheck,
      items: [
        {
          id: 'users',
          label: 'Người dùng',
          path: '/admin/users',
          icon: UserIcon,
          module: 'user',
          isImplemented: true,
        },
        {
          id: 'departments',
          label: 'Phòng ban',
          path: '/admin/departments',
          icon: Building2,
          module: 'department',
          isImplemented: true,
        },
        {
          id: 'roles',
          label: 'Vai trò & Quyền',
          path: '/admin/roles',
          icon: ShieldCheck,
          module: ['role', 'authorization'],
          isImplemented: true,
        },
        {
          id: 'logs',
          label: 'Nhật ký hoạt động',
          path: '/admin/logs',
          icon: Clock,
          module: ['activitylog', 'activity_log', 'log', 'logs', 'audit'],
          isImplemented: true,
        },
        {
          id: 'policies',
          label: 'Chính sách dữ liệu',
          path: '/admin/policies',
          icon: Shield,
          module: ['policy', 'policies'],
          isImplemented: true,
        },
        {
          id: 'config',
          label: 'Cấu hình hệ thống',
          path: '/admin/config',
          icon: Settings,
          module: ['config', 'configuration', 'system'],
          isImplemented: true,
        },
      ],
    },
  ], []);

  // Helper kiểm tra quyền của một item
  const isItemVisible = (item: MenuItem): boolean => {
    if (isLoading || !item.isImplemented) return false;
    if (isSuperAdmin) return true;
    if (item.path === '/admin') {
      return hasModuleAccess([
        'user', 'users',
        'department', 'departments', 'dept',
        'role', 'roles', 'authorization', 'permission', 'permissions',
        'activitylog', 'activity_log', 'log', 'logs', 'audit',
        'policy', 'policies',
        'config', 'configuration', 'system',
      ]);
    }
    return hasModuleAccess(item.module);
  };

  const isRootOverviewVisible = isItemVisible(rootOverviewItem);
  const isChatVisible = !isLoading;

  const visibleGroups = useMemo(() => {
    return menuGroups
      .map((group) => {
        const visibleItems = group.items.filter(isItemVisible);
        return {
          ...group,
          items: visibleItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [menuGroups, isLoading, isSuperAdmin, hasModuleAccess]);

  const isPathActive = (path: string) => currentPath === path || currentPath.startsWith(`${path}/`);
  const isRootOverviewActive = currentPath === rootOverviewItem.path;
  const activeGroupId = visibleGroups.find((group) => group.items.some((item) => isPathActive(item.path)))?.id;

  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroups((prev) => (prev[activeGroupId] ? prev : { ...prev, [activeGroupId]: true }));
  }, [activeGroupId]);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileSidebarOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileSidebarOpen, setIsMobileSidebarOpen]);

  const navigateTo = (path: string) => {
    setIsMobileSidebarOpen(false);
    navigate({ to: path as any });
  };

  const activeItemClass = 'bg-[#1769ee] text-white shadow-[0_8px_20px_rgba(23,105,238,0.18)]';
  const inactiveItemClass = 'text-slate-300 hover:bg-white/[0.08] hover:text-white';

  // =========================================================================
  // 1. GIAO DIỆN KHI THU GỌN (COLLAPSED MINI SIDEBAR - w-16)
  // =========================================================================
  if (!isSidebarOpen && !isMobileSidebarOpen) {
    return (
      <aside style={{ fontFamily: 'Arial, Helvetica, sans-serif' }} className="hidden lg:flex w-16 bg-[#08172b] border-r border-[#1a2a43] flex-col h-screen shrink-0 select-none text-slate-300 font-sans transition-all duration-300">
        <div className="h-16 px-2 border-b border-[#1a2a43] flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => navigateTo(defaultHomePath)}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1d7bff] to-[#1250d4] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-[1.03] transition-transform"
            title="NEXORA AI"
            aria-label="Mở NEXORA AI"
          >
            N
          </button>
        </div>

        <div className="px-2 pt-3 pb-2 flex justify-center">
          {isChatVisible && (
            <button
              type="button"
              onClick={() => navigateTo('/chat')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer group ${currentPath === '/chat' ? activeItemClass : inactiveItemClass}`}
              title="Mở Trợ lý AI"
              aria-label="Mở Trợ lý AI"
            >
              <MessageSquare className="w-[18px] h-[18px] text-blue-300 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        <nav aria-label="Điều hướng chính" className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 text-xs custom-scrollbar flex flex-col items-center">
          {isRootOverviewVisible && (
            <button
              type="button"
              onClick={() => navigateTo(rootOverviewItem.path)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${isRootOverviewActive ? activeItemClass : inactiveItemClass}`}
              title={rootOverviewItem.label}
              aria-label={rootOverviewItem.label}
              aria-current={isRootOverviewActive ? 'page' : undefined}
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          {visibleGroups.map((group) => (
            <div key={group.id} className="w-full flex flex-col items-center pt-2 mt-1 border-t border-[#1a2a43]">
              {group.items.map((item) => {
                const isActive = isPathActive(item.path);
                const ItemIcon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.path)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${isActive ? activeItemClass : inactiveItemClass}`}
                    title={`${group.title}: ${item.label}`}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <ItemIcon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          ))}

        </nav>

        <div className="p-2 border-t border-[#1a2a43] flex flex-col items-center gap-2">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-[#1769ee] text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-sm"
            title={`${displayName} (${roleName})`}
            onClick={() => navigateTo(defaultHomePath)}
            aria-label={`${displayName}, ${roleName}`}
          >
            {initials}
          </button>
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-10 h-8 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Mở rộng menu"
            aria-label="Mở rộng menu"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

      </aside>
    );
  }

  // =========================================================================
  // 2. GIAO DIỆN KHI MỞ RỘNG (EXPANDED SIDEBAR - w-60)
  // =========================================================================
  return (
    <>
    {isMobileSidebarOpen && (
      <button
        type="button"
        onClick={() => setIsMobileSidebarOpen(false)}
        className="fixed inset-0 z-40 bg-[#031126]/45 backdrop-blur-[1px] lg:hidden cursor-default"
        aria-label="Đóng menu"
      />
    )}
    <aside style={{ fontFamily: 'Arial, Helvetica, sans-serif' }} className={`w-60 bg-[#08172b] border-r border-[#1a2a43] flex flex-col h-screen shrink-0 select-none text-slate-300 font-sans transition-all duration-300 ${isMobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0 flex shadow-2xl lg:relative lg:shadow-none' : 'hidden lg:flex'}`}>
      <div className="h-16 px-4 border-b border-[#1a2a43] flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => navigateTo(defaultHomePath)}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0 text-left"
          aria-label="Mở NEXORA AI"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1d7bff] to-[#1250d4] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 shrink-0">
            N
          </div>
          <span className="font-bold text-white tracking-[0.02em] text-sm truncate">
            NEXORA AI
          </span>
        </button>

        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-md cursor-pointer transition-colors"
          title="Thu gọn menu"
          aria-label="Thu gọn menu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 pt-4 pb-2">
        {isChatVisible && (
          <button
            type="button"
            onClick={() => navigateTo('/chat')}
            className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2.5 transition-all cursor-pointer group border ${currentPath === '/chat' ? `${activeItemClass} border-blue-400/30` : 'text-slate-200 border-blue-400/15 bg-blue-500/[0.08] hover:bg-blue-500/[0.16] hover:border-blue-400/30'}`}
            aria-current={currentPath === '/chat' ? 'page' : undefined}
          >
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-blue-200 group-hover:rotate-6 transition-transform" />
            </span>
            <span className="truncate">Mở Trợ lý AI</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-200/70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      <nav aria-label="Điều hướng chính" className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 text-[13px] custom-scrollbar">
        {isRootOverviewVisible && (
          <div className="pb-2 mb-1 border-b border-[#1a2a43]">
            <button
              type="button"
              onClick={() => navigateTo(rootOverviewItem.path)}
              className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-[13px] transition-all cursor-pointer border-l-2 ${isRootOverviewActive ? `${activeItemClass} border-blue-300 font-semibold` : `${inactiveItemClass} border-transparent`}`}
              aria-current={isRootOverviewActive ? 'page' : undefined}
            >
              <Home className="w-[17px] h-[17px] shrink-0" />
              <span className="truncate">{rootOverviewItem.label}</span>
            </button>
          </div>
        )}

        {visibleGroups.map((group) => {
          const isOpen = openGroups[group.id] ?? true;
          const GroupIcon = group.icon;

          return (
            <div key={group.id} className="pt-2 first:pt-0 space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-[11px] uppercase tracking-[0.04em] font-semibold transition-colors cursor-pointer ${activeGroupId === group.id ? 'text-blue-200' : 'text-slate-400 hover:text-slate-200'}`}
                aria-expanded={isOpen}
                aria-controls={`sidebar-group-${group.id}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{group.title}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {isOpen && (
                <div id={`sidebar-group-${group.id}`} className="space-y-0.5 ml-2 pl-2 border-l border-[#203452]">
                  {group.items.map((item) => {
                    const isActive = isPathActive(item.path);
                    const ItemIcon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.path)}
                        className={`w-full px-3 py-2.5 rounded-xl flex items-center gap-2.5 text-[13px] transition-all cursor-pointer border-l-2 ${isActive ? `${activeItemClass} border-blue-300 font-semibold` : `${inactiveItemClass} border-transparent`}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <ItemIcon className="w-[17px] h-[17px] shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </nav>

      <div className="p-3 border-t border-[#1a2a43]">
        <button
          type="button"
          onClick={() => navigateTo(defaultHomePath)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.08] cursor-pointer transition-colors group text-left"
          aria-label={`Mở hồ sơ ${displayName}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#1769ee] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm ring-2 ring-blue-300/10">
              {initials}
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-semibold text-white truncate leading-tight group-hover:text-blue-400 transition-colors">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                {roleName}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        </button>
      </div>

    </aside>
    </>
  );
};

export default Sidebar;
