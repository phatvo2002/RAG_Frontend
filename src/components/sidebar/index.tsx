import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('sidebar');
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  // Thông tin user hiển thị ở User Card footer
  const displayName = currentUser?.name || currentUser?.displayName || currentUser?.userName || 'Phat';
  const roleName = currentUser?.roles?.[0]?.roleName || currentUser?.role || t('common:roles.employee');
  const initials = displayName.slice(0, 2).toUpperCase();

  // Quản lý trạng thái đóng/mở của từng nhóm menu
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    operations: true,
    collaboration: true,
    catalog: true,
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
    if (hasModuleAccess('ORGANIZATION.READ')) return '/catalog/organizations';
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
    label: t('items.adminOverview'),
    path: '/admin',
    icon: Home,
    module: 'all',
    isImplemented: true,
  }), [t]);

  // 2. Danh mục các nhóm Menu theo thiết kế nexora-workbench-v3
  const menuGroups: MenuGroup[] = useMemo(() => [
    {
      id: 'operations',
      title: t('groups.operations'),
      icon: Layers,
      items: [
        {
          id: 'dashboard',
          label: t('items.dashboard'),
          path: '/dashboard',
          icon: LayoutDashboard,
          module: 'dashboard',
          isImplemented: true,
        },
        {
          id: 'knowledge',
          label: t('items.dataRepo'),
          path: '/data-repo',
          icon: Database,
          module: ['document', 'documents', 'data-repo'],
          isImplemented: true,
        },
        {
          id: 'projects',
          label: t('items.projects'),
          path: '/projects',
          icon: Folder,
          module: ['project', 'projects', 'proj'],
          isImplemented: true,
        },
        {
          id: 'tasks',
          label: t('items.tasks'),
          path: '/tasks',
          icon: LayoutGrid,
          module: ['task', 'tasks'],
          isImplemented: true,
        },
        {
          id: 'reports',
          label: t('items.reports'),
          path: '/reports',
          icon: FileBarChart,
          module: ['report', 'reports', 'rep'],
          isImplemented: true,
        },
      ],
    },
    {
      id: 'collaboration',
      title: t('groups.collaboration'),
      icon: Calendar,
      items: [
        {
          id: 'calendar',
          label: t('items.calendar'),
          path: '/calendar',
          icon: Calendar,
          module: ['calendar', 'cal'],
          isImplemented: true,
        },
        {
          id: 'meetings',
          label: t('items.meetings'),
          path: '/meetings',
          icon: CalendarClock,
          module: ['meeting', 'meetings', 'meet'],
          isImplemented: true,
        },
      ],
    },
    {
      id: 'catalog',
      title: t('groups.catalog'),
      icon: Building2,
      items: [
        {
          id: 'organizations',
          label: t('items.organizations'),
          path: '/catalog/organizations',
          icon: Building2,
          module: 'ORGANIZATION.READ',
          isImplemented: true,
        },
      ],
    },
    {
      id: 'admin',
      title: t('groups.admin'),
      icon: ShieldCheck,
      items: [
        {
          id: 'users',
          label: t('items.adminUsers'),
          path: '/admin/users',
          icon: UserIcon,
          module: 'user',
          isImplemented: true,
        },
        {
          id: 'departments',
          label: t('items.adminDepartments'),
          path: '/admin/departments',
          icon: Building2,
          module: 'department',
          isImplemented: true,
        },
        {
          id: 'roles',
          label: t('items.adminRoles'),
          path: '/admin/roles',
          icon: ShieldCheck,
          module: ['role', 'authorization'],
          isImplemented: true,
        },
        {
          id: 'logs',
          label: t('items.adminLogs'),
          path: '/admin/logs',
          icon: Clock,
          module: ['activitylog', 'activity_log', 'log', 'logs', 'audit'],
          isImplemented: true,
        },
        {
          id: 'policies',
          label: t('items.adminPolicies'),
          path: '/admin/policies',
          icon: Shield,
          module: ['policy', 'policies'],
          isImplemented: true,
        },
        {
          id: 'config',
          label: t('items.adminConfig'),
          path: '/admin/config',
          icon: Settings,
          module: ['config', 'configuration', 'system'],
          isImplemented: true,
        },
      ],
    },
  ], [t]);

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

  const activeItemClass = 'bg-[#1b3d65] text-white';
  const inactiveItemClass = 'text-[#d5e2f3] hover:bg-white/10 hover:text-white';

  // =========================================================================
  // 1. GIAO DIỆN KHI THU GỌN (COLLAPSED MINI SIDEBAR - w-16)
  // =========================================================================
  if (!isSidebarOpen && !isMobileSidebarOpen) {
    return (
      <aside className="hidden lg:flex w-16 bg-[#0c2137] border-r border-white/10 flex-col h-screen shrink-0 select-none text-[#eaf2ff] font-sans transition-all duration-300">
        <div className="h-[62px] px-2 border-b border-white/10 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={() => navigateTo(defaultHomePath)}
            className="w-8 h-8 rounded-md bg-[#1762f4] flex items-center justify-center text-white font-bold text-lg cursor-pointer hover:bg-[#2670ff] transition-colors"
            title="NEXORA AI"
              aria-label={t('navMode.openAiChat')}
          >
            N
          </button>
        </div>

        <div className="px-2 pt-3 pb-2 flex justify-center">
          {isChatVisible && (
            <button
              type="button"
              onClick={() => navigateTo('/chat')}
              className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors cursor-pointer group ${currentPath === '/chat' ? activeItemClass : inactiveItemClass}`}
              title={t('navMode.openAiChat')}
              aria-label={t('navMode.openAiChat')}
            >
              <MessageSquare className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>

        <nav aria-label={t('navigation')} className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 text-xs custom-scrollbar flex flex-col items-center">
          {isRootOverviewVisible && (
            <button
              type="button"
              onClick={() => navigateTo(rootOverviewItem.path)}
              className={`w-10 h-10 rounded-md flex items-center justify-center transition-all cursor-pointer relative ${isRootOverviewActive ? activeItemClass : inactiveItemClass}`}
              title={rootOverviewItem.label}
              aria-label={rootOverviewItem.label}
              aria-current={isRootOverviewActive ? 'page' : undefined}
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          {visibleGroups.map((group) => (
            <div key={group.id} className="w-full flex flex-col items-center pt-2 mt-1 border-t border-white/10">
              {group.items.map((item) => {
                const isActive = isPathActive(item.path);
                const ItemIcon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.path)}
                    className={`w-10 h-10 rounded-md flex items-center justify-center transition-all cursor-pointer relative ${isActive ? activeItemClass : inactiveItemClass}`}
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

        <div className="p-2 border-t border-white/10 flex flex-col items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-[#1762f4] text-white text-xs font-bold flex items-center justify-center cursor-pointer"
            title={`${displayName} (${roleName})`}
            onClick={() => navigateTo('/account')}
            aria-label={`${displayName}, ${roleName}`}
          >
            {initials}
          </button>
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-10 h-8 hover:bg-white/10 rounded-md text-[#9fb2cc] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title={t('expand')}
            aria-label={t('expand')}
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
        aria-label={t('closeMenu')}
      />
    )}
    <aside className={`w-[238px] bg-[#0c2137] border-r border-white/10 flex flex-col h-screen shrink-0 select-none text-[#eaf2ff] font-sans transition-all duration-300 ${isMobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0 flex shadow-2xl lg:relative lg:shadow-none' : 'hidden lg:flex'}`}>
      <div className="h-[62px] px-3 border-b border-white/10 flex items-center justify-between shrink-0">
        <button
          type="button"
          onClick={() => navigateTo(defaultHomePath)}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0 text-left"
          aria-label={t('navMode.openAiChat')}
        >
          <div className="w-8 h-8 rounded-md bg-[#1762f4] flex items-center justify-center text-white font-bold text-lg shrink-0">
            N
          </div>
          <span className="min-w-0"><strong className="block truncate text-sm leading-tight text-white">NEXORA AI</strong><span className="block text-[11px] text-[#9fb2cc]">{t('navMode.managementSpace')}</span></span>
        </button>

        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-white/10 text-[#9fb2cc] hover:text-white rounded-md cursor-pointer transition-colors"
          title={t('collapse')}
          aria-label={t('collapse')}
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="px-3 pt-3 pb-2">
        {isChatVisible && (
          <button
            type="button"
            onClick={() => navigateTo('/chat')}
            className={`w-full px-3 py-2.5 rounded-md text-[13px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer group border ${currentPath === '/chat' ? `${activeItemClass} border-[#2f86ff]` : 'text-[#d5e2f3] border-[#344e69] bg-[#112b45] hover:bg-[#1b3d65]'}`}
            aria-current={currentPath === '/chat' ? 'page' : undefined}
          >
            <span className="w-7 h-7 rounded-md bg-[#1b3d65] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-[#bcd7ff]" />
            </span>
            <span className="truncate">{t('navMode.openAiChat')}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#9fb2cc] group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      <nav aria-label={t('navigation')} className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 text-[13px] custom-scrollbar">
        {isRootOverviewVisible && (
          <div className="pb-2 mb-1 border-b border-white/10">
            <button
              type="button"
              onClick={() => navigateTo(rootOverviewItem.path)}
              className={`w-full px-3 py-2.5 rounded-md flex items-center gap-2.5 text-[13px] transition-colors cursor-pointer border-l-[3px] ${isRootOverviewActive ? `${activeItemClass} border-[#2f86ff] font-semibold` : `${inactiveItemClass} border-transparent`}`}
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
                className={`w-full px-3 py-2 rounded-md flex items-center justify-between text-[11px] uppercase tracking-wide font-semibold transition-colors cursor-pointer ${activeGroupId === group.id ? 'text-[#c9ddff]' : 'text-[#9fb2cc] hover:text-white'}`}
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
                <div id={`sidebar-group-${group.id}`} className="space-y-0.5 ml-2 pl-2 border-l border-[#344e69]">
                  {group.items.map((item) => {
                    const isActive = isPathActive(item.path);
                    const ItemIcon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.path)}
                        className={`w-full px-3 py-2.5 rounded-md flex items-center gap-2.5 text-[13px] transition-colors cursor-pointer border-l-[3px] ${isActive ? `${activeItemClass} border-[#2f86ff] font-semibold` : `${inactiveItemClass} border-transparent`}`}
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

      <div className="p-3 border-t border-white/10">
        <button
          type="button"
          onClick={() => navigateTo('/account')}
          className="w-full flex items-center justify-between p-1 rounded-md hover:bg-white/10 cursor-pointer transition-colors group text-left"
          aria-label={`Mở hồ sơ ${displayName}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1762f4] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-semibold text-white truncate leading-tight">
                {displayName}
              </span>
              <span className="text-[10px] text-[#9fb2cc] truncate leading-tight mt-0.5">
                {roleName}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#9fb2cc] group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        </button>
      </div>

    </aside>
    </>
  );
};

export default Sidebar;
