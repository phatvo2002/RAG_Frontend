import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { TaskPriority, TaskStatus, taskYupSchema, TaskFormData } from '@/types';
import { AlertCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, projects, users, showToast } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: yupResolver(taskYupSchema) as any,
    defaultValues: {
      title: '',
      assignee: users[0]?.name || 'Đức Huy',
      project: projects[0]?.name || 'NEXORA Platform',
      priority: 'Cao',
      status: 'Cần làm',
      deadline: '2024-05-25',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        assignee: users[0]?.name || 'Đức Huy',
        project: projects[0]?.name || 'NEXORA Platform',
        priority: 'Cao',
        status: 'Cần làm',
        deadline: '2024-05-25',
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: TaskFormData) => {
    addTask({
      title: data.title,
      assignee: data.assignee,
      project: data.project,
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      deadline: data.deadline,
    });

    showToast(`Đã tạo công việc "${data.title}" thành công!`, 'success');
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo công việc mới">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Tên công việc <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="Ví dụ: Kiểm thử hiệu năng API RAG với 1000 concurrent users"
            className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
              errors.title
                ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.title.message}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Dự án liên quan <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('project')}
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer ${
                errors.project
                  ? 'border-rose-400 focus:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.project && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.project.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Người thực hiện <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('assignee')}
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer ${
                errors.assignee
                  ? 'border-rose-400 focus:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            >
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
            {errors.assignee && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.assignee.message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Mức độ ưu tiên</label>
            <select
              {...register('priority')}
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
              {...register('status')}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
            >
              <option value="Cần làm">Cần làm</option>
              <option value="Đang làm">Đang làm</option>
              <option value="Review">Review</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Hạn chót <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register('deadline')}
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer ${
                errors.deadline
                  ? 'border-rose-400 focus:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            />
            {errors.deadline && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.deadline.message}</span>
              </p>
            )}
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
