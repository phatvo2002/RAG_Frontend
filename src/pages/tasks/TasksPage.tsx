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
  User,
  MoreHorizontal
} from 'lucide-react';

const getAssigneeName = (assignee: any, language: 'en' | 'vi'): string => {
  if (!assignee) return language === 'vi' ? 'Chưa phân công' : 'Unassigned';
  if (typeof assignee === 'string') return assignee;
  if (typeof assignee === 'object' && assignee.name) return assignee.name;
  return String(assignee);
};

export const TasksPage: React.FC = () => {
  const { tasks, updateTaskStatus, showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const taskStatusLabel = (status: string) => ({ 'Cần làm': tr('To do', 'Cần làm'), 'Đang làm': tr('In progress', 'Đang làm'), 'Review': tr('In review', 'Đang review'), 'Hoàn thành': tr('Completed', 'Đã hoàn thành') }[status] ?? status);
  const priorityLabel = (priority: string) => ({ 'Khẩn cấp': tr('Urgent', 'Khẩn cấp'), 'Cao': tr('High', 'Cao'), 'Trung bình': tr('Medium', 'Trung bình'), 'Thấp': tr('Low', 'Thấp') }[priority] ?? priority);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    const assigneeName = getAssigneeName(t.assignee, language);
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      assigneeName.toLowerCase().includes(search.toLowerCase()) ||
      (t.project && t.project.toLowerCase().includes(search.toLowerCase())) ||
      (t.projectName && t.projectName.toLowerCase().includes(search.toLowerCase()));
    if (priorityFilter === 'all') return matchesSearch;
    return matchesSearch && t.priority === priorityFilter;
  });

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'Cần làm', label: taskStatusLabel('Cần làm'), color: 'border-slate-300 dark:border-zinc-700' },
    { id: 'Đang làm', label: taskStatusLabel('Đang làm'), color: 'border-blue-500' },
    { id: 'Review', label: taskStatusLabel('Review'), color: 'border-amber-500' },
    { id: 'Hoàn thành', label: taskStatusLabel('Hoàn thành'), color: 'border-emerald-500' }
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
      header: tr('Task', 'Công việc'),
      render: (task) => (
        <span className="font-semibold text-slate-800 dark:text-zinc-100">{task.title}</span>
      ),
    },
    {
      header: tr('Project', 'Dự án'),
      render: (task) => (
        <span className="text-blue-600 dark:text-blue-400 font-medium">{task.project || task.projectName || tr('General project', 'Dự án chung')}</span>
      ),
    },
    {
      header: tr('Assignee', 'Người thực hiện'),
      render: (task) => (
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
          <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
          <span>{getAssigneeName(task.assignee, language)}</span>
        </div>
      ),
    },
    {
      header: tr('Priority', 'Ưu tiên'),
      render: (task) => (
        <Badge variant={getPriorityBadgeVariant(task.priority)}>{priorityLabel(task.priority)}</Badge>
      ),
    },
    {
      header: tr('Status', 'Trạng thái'),
      render: (task) => (
        <span className="font-semibold text-slate-700 dark:text-zinc-300">{taskStatusLabel(task.status)}</span>
      ),
    },
    {
      header: tr('Deadline', 'Hạn chót'),
      render: (task) => (
        <span className="text-slate-500 dark:text-zinc-400">{task.deadline || task.dueDate || tr('Today', 'Hôm nay')}</span>
      ),
    },
    {
      header: tr('Actions', 'Thao tác'),
      className: 'text-right',
      render: (task) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            showToast(tr(`Options for ${task.title}`, `Tùy chọn ${task.title}`), 'info');
          }}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 p-1 cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="nexora-page flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black transition-colors">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            {tr('Tasks', 'Công việc & Nhiệm vụ')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {tr('Kanban board for progress and personal task assignments', 'Bảng Kanban theo dõi tiến độ và phân công công việc cá nhân')}
          </p>
        </div>

        {/* Header Search & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder={tr('Search tasks, assignees...', 'Tìm kiếm công việc, người thực hiện...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-xs text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
            >
              <option value="all">{tr('All priorities', 'Tất cả ưu tiên')}</option>
              <option value="Khẩn cấp">{priorityLabel('Khẩn cấp')}</option>
              <option value="Cao">{priorityLabel('Cao')}</option>
              <option value="Trung bình">{priorityLabel('Trung bình')}</option>
              <option value="Thấp">{priorityLabel('Thấp')}</option>
            </select>

            <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded p-0.5 bg-white dark:bg-zinc-900">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
                }`}
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-slate-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-2xs shadow-blue-500/20 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{tr('Create task', 'Tạo việc')}</span>
            </button>
          </div>
        </div>

        {/* View Content: Kanban vs List */}
        {viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);

              return (
                <div key={col.id} className="bg-slate-100/60 dark:bg-zinc-900/60 p-3 rounded-lg border border-slate-200/60 dark:border-zinc-800/80 space-y-3">
                  <div className={`flex items-center justify-between pb-2 border-b-2 ${col.color}`}>
                    <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">{col.label}</span>
                    <span className="text-[11px] font-semibold bg-white dark:bg-zinc-800 px-2 py-0.5 rounded text-slate-600 dark:text-zinc-300 shadow-2xs">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 min-h-[300px]">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-2 hover:border-blue-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
                        onClick={() => showToast(tr(`Task details: ${task.title}`, `Chi tiết công việc: ${task.title}`), 'info')}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Badge variant={getPriorityBadgeVariant(task.priority)}>
                            {priorityLabel(task.priority)}
                          </Badge>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">{task.deadline || task.dueDate}</span>
                        </div>

                        <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-50 dark:border-zinc-800">
                          <span className="truncate max-w-[120px] text-blue-600 dark:text-blue-400 font-medium">
                            {task.project || task.projectName || tr('General', 'Chung')}
                          </span>
                          <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-zinc-300">
                            <User className="w-3 h-3 text-slate-400 dark:text-zinc-500" />
                            <span>{getAssigneeName(task.assignee, language)}</span>
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
          <CustomTable<TaskItem>
            columns={taskColumns}
            data={filteredTasks}
            keyExtractor={(task) => task.id}
            onRowClick={(task) => showToast(tr(`Details: ${task.title}`, `Chi tiết: ${task.title}`), 'info')}
            emptyText={tr('No tasks in the list', 'Không có công việc nào trong danh sách')}
          />
        )}
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
export default TasksPage;
