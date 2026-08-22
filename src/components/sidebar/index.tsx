import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
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
  ArrowRight,
  PanelLeftClose
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
    isSidebarOpen,
    toggleSidebar
  } = useApp();

  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { t } = useTranslation(['sidebar', 'common']);

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
      title: t('groups.operations', { defaultValue: 'OPERATIONS & DATA' }),
      isOpen: opsOpen,
      setIsOpen: setOpsOpen,
      items: [
        { id: 'dashboard', label: t('items.dashboard', { defaultValue: 'Dashboard' }), path: '/dashboard', icon: LayoutDashboard },
        { id: 'data-repo', label: t('items.dataRepo', { defaultValue: 'Data Repository' }), path: '/data-repo', icon: Folder },
        { id: 'projects', label: t('items.projects', { defaultValue: 'Projects' }), path: '/projects', icon: FolderKanban },
        { id: 'tasks', label: t('items.tasks', { defaultValue: 'Tasks' }), path: '/tasks', icon: CheckSquare },
        { id: 'reports', label: t('items.reports', { defaultValue: 'Reports' }), path: '/reports', icon: BarChart2 },
      ],
    },
    {
      title: t('groups.collaboration', { defaultValue: 'COLLABORATION' }),
      isOpen: collabOpen,
      setIsOpen: setCollabOpen,
      items: [
        { id: 'meetings', label: t('items.meetings', { defaultValue: 'Meetings' }), path: '/meetings', icon: Users2 },
        { id: 'calendar', label: t('items.calendar', { defaultValue: 'Calendar' }), path: '/calendar', icon: Calendar },
      ],
    },
    {
      title: t('groups.admin', { defaultValue: 'SYSTEM ADMINISTRATION' }),
      isOpen: adminOpen,
      setIsOpen: setAdminOpen,
      items: [
        { id: 'admin-overview', label: t('items.adminOverview', { defaultValue: 'Overview' }), path: '/admin', icon: LayoutDashboard },
        { id: 'admin-users', label: t('items.adminUsers', { defaultValue: 'Users' }), path: '/admin/users', icon: Users },
        { id: 'admin-departments', label: t('items.adminDepartments', { defaultValue: 'Departments' }), path: '/admin/departments', icon: Building2 },
        { id: 'admin-roles', label: t('items.adminRoles', { defaultValue: 'Roles & Permissions' }), path: '/admin/roles', icon: Shield },
        { id: 'admin-policies', label: t('items.adminPolicies', { defaultValue: 'Data Policies' }), path: '/admin/policies', icon: FileCheck2 },
        { id: 'admin-logs', label: t('items.adminLogs', { defaultValue: 'Activity Logs' }), path: '/admin/logs', icon: Clock },
        { id: 'admin-config', label: t('items.adminConfig', { defaultValue: 'System Config' }), path: '/admin/config', icon: Sliders },
      ],
    },
  ];

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800/80 flex flex-col h-screen shrink-0 select-none transition-all duration-200">
      {/* 1. Header Logo - Clean & Spacious */}
      <div className="h-14 px-3.5 border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
        <div
          onClick={() => navigate({ to: '/chat' as any })}
          className="flex items-center gap-2.5 cursor-pointer group min-w-0 flex-1"
        >
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-2xs shadow-blue-500/30 relative shrink-0">
            <span>N</span>
            <Sparkles className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-blue-200 fill-blue-200" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-slate-900 dark:text-zinc-100 leading-tight text-sm tracking-tight flex items-center gap-1.5 truncate">
              <span>NEXORA AI</span>
              <span className="text-[9px] px-1 py-0.2 bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 rounded font-semibold border border-blue-200/50 dark:border-zinc-700 shrink-0">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium truncate">
              {t('common:appSubtitle', { defaultValue: 'Internal AI Assistant' })}
            </p>
          </div>
        </div>

        {/* Single Close Button */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0 ml-1"
          title={t('collapse', { defaultValue: 'Collapse menu' })}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Chat Mode specific view VS Management Mode view */}
      {isChatMode ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Direct Redirection to Management Dashboard */}
          <div className="p-3 pb-1">
            <button
              onClick={() => navigate({ to: '/dashboard' as any })}
              className="w-full py-2 px-3 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-100 font-semibold text-xs rounded flex items-center justify-between transition-all cursor-pointer border border-slate-200/80 dark:border-zinc-800 shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="w-3 h-3" />
                </div>
                <span>{t('chatMode.goToDashboard', { defaultValue: 'Dashboard' })}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>

          {/* New Chat & Search */}
          <div className="p-3 space-y-2 border-b border-slate-100 dark:border-zinc-800/80">
            <button
              onClick={startNewChat}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs rounded shadow-2xs shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('chatMode.newChat', { defaultValue: 'New Chat' })}</span>
            </button>

            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('chatMode.searchChat', { defaultValue: 'Search conversations...' })}
                className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-xs placeholder:text-slate-400 dark:placeholder:text-zinc-500 text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
              <button
                onClick={() => showToast(t('chatMode.filterTooltip', { defaultValue: 'Filter search' }), 'info')}
                className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-0.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick AI Modules Row */}
          <div className="p-2 border-b border-slate-100 dark:border-zinc-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => showToast(t('chatMode.filters.projects', { defaultValue: 'Projects' }), 'info')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium whitespace-nowrap text-[11px] cursor-pointer"
            >
              {t('chatMode.filters.projects', { defaultValue: 'Projects' })}
            </button>
            <button
              onClick={() => showToast(t('chatMode.filters.reports', { defaultValue: 'Reports' }), 'info')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium whitespace-nowrap text-[11px] cursor-pointer"
            >
              {t('chatMode.filters.reports', { defaultValue: 'Reports' })}
            </button>
            <button
              onClick={() => showToast(t('chatMode.filters.meetings', { defaultValue: 'Meetings' }), 'info')}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-medium whitespace-nowrap text-[11px] cursor-pointer"
            >
              {t('chatMode.filters.meetings', { defaultValue: 'Meetings' })}
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 text-xs">
            {todaySessions.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2 block">
                  {t('chatMode.history.today', { defaultValue: 'Today' })}
                </span>
                {todaySessions.map((session) => {
                  const isCurrent = activeChatSessionId === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setActiveChatSessionId(session.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/80 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
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
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2 block">
                  {t('chatMode.history.previous', { defaultValue: 'Previous' })}
                </span>
                {olderSessions.map((session) => {
                  const isCurrent = activeChatSessionId === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setActiveChatSessionId(session.id)}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/80 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                          : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
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
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-2xs shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('navMode.openAiChat', { defaultValue: 'Open AI Assistant' })}</span>
          </button>

          {/* Nav Groups */}
          <div className="space-y-4 pt-1">
            {navGroups.map((grp, idx) => (
              <div key={idx} className="space-y-1">
                <button
                  type="button"
                  onClick={() => grp.setIsOpen(!grp.isOpen)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider hover:text-slate-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
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
                          className={`w-full text-left px-2.5 py-2 rounded flex items-center justify-between transition-colors font-medium cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                              : 'text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
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
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-950/90 shrink-0 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-2xs shrink-0">
              {getInitials(currentUser.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate leading-tight">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                {currentUser.role}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-zinc-900 rounded transition-colors cursor-pointer"
            title={t('user.logout', { defaultValue: 'Sign Out' })}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
