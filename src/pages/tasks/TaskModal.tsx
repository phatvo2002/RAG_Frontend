import React, { useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { TaskPriority, TaskStatus, taskYupSchema, TaskFormData } from '@/types';
import { AlertCircle } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask, projects, users, showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;

  const form = useForm({
    defaultValues: {
      title: '',
      assignee: users[0]?.name || 'Đức Huy',
      project: projects[0]?.name || 'NEXORA Platform',
      priority: 'Cao' as TaskPriority,
      status: 'Cần làm' as TaskStatus,
      deadline: '2024-05-25',
    } as TaskFormData,
    validators: {
      onSubmit: ({ value }) => {
        try {
          taskYupSchema.validateSync(value, { abortEarly: false });
          return undefined;
        } catch (err: any) {
          return err.message || tr('Invalid task data', 'Dữ liệu công việc không hợp lệ');
        }
      },
    },
    onSubmit: async ({ value }) => {
      addTask({
        title: value.title,
        assignee: value.assignee,
        project: value.project,
        priority: value.priority as TaskPriority,
        status: value.status as TaskStatus,
        deadline: value.deadline,
      });

      showToast(tr(`Task "${value.title}" created successfully!`, `Đã tạo công việc "${value.title}" thành công!`), 'success');
      form.reset();
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      if (users[0]?.name) form.setFieldValue('assignee', users[0].name);
      if (projects[0]?.name) form.setFieldValue('project', projects[0].name);
    }
  }, [isOpen, users, projects]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tr('Create new task', 'Tạo công việc mới')}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4 text-xs"
      >
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? tr('Task name is required', 'Tên công việc không được để trống') : undefined),
          }}
        >
          {(field) => {
            const errorMessage = field.state.meta.errors?.[0] ?? null;
            const hasError = Boolean(errorMessage);

            return (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {tr('Task name', 'Tên công việc')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={tr('Example: Test RAG API performance with 1,000 concurrent users', 'Ví dụ: Kiểm thử hiệu năng API RAG với 1000 concurrent users')}
                  className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                    hasError
                      ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                      : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
                  }`}
                />
                {hasError && (
                  <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </p>
                )}
              </div>
            );
          }}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="project"
            validators={{
              onChange: ({ value }) => (!value ? tr('Select a project', 'Vui lòng chọn dự án') : undefined),
            }}
          >
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0] ?? null;
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    {tr('Related project', 'Dự án liên quan')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer ${
                      hasError
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
                  {hasError && (
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>

          <form.Field
            name="assignee"
            validators={{
              onChange: ({ value }) => (!value ? tr('Select an assignee', 'Vui lòng chọn người thực hiện') : undefined),
            }}
          >
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0] ?? null;
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    {tr('Assignee', 'Người thực hiện')} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer ${
                      hasError
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
                  {hasError && (
                    <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </p>
                  )}
                </div>
              );
            }}
          </form.Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <form.Field name="priority">
            {(field) => (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">{tr('Priority', 'Mức độ ưu tiên')}</label>
                <select
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
                >
                  <option value="Khẩn cấp">{tr('Urgent', 'Khẩn cấp')}</option>
                  <option value="Cao">{tr('High', 'Cao')}</option>
                  <option value="Trung bình">{tr('Medium', 'Trung bình')}</option>
                  <option value="Thấp">{tr('Low', 'Thấp')}</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="status">
            {(field) => (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">{tr('Status', 'Trạng thái')}</label>
                <select
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
                >
                  <option value="Cần làm">{tr('To do', 'Cần làm')}</option>
                  <option value="Đang thực hiện">{tr('In progress', 'Đang thực hiện')}</option>
                  <option value="Đang đánh giá">{tr('In review', 'Đang đánh giá')}</option>
                  <option value="Hoàn thành">{tr('Completed', 'Hoàn thành')}</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="deadline">
            {(field) => (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">{tr('Due date', 'Hạn hoàn thành')}</label>
                <input
                  type="date"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                />
              </div>
            )}
          </form.Field>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {tr('Cancel', 'Hủy')}
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            {tr('Create task', 'Tạo công việc')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
