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
  Filter,
  CheckCircle2,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  BarChart2,
  ListTodo,
  FileText,
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <Header title="Dự án" subTitle="Quản lý lộ trình, tiến độ và khối lượng công việc các dự án" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Projects Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Action & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 shadow-2xs"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đang triển khai">Đang triển khai</option>
                <option value="Đang tiến hành">Đang tiến hành</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Chậm tiến độ">Chậm tiến độ</option>
              </select>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
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
                  className={`bg-white rounded-2xl border p-5 transition-all cursor-pointer space-y-4 ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
                      : 'border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                          {project.code || project.key || 'PROJ'}
                        </span>
                        <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight hover:text-blue-600">
                        {project.name}
                      </h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        showToast(`Tùy chọn ${project.name}`, 'info');
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {project.description || 'Dự án trọng điểm phát triển hệ thống và tự động hóa quy trình nghiệp vụ.'}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Tiến độ</span>
                      <span className="text-blue-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.membersCount || 4} thành viên</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{project.deadline || project.dueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane */}
        {selectedProject && (
          <aside className="w-80 lg:w-96 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto hidden md:flex select-none text-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Chi tiết dự án
                </span>
                <button
                  onClick={() => handleAskAIAboutProject(selectedProject)}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Hỏi AI về dự án</span>
                </button>
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {selectedProject.name}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {selectedProject.description || 'Dự án chiến lược của công ty nhằm nâng cao năng lực ứng dụng trí tuệ nhân tạo.'}
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="font-bold text-slate-800">Thông tin chung</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Trưởng dự án:</span>
                  <span className="font-semibold text-slate-800">{selectedProject.lead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trạng thái:</span>
                  <Badge variant={getStatusBadgeVariant(selectedProject.status)}>
                    {selectedProject.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hạn chót:</span>
                  <span className="font-semibold text-slate-800">{selectedProject.deadline || selectedProject.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tổng công việc:</span>
                  <span className="font-semibold text-slate-800">{selectedProject.taskCount || 12} tasks</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800">Công việc của dự án</h4>
                <button
                  onClick={() => setActiveModule('tasks')}
                  className="text-blue-600 hover:underline text-[11px] font-semibold cursor-pointer"
                >
                  Xem bảng Kanban
                </button>
              </div>

              <div className="space-y-2">
                {tasks
                  .filter((t) => t.projectId === selectedProject.id || t.projectName === selectedProject.name)
                  .slice(0, 4)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1"
                    >
                      <p className="font-semibold text-slate-800 truncate">{task.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{typeof task.assignee === 'object' && task.assignee !== null ? (task.assignee as any).name || 'Chưa phân công' : String(task.assignee || 'Chưa phân công')}</span>
                        <span className="font-medium text-slate-600">{task.status}</span>
                      </div>
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

