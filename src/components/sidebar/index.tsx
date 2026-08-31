import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useUserPermissions } from '@/hooks/useUserPermissions';
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  ChevronsLeft,
  MessageSquare,
  Home,
  FileText,
  Database,
  FolderKanban,
  FolderTree,
  CheckSquare,
  Kanban,
  Calendar,
  Users2,
  BarChart2,
  TrendingUp,
  LayoutDashboard,
  Users,
  Building2,
  Shield,
  Clock,
  FileCheck2,
  Sliders,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  module?: string | string[];
  isImplemented?: boolean;
}

interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  collapsible?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useApp();
  const { hasModuleAccess, isSuperAdmin } = useUserPermissions();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { t } = useTranslation(['sidebar', 'common']);

  const [isAdminOpen, setIsAdminOpen] = useState(true);

  // Định nghĩa đầy đủ danh mục menu theo mẫu thiết kế 01-executive-dashboard.png
  // kèm theo quy tắc phân quyền (Module Permissions) và trạng thái Backend API (isImplemented)
  const rawSections: SidebarSection[] = useMemo(() => [
    {
      id: 'overview',
      title: 'TỔNG QUAN',
      items: [
        {
          id: 'dashboard',
          label: 'Tổng quan',
          path: '/dashboard',
          icon: Home,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
      ],
    },
    {
      id: 'knowledge',
      title: 'KHO TRI THỨC',
      items: [
        {
          id: 'data-repo',
          label: 'Tài liệu',
          path: '/data-repo',
          icon: FileText,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
        {
          id: 'data-base',
          label: 'Cơ sở tri thức',
          path: '/data-repo',
          icon: Database,
          isImplemented: false,
        },
      ],
    },
    {
      id: 'projects',
      title: 'DỰ ÁN',
      items: [
        {
          id: 'projects',
          label: 'Dự án',
          path: '/projects',
          icon: FolderKanban,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
        {
          id: 'projects-catalog',
          label: 'Danh mục dự án',
          path: '/projects',
          icon: FolderTree,
          isImplemented: false,
        },
      ],
    },
    {
      id: 'tasks',
      title: 'CÔNG VIỆC',
      items: [
        {
          id: 'tasks',
          label: 'Công việc',
          path: '/tasks',
          icon: CheckSquare,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
        {
          id: 'kanban',
          label: 'Kanban',
          path: '/tasks',
          icon: Kanban,
          isImplemented: false,
        },
      ],
    },
    {
      id: 'collaboration',
      title: 'LỊCH & CUỘC HỌP',
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
          isImplemented: false,
        },
      ],
    },
    {
      id: 'reports',
      title: 'BÁO CÁO',
      items: [
        {
          id: 'reports',
          label: 'Báo cáo',
          path: '/reports',
          icon: BarChart2,
          isImplemented: false, // Chưa có Backend API -> Tự động ẩn theo nghiệp vụ
        },
        {
          id: 'analytics',
          label: 'Phân tích',
          path: '/reports',
          icon: TrendingUp,
          isImplemented: false,
        },
      ],
    },
    {
      id: 'admin',
      title: 'QUẢN TRỊ HỆ THỐNG',
      collapsible: true,
      isOpen: isAdminOpen,
      onToggle: () => setIsAdminOpen(!isAdminOpen),
      items: [
        {
          id: 'admin-overview',
          label: 'Tổng quan',
          path: '/admin',
          icon: LayoutDashboard,
          module: 'all',
          isImplemented: true, // Đã có Backend API
        },
        {
          id: 'admin-users',
          label: 'Người dùng',
          path: '/admin/users',
          icon: Users,
          module: 'user',
          isImplemented: true, // Đã có Backend API GET /api/users
        },
        {
          id: 'admin-departments',
          label: 'Phòng ban',
          path: '/admin/departments',
          icon: Building2,
          module: 'department',
          isImplemented: true, // Đã có Backend API GET /api/departments
        },
        {
          id: 'admin-roles',
          label: 'Vai trò & Quyền',
          path: '/admin/roles',
          icon: Shield,
          module: ['role', 'authorization'],
          isImplemented: true, // Đã có Backend API GET /api/roles
        },
        {
          id: 'admin-policies',
          label: 'Chính sách dữ liệu',
          path: '/admin/policies',
          icon: FileCheck2,
          module: 'policy',
          isImplemented: false, // Chưa có Backend API
        },
        {
          id: 'admin-logs',
          label: 'Nhật ký hoạt động',
          path: '/admin/logs',
          icon: Clock,
          module: ['activitylog', 'activity_log', 'log', 'logs', 'audit'],
          isImplemented: true, // Đã có Backend API GET /api/activity-logs
        },
        {
          id: 'admin-config',
          label: 'Cấu hình hệ thống',
          path: '/admin/config',
          icon: Sliders,
          module: 'config',
          isImplemented: false, // Chưa có Backend API
        },
      ],
    },
  ], [isAdminOpen]);

  // Lọc động 100% theo Nghiệp vụ Phân quyền (Module Permissions) và Trạng thái Backend API (isImplemented)
  const visibleSections = useMemo(() => {
    return rawSections
      .map((section) => {
        const visibleItems = section.items.filter((item) => {
          // 1. Chỉ hiển thị các mục ĐÃ ĐƯỢC IMPLEMENT (có Backend API)
          if (item.isImplemented === false) {
            return false;
          }

          // 2. Nếu là SuperAdmin, cho phép tất cả các mục đã có Backend API
          if (isSuperAdmin) {
            return true;
          }

          // 3. Nếu mục là 'all' hoặc không yêu cầu phân hệ đặc biệt
          if (!item.module || item.module === 'all') {
            return (
              hasModuleAccess('user') ||
              hasModuleAccess('department') ||
              hasModuleAccess(['role', 'authorization']) ||
              hasModuleAccess(['activitylog', 'activity_log', 'log', 'logs', 'audit'])
            );
          }

          // 4. Kiểm tra xem người dùng có quyền trong phân hệ (module) này không
          return hasModuleAccess(item.module);
        });

        return {
          ...section,
          items: visibleItems,
        };
      })
      .filter((section) => section.items.length > 0); // Ẩn hoàn toàn các nhóm không có mục nào được phân quyền!
  }, [rawSections, isSuperAdmin, hasModuleAccess]);

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <aside className="w-60 bg-[#080d1a] border-r border-[#172033] flex flex-col h-screen shrink-0 select-none text-slate-300 transition-all duration-200">
      
      {/* 1. Header: Brand Icon N + NEXORA AI + Collapse button « matching 01-executive-dashboard.png */}
      <div className="h-14 px-4 border-b border-[#172033] flex items-center justify-between shrink-0">
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
          className="p-1 hover:bg-[#152033] text-slate-400 hover:text-slate-200 rounded cursor-pointer transition-colors"
          title="Thu gọn menu"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Top Action Card: Mở Trợ lý AI > */}
      <div className="p-3">
        <button
          onClick={() => navigate({ to: '/chat' as any })}
          className="w-full py-2.5 px-3 bg-[#111927] hover:bg-[#182337] border border-[#1f293d] rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-between shadow-xs transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span>Mở Trợ lý AI</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 3. Navigation Sections: Đã lọc chính xác theo phân quyền nghiệp vụ */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-3.5 text-xs custom-scrollbar">
        {visibleSections.map((section) => {
          return (
            <div key={section.id} className="space-y-1">
              {/* Section Title Header */}
              {section.collapsible ? (
                <div
                  onClick={section.onToggle}
                  className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors"
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-500 transition-transform ${
                      section.isOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                </div>
              ) : (
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {section.title}
                </div>
              )}

              {/* Section Items */}
              {(!section.collapsible || section.isOpen) && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = currentPath === item.path;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate({ to: item.path as any })}
                        className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-xs'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-[#121a2c]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
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

      {/* 4. Bottom Footer: Thu gọn button */}
      <div className="p-3 border-t border-[#172033]">
        <button
          onClick={toggleSidebar}
          className="w-full py-2 px-3 hover:bg-[#121a2c] rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ChevronsLeft className="w-4 h-4" />
          <span>Thu gọn</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
