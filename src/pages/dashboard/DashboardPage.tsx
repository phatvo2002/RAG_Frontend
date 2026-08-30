import React from 'react';
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
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        <div className="w-full space-y-6">
          {/* Welcome Banner with AI Assistant quick action */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-box p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 C 50 100 80 0 100 100 Z" fill="white" />
              </svg>
            </div>

            <div className="relative z-10 space-y-3 max-w-2xl">
              <div className="badge badge-neutral bg-white/15 border-none text-blue-100 gap-1.5 font-semibold text-xs py-2 px-3">
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
                  className="btn btn-sm bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold shadow-xs border-none"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hỏi AI về tiến độ hôm nay</span>
                </button>
                <button
                  onClick={() => setActiveModule('reports')}
                  className="btn btn-sm btn-ghost bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  Xem Báo cáo Tổng hợp
                </button>
              </div>
            </div>
          </div>

          {/* DaisyUI Stats Overview Bar */}
          <div className="stats stats-vertical sm:stats-horizontal shadow-xs w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-box">
            <div
              onClick={() => setActiveModule('projects')}
              className="stat cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="stat-figure text-blue-600 dark:text-blue-400">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-zinc-800 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5" />
                </div>
              </div>
              <div className="stat-title text-slate-500 dark:text-zinc-400 text-xs font-semibold">Dự án đang chạy</div>
              <div className="stat-value text-blue-600 dark:text-blue-400 text-2xl font-bold">{projects.length}</div>
              <div className="stat-desc text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>{projects.filter(p => p.status === 'Đang tiến hành' || p.status === 'Đang triển khai').length} tiến hành</span>
              </div>
            </div>

            <div
              onClick={() => setActiveModule('tasks')}
              className="stat cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="stat-figure text-indigo-600 dark:text-indigo-400">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-zinc-800 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="stat-title text-slate-500 dark:text-zinc-400 text-xs font-semibold">Công việc cần xử lý</div>
              <div className="stat-value text-indigo-600 dark:text-indigo-400 text-2xl font-bold">
                {tasks.filter(t => t.status !== 'Hoàn thành' && t.status !== 'Đã hoàn thành').length}
              </div>
              <div className="stat-desc text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                {tasks.filter(t => t.priority === 'Khẩn cấp' || t.priority === 'Cao').length} việc ưu tiên cao
              </div>
            </div>

            <div
              onClick={() => setActiveModule('data-repo')}
              className="stat cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="stat-figure text-amber-600 dark:text-amber-400">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-zinc-800 flex items-center justify-center">
                  <Folder className="w-5 h-5" />
                </div>
              </div>
              <div className="stat-title text-slate-500 dark:text-zinc-400 text-xs font-semibold">Kho tài liệu RAG</div>
              <div className="stat-value text-amber-600 dark:text-amber-400 text-2xl font-bold">{documents.length}</div>
              <div className="stat-desc text-blue-600 dark:text-blue-400 font-semibold mt-0.5">Tự động Index Vector</div>
            </div>

            <div
              onClick={() => setActiveModule('meetings')}
              className="stat cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="stat-figure text-emerald-600 dark:text-emerald-400">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-zinc-800 flex items-center justify-center">
                  <Users2 className="w-5 h-5" />
                </div>
              </div>
              <div className="stat-title text-slate-500 dark:text-zinc-400 text-xs font-semibold">Phòng họp & Biên bản</div>
              <div className="stat-value text-emerald-600 dark:text-emerald-400 text-2xl font-bold">{meetings.length}</div>
              <div className="stat-desc text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">AI Transcript sẵn sàng</div>
            </div>
          </div>

          {/* 2-Column: Active Projects with AI Insights & Urgent Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Projects with AI Quick Actions */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm tracking-tight flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Dự án trọng điểm & Phân tích AI</span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">Tình trạng thực thi và trợ lý AI tóm tắt rủi ro</p>
                </div>
                <button
                  onClick={() => setActiveModule('projects')}
                  className="btn btn-link btn-xs text-blue-600 dark:text-blue-400 no-underline hover:underline p-0 flex items-center gap-1"
                >
                  <span>Xem tất cả ({projects.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {projects.slice(0, 3).map((proj) => (
                  <div
                    key={proj.id}
                    className="card bg-white dark:bg-zinc-900 p-4.5 rounded-box border border-slate-200 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-zinc-700 transition-all group space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {proj.name}
                          </h4>
                          <span
                            className={`badge badge-sm font-bold ${
                              proj.status === 'Đang triển khai' || proj.status === 'Đang tiến hành'
                                ? 'badge-primary'
                                : proj.status === 'Hoàn thành'
                                ? 'badge-success text-white'
                                : 'badge-error text-white'
                            }`}
                          >
                            {proj.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{proj.description}</p>
                      </div>

                      <button
                        onClick={() => handleAskAIAboutProject(proj.name)}
                        className="btn btn-xs btn-outline btn-primary gap-1.5 shrink-0"
                        title="Yêu cầu AI tóm tắt dự án"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>AI Tóm tắt</span>
                      </button>
                    </div>

                    {/* Progress Bar & Meta */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-zinc-400">Tiến độ hoàn thành</span>
                        <span className="font-bold text-slate-800 dark:text-zinc-200">{proj.progress}%</span>
                      </div>
                      <progress
                        className={`progress w-full h-2 ${
                          proj.progress >= 80
                            ? 'progress-success'
                            : proj.progress >= 50
                            ? 'progress-primary'
                            : 'progress-warning'
                        }`}
                        value={proj.progress}
                        max="100"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{typeof proj.members === 'number' ? proj.members : (Array.isArray(proj.members) ? proj.members.length : 4)} thành viên</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Hạn: {proj.deadline}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Urgent Tasks & Next Meetings */}
            <div className="space-y-6">
              {/* Urgent Tasks */}
              <div className="card bg-white dark:bg-zinc-900 p-5 rounded-box border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Nhiệm vụ ưu tiên cao</span>
                  </h3>
                  <button
                    onClick={() => setActiveModule('tasks')}
                    className="btn btn-link btn-xs text-blue-600 dark:text-blue-400 no-underline hover:underline p-0"
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="space-y-2.5">
                  {tasks
                    .filter((t) => t.priority === 'Khẩn cấp' || t.priority === 'Cao')
                    .slice(0, 4)
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setActiveModule('tasks')}
                        className="p-3 bg-slate-50 dark:bg-zinc-800/80 hover:bg-blue-50/50 dark:hover:bg-zinc-800 rounded-box border border-slate-200/60 dark:border-zinc-700/60 transition-colors cursor-pointer space-y-1.5 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            {t.title}
                          </h4>
                          <span className="badge badge-xs badge-error text-white font-bold shrink-0">
                            {t.priority}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500">
                          <span>{t.projectName || t.project}</span>
                          <span>Hạn: {t.deadline || t.dueDate || 'Hôm nay'}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Upcoming Meetings */}
              <div className="card bg-white dark:bg-zinc-900 p-5 rounded-box border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Lịch họp hôm nay</span>
                  </h3>
                  <button
                    onClick={() => setActiveModule('meetings')}
                    className="btn btn-link btn-xs text-blue-600 dark:text-blue-400 no-underline hover:underline p-0"
                  >
                    Phòng họp
                  </button>
                </div>

                <div className="space-y-2.5">
                  {meetings.slice(0, 2).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setActiveModule('meetings')}
                      className="p-3 bg-slate-50 dark:bg-zinc-800/80 rounded-box border border-slate-200/60 dark:border-zinc-700/60 space-y-1 cursor-pointer hover:border-blue-400 dark:hover:border-zinc-700 transition-colors"
                    >
                      <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-xs line-clamp-1">{m.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                        <span>{m.time} ({m.room})</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
