import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/button';
import { ProjectModal } from './ProjectModal';
import { Project } from '@/types';
import {
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  ListTodo,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { projects, tasks, addChatMessage, setActiveModule, showToast } = useApp();
  const [selectedProject, setSelectedProject] = useState<Project | null>(projects[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'Đang triển khai' || status === 'Đang tiến hành') return 'primary';
    if (status === 'Hoàn thành' || status === 'Đã hoàn thành') return 'success';
    if (status === 'Chậm tiến độ') return 'danger';
    return 'warning';
  };

  const handleAskAIAboutProject = (proj: Project) => {
    setActiveModule('chat');
    addChatMessage({
      sender: 'user',
      text: `Phân tích tiến độ và đề xuất giải pháp thúc đẩy dự án "${proj.name}".`
    });
    showToast(`Đã chuyển sang Trò chuyện AI với ngữ cảnh dự án "${proj.name}"`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black transition-colors">
      <Header title="Dự án" subTitle="Quản lý lộ trình, tiến độ và khối lượng công việc các dự án" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Projects Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
          {/* Header Action & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đang triển khai">Đang triển khai</option>
                <option value="Đang tiến hành">Đang tiến hành</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Chậm tiến độ">Chậm tiến độ</option>
              </select>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-2xs shadow-blue-500/20 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo dự án</span>
              </button>
            </div>
          </div>

          {/* Projects Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const isSelected = selectedProject?.id === project.id;
              const projectTasks = tasks.filter((t) => t.projectId === project.id || t.projectName === project.name);

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`bg-white dark:bg-zinc-900 p-5 rounded-lg border shadow-2xs space-y-4 hover:shadow-xs transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'border-blue-600 dark:border-blue-500 ring-1 ring-blue-600/30'
                      : 'border-slate-200/80 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500">{project.lead || 'Anh Khoa'}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-zinc-400">Tiến độ</span>
                      <span className="font-bold text-slate-800 dark:text-zinc-200">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Tasks & Deadline Meta */}
                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>{projectTasks.length || 6} công việc</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                      <span>{project.deadline}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        {selectedProject && (
          <aside className="w-96 bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto hidden xl:flex select-none text-xs transition-colors">
            <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <Badge variant={getStatusBadgeVariant(selectedProject.status)}>
                  {selectedProject.status}
                </Badge>
                <button
                  onClick={() => showToast(`Tùy chọn ${selectedProject.name}`, 'info')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 cursor-pointer"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base leading-tight">
                {selectedProject.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {selectedProject.description || 'Dự án trọng điểm phát triển hệ thống AI Trợ lý nội bộ tích hợp RAG và phân tích dữ liệu đa nguồn.'}
              </p>
            </div>

            {/* AI Action Quick Button */}
            <button
              onClick={() => handleAskAIAboutProject(selectedProject)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Hỏi AI về dự án này</span>
            </button>

            {/* Project Details list */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
                Thông tin chi tiết
              </h4>

              <div className="space-y-2.5">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-zinc-800">
                  <span className="text-slate-400 dark:text-zinc-500">Quản lý</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedProject.lead || 'Anh Khoa'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-zinc-800">
                  <span className="text-slate-400 dark:text-zinc-500">Hạn chót</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedProject.deadline}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-zinc-800">
                  <span className="text-slate-400 dark:text-zinc-500">Thành viên</span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">{typeof selectedProject.members === 'number' ? selectedProject.members : (Array.isArray(selectedProject.members) ? selectedProject.members.length : 4)} người</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-50 dark:border-zinc-800">
                  <span className="text-slate-400 dark:text-zinc-500">Tiến độ tổng</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{selectedProject.progress}%</span>
                </div>
              </div>
            </div>

            {/* Project Tasks mini list */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
                  Công việc liên quan
                </h4>
                <button
                  onClick={() => setActiveModule('tasks')}
                  className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] font-semibold cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="space-y-2">
                {tasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded space-y-1 hover:border-blue-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate pr-2">{task.title}</span>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0">{task.priority}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">{task.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
export default ProjectsPage;
