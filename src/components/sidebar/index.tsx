import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { getInitials } from '@/utils';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Folder,
  Calendar,
  FolderKanban,
  CheckSquare,
  BarChart2,
  Settings,
  Users2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  LogOut,
  LayoutDashboard,
  MessageSquare,
  Users,
  Building2,
  Shield,
  FileCheck2,
  Clock,
  Sliders,
  Sun,
  Moon
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: any;
}

interface NavGroup {
  title: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    chatSessions,
    activeChatSessionId,
    setActiveChatSessionId,
    startNewChat,
    currentUser,
    logout,
    showToast,
    isDark,
    toggleTheme
  } = useApp();

  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [opsOpen, setOpsOpen] = useState(true);
  const [collabOpen, setCollabOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isChatMode = currentPath === '/chat';

  // Group chat history
  const filteredChatSessions = chatSessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todaySessions = filteredChatSessions.filter(
    (s) => !s.group || s.group === 'today'
  );
  const olderSessions = filteredChatSessions.filter(
    (s) => s.group && s.group !== 'today'
  );

  const navGroups: NavGroup[] = [
    {
      title: 'VẬN HÀNH & DỮ LIỆU',
      isOpen: opsOpen,
      setIsOpen: setOpsOpen,
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { id: 'data-repo', label: 'Kho dữ liệu', path: '/data-repo', icon: Folder },
        { id: 'projects', label: 'Dự án', path: '/projects', icon: FolderKanban },
        { id: 'tasks', label: 'Công việc', path: '/tasks', icon: CheckSquare },
        { id: 'reports', label: 'Báo cáo', path: '/reports', icon: BarChart2 },
      ],
    },
    {
      title: 'CỘNG TÁC',
      isOpen: collabOpen,
      setIsOpen: setCollabOpen,
      items: [
        { id: 'meetings', label: 'Phòng họp', path: '/meetings', icon: Users2 },
        { id: 'calendar', label: 'Lịch', path: '/calendar', icon: Calendar },
      ],
    },
    {
      title: 'QUẢN TRỊ HỆ THỐNG',
      isOpen: adminOpen,
      setIsOpen: setAdminOpen,
      items: [
        { id: 'admin-overview', label: 'Tổng quan', path: '/admin', icon: LayoutDashboard },
        { id: 'admin-users', label: 'Người dùng', path: '/admin/users', icon: Users },
        { id: 'admin-departments', label: 'Phòng ban', path: '/admin/departments', icon: Building2 },
        { id: 'admin-roles', label: 'Vai trò & Quyền', path: '/admin/roles', icon: Shield },
        { id: 'admin-policies', label: 'Chính sách dữ liệu', path: '/admin/policies', icon: FileCheck2 },
        { id: 'admin-logs', label: 'Nhật ký hoạt động', path: '/admin/logs', icon: Clock },
        { id: 'admin-config', label: 'Cấu hình hệ thống', path: '/admin/config', icon: Sliders },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col h-screen shrink-0 select-none transition-colors">
      {/* 1. Header Logo */}
      <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0">
        <div
          onClick={() => navigate({ to: '/chat' as any })}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-2xs shadow-blue-500/30 relative">
            <span>N</span>
            <Sparkles className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-blue-200 fill-blue-200" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 leading-tight text-sm tracking-tight flex items-center gap-1">
              NEXORA AI
              <span className="text-[9px] px-1 py-0.2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded font-semibold border border-blue-200/50 dark:border-blue-800/50">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Trợ lý AI nội bộ</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <button
            onClick={() => showToast('Cài đặt giao diện', 'info')}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Chat Mode specific view VS Management Mode view */}
      {isChatMode ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* New Chat & Search */}
          <div className="p-3 space-y-2 border-b border-slate-100 dark:border-slate-800/60">
            <button
              onClick={startNewChat}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded-lg shadow-2xs shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Đoạn chat mới</span>
            </button>

            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm đoạn chat..."
                className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
              <button
                onClick={() => showToast('Bộ lọc tìm kiếm lịch sử chat', 'info')}
                className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick AI Modules Row */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => showToast('Bộ lọc: Chat Dự án', 'info')}
              className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap text-[11px] cursor-pointer"
            >
              Dự án
            </button>
            <button
              onClick={() => showToast('Bộ lọc: Chat Báo cáo', 'info')}
              className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap text-[11px] cursor-pointer"
            >
              Báo cáo
            </button>
            <button
              onClick={() => showToast('Bộ lọc: Chat Phòng họp', 'info')}
              className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap text-[11px] cursor-pointer"
            >
              Phòng họp
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
            {todaySessions.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 block">
                  Hôm nay
                </span>
                {todaySessions.map((session) => {
                  const isCurrent = activeChatSessionId === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setActiveChatSessionId(session.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <span className="truncate text-xs">{session.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {olderSessions.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 block">
                  Trước đó
                </span>
                {olderSessions.map((session) => {
                  const isCurrent = activeChatSessionId === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setActiveChatSessionId(session.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <span className="truncate text-xs">{session.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Navigation Mode (When outside Chat) */
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Quick back to Chat Button */}
          <button
            onClick={() => navigate({ to: '/chat' as any })}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-2xs shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mở Trợ lý Chat AI</span>
          </button>

          {/* Nav Groups */}
          <div className="space-y-4 pt-1">
            {navGroups.map((grp, idx) => (
              <div key={idx} className="space-y-1">
                <button
                  type="button"
                  onClick={() => grp.setIsOpen(!grp.isOpen)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  <span>{grp.title}</span>
                  {grp.isOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>

                {grp.isOpen && (
                  <div className="space-y-0.5">
                    {grp.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.path === '/admin'
                          ? currentPath === '/admin'
                          : currentPath.startsWith(item.path);

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigate({ to: item.path as any })}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors font-medium cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Footer User Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/90 shrink-0 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-2xs shrink-0">
              {getInitials(currentUser.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {currentUser.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
