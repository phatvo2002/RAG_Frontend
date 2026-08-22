import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/button';
import { CustomTable, Column } from '@/components/customTable';
import { TaskModal } from './TaskModal';
import { TaskItem, TaskStatus, TaskPriority } from '@/types';
import {
  Plus,
  Search,
  Filter,
  List,
  Kanban,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  Sparkles,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

const getAssigneeName = (assignee: any): string => {
  if (!assignee) return 'Chưa phân công';
  if (typeof assignee === 'string') return assignee;
  if (typeof assignee === 'object' && assignee.name) return assignee.name;
  return String(assignee);
};

export const TasksPage: React.FC = () => {
  const { tasks, updateTaskStatus, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const assigneeName = getAssigneeName(t.assignee);
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      assigneeName.toLowerCase().includes(search.toLowerCase()) ||
      (t.project && t.project.toLowerCase().includes(search.toLowerCase())) ||
      (t.projectName && t.projectName.toLowerCase().includes(search.toLowerCase()));
    if (priorityFilter === 'all') return matchesSearch;
    return matchesSearch && t.priority === priorityFilter;
  });

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'Cần làm', label: 'Cần làm', color: 'border-slate-300' },
    { id: 'Đang làm', label: 'Đang làm', color: 'border-blue-500' },
    { id: 'Review', label: 'Đang review', color: 'border-amber-500' },
    { id: 'Hoàn thành', label: 'Đã hoàn thành', color: 'border-emerald-500' }
  ];

  const getPriorityBadgeVariant = (priority: TaskPriority) => {
    if (priority === 'Khẩn cấp') return 'danger';
    if (priority === 'Cao') return 'warning';
    if (priority === 'Trung bình') return 'primary';
    return 'secondary';
  };

  // Cấu hình Column cho CustomTable
  const taskColumns: Column<TaskItem>[] = [
    {
      header: 'Công việc',
      render: (task) => (
        <span className="font-semibold text-slate-800">{task.title}</span>
      ),
    },
    {
      header: 'Dự án',
      render: (task) => (
        <span className="text-blue-600 font-medium">{task.project || task.projectName || 'Dự án chung'}</span>
      ),
    },
    {
      header: 'Người thực hiện',
      render: (task) => (
        <div className="flex items-center gap-1.5 text-slate-700">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{getAssigneeName(task.assignee)}</span>
        </div>
      ),
    },
    {
      header: 'Ưu tiên',
      render: (task) => (
        <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
      ),
    },
    {
      header: 'Trạng thái',
      render: (task) => (
        <span className="font-semibold text-slate-700">{task.status}</span>
      ),
    },
    {
      header: 'Hạn chót',
      render: (task) => (
        <span className="text-slate-500">{task.deadline || task.dueDate || 'Hôm nay'}</span>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <Header title="Công việc" subTitle="Bảng điều khiển công việc Kanban và phân chia nhiệm vụ theo dự án" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header Action & Filter Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm công việc, người thực hiện..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 shadow-2xs"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 shadow-2xs"
            >
              <option value="all">Tất cả ưu tiên</option>
              <option value="Khẩn cấp">Khẩn cấp</option>
              <option value="Cao">Cao</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Thấp">Thấp</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-white shadow-2xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Danh sách</span>
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo việc mới</span>
            </button>
          </div>
        </div>

        {/* Kanban Board View */}
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => {
                if (col.id === 'Review') return t.status === 'Review' || t.status === 'Đang review';
                if (col.id === 'Hoàn thành') return t.status === 'Hoàn thành' || t.status === 'Đã hoàn thành';
                return t.status === col.id;
              });

              return (
                <div key={col.id} className="bg-slate-100/70 rounded-2xl p-4 space-y-3">
                  <div className={`flex items-center justify-between border-t-2 pt-2 ${col.color}`}>
                    <span className="text-xs font-bold text-slate-800">{col.label}</span>
                    <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3 hover:border-blue-300 transition-all cursor-pointer group"
                        onClick={() => showToast(`Chi tiết công việc: ${task.title}`, 'info')}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-medium text-blue-600 truncate">
                            {task.project || task.projectName || 'Dự án chung'}
                          </span>
                          <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                        </div>

                        <h4 className="font-bold text-slate-800 text-xs leading-snug group-hover:text-blue-600">
                          {task.title}
                        </h4>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{getAssigneeName(task.assignee)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{task.deadline || task.dueDate || 'Hôm nay'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View (TÁI SỬ DỤNG CUSTOMTABLE) */
          <CustomTable<TaskItem>
            columns={taskColumns}
            data={filteredTasks}
            keyExtractor={(task) => task.id}
            onRowClick={(task) => showToast(`Chi tiết công việc: ${task.title}`, 'info')}
            emptyText="Không tìm thấy công việc nào"
          />
        )}
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
export default TasksPage;
