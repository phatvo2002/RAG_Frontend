import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/button';
import {
  LayoutDashboard,
  Folder,
  FolderKanban,
  CheckSquare,
  Users2,
  Calendar,
  BarChart2,
  Settings,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Users
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    projects,
    tasks,
    documents,
    meetings,
    users,
    setActiveModule,
    setActiveAdminTab,
    addChatMessage,
    showToast
  } = useApp();

  const handleAskAIAboutProject = (projName: string) => {
    addChatMessage({
      sender: 'user',
      text: `Tóm tắt tiến độ và các rủi ro của ${projName}`
    });
    setActiveModule('chat');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      <Header />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Banner with AI Assistant quick action */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 C 50 100 80 0 100 100 Z" fill="white" />
              </svg>
            </div>

            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NEXORA AI Executive Dashboard</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Trung tâm Điều hành & Trợ lý Phân tích Doanh nghiệp
              </h2>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Theo dõi toàn diện tiến độ dự án, công việc Kanban, tài liệu kho tri thức và hiệu suất làm việc nhóm trong thời gian thực.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  onClick={() => setActiveModule('chat')}
                  className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hỏi AI về tiến độ hôm nay</span>
                </button>
                <button
                  onClick={() => setActiveModule('reports')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl backdrop-blur-md transition-colors cursor-pointer"
                >
                  Xem Báo cáo Tổng hợp
                </button>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveModule('projects')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
                <span>Dự án đang chạy</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FolderKanban className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{projects.length}</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{projects.filter(p => p.status === 'Đang tiến hành' || p.status === 'Đang triển khai').length} tiến hành</span>
                </span>
                <span className="text-slate-400">Xem chi tiết →</span>
              </div>
            </div>

            <div
              onClick={() => setActiveModule('tasks')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
                <span>Công việc cần xử lý</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <CheckSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {tasks.filter(t => t.status !== 'Hoàn thành' && t.status !== 'Đã hoàn thành').length}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-600 font-semibold">
                  {tasks.filter(t => t.priority === 'Khẩn cấp' || t.priority === 'Cao').length} việc ưu tiên cao
                </span>
                <span className="text-slate-400">Kanban →</span>
              </div>
            </div>

            <div
              onClick={() => setActiveModule('data-repo')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
                <span>Kho tài liệu RAG</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Folder className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{documents.length}</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">13.6 GB dữ liệu</span>
                <span className="text-slate-400">Quản lý →</span>
              </div>
            </div>

            <div
              onClick={() => setActiveModule('meetings')}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
                <span>Cuộc họp hôm nay</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Users2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">{meetings.length}</div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 font-semibold">Tự động tạo biên bản</span>
                <span className="text-slate-400">Lịch họp →</span>
              </div>
            </div>
          </div>

          {/* 2 Main Columns: Projects & Active Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Projects Overview */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Tiến độ các Dự án Trọng điểm</h3>
                  <p className="text-xs text-slate-400">Theo dõi thời hạn và mức độ rủi ro</p>
                </div>
                <button
                  onClick={() => setActiveModule('projects')}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4
                            onClick={() => setActiveModule('projects')}
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                          >
                            {proj.name}
                          </h4>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                            {proj.code || proj.key || 'PROJ'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">{proj.description}</p>
                      </div>

                      <Badge
                        variant={
                          proj.status === 'Hoàn thành' || proj.status === 'Đã hoàn thành'
                            ? 'success'
                            : 'primary'
                        }
                      >
                        {proj.status}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-600">Tiến độ Sprint</span>
                        <span className="text-blue-600">{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-4">
                        <span>Trưởng dự án: <strong className="text-slate-700">{proj.lead}</strong></span>
                        <span>Hạn chót: {proj.dueDate || proj.deadline}</span>
                      </div>
                      <button
                        onClick={() => handleAskAIAboutProject(proj.name)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>AI Phân tích</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Urgent Tasks & Quick Jump */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Công việc cần làm ngay</h3>
                  <p className="text-xs text-slate-400">Danh sách việc ưu tiên cao</p>
                </div>
                <button
                  onClick={() => setActiveModule('tasks')}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Xem Kanban</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {tasks.slice(0, 5).map((t) => {
                  const assigneeName = typeof t.assignee === 'object' && t.assignee !== null ? (t.assignee as any).name || 'Chưa phân công' : String(t.assignee || 'Chưa phân công');
                  return (
                    <div
                      key={t.id}
                      onClick={() => setActiveModule('tasks')}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl transition-all cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1 min-w-0 pr-3">
                        <p className="font-semibold text-slate-900 truncate">{t.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {t.project || t.projectName} • {assigneeName}
                        </p>
                      </div>
                      <Badge
                        variant={
                          t.priority === 'Khẩn cấp' || t.priority === 'Cao'
                            ? 'danger'
                            : 'secondary'
                        }
                      >
                        {t.priority}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;

