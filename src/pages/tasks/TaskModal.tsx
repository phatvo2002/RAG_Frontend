import React, { useState } from 'react';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { TaskPriority, TaskStatus } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, projects, users } = useApp();
  const [title, setTitle] = useState('');
  const [assignee, setAssignee] = useState(users[0]?.name || 'Đức Huy');
  const [project, setProject] = useState(projects[0]?.name || 'NEXORA Platform');
  const [priority, setPriority] = useState<TaskPriority>('Cao');
  const [status, setStatus] = useState<TaskStatus>('Cần làm');
  const [deadline, setDeadline] = useState('2024-05-25');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addTask({
      title,
      assignee,
      project,
      priority,
      status,
      deadline
    });

    setTitle('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo công việc mới">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Tên công việc <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Kiểm thử hiệu năng API RAG với 1000 concurrent users"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Dự án liên quan</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Người thực hiện</label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Mức độ ưu tiên</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
            >
              <option value="Khẩn cấp">Khẩn cấp</option>
              <option value="Cao">Cao</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Thấp">Thấp</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
            >
              <option value="Cần làm">Cần làm</option>
              <option value="Đang làm">Đang làm</option>
              <option value="Review">Review</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Hạn chót</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-2xs shadow-blue-500/20 cursor-pointer transition-colors"
          >
            Tạo công việc
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default TaskModal;
