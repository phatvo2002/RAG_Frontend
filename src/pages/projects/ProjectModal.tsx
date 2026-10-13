import React, { useEffect, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { projectYupSchema, ProjectFormData } from '@/types';
import { useDepartmentsQuery } from '@/api/departments.api';
import { AlertCircle } from 'lucide-react';

const DEFAULT_DEPARTMENTS = [
  { id: 'dept_1', name: 'Công nghệ thông tin' },
  { id: 'dept_2', name: 'Phòng Sản phẩm' },
  { id: 'dept_3', name: 'Phòng Marketing' },
  { id: 'dept_4', name: 'Phòng Nhân sự' },
  { id: 'dept_5', name: 'Ban Giám đốc' },
];

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject, showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const { data: fetchedDepartments = [] } = useDepartmentsQuery();

  const availableDepartments = useMemo(() => {
    if (fetchedDepartments.length > 0) return fetchedDepartments;
    return DEFAULT_DEPARTMENTS;
  }, [fetchedDepartments]);

  const form = useForm({
    defaultValues: {
      name: '',
      lead: 'Anh Khoa',
      department: 'Phòng Sản phẩm',
      deadline: '2024-07-30',
      description: '',
    } as ProjectFormData,
    validators: {
      onSubmit: ({ value }) => {
        try {
          projectYupSchema.validateSync(value, { abortEarly: false });
          return undefined;
        } catch (err: any) {
          return err.message || tr('Invalid project data', 'Dữ liệu dự án không hợp lệ');
        }
      },
    },
    onSubmit: async ({ value }) => {
      addProject({
        name: value.name,
        lead: value.lead,
        progress: 0,
        status: 'Đang triển khai',
        deadline: value.deadline,
        taskCount: 0,
        completedTasks: 0,
        membersCount: 4,
      });

      showToast(tr(`Project "${value.name}" created successfully!`, `Đã tạo dự án "${value.name}" thành công!`), 'success');
      form.reset();
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset();
      form.setFieldValue('department', availableDepartments[0]?.name || 'Phòng Sản phẩm');
    }
  }, [isOpen, availableDepartments]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tr('Create new project', 'Tạo dự án mới')}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4 text-xs"
      >
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? tr('Project name is required', 'Tên dự án không được để trống') : undefined),
          }}
        >
          {(field) => {
            const errorMessage = field.state.meta.errors?.[0] ?? null;
            const hasError = Boolean(errorMessage);

            return (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {tr('Project name', 'Tên dự án')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={tr('Example: Upgrade the AI RAG system for Phase 3', 'Ví dụ: Nâng cấp hệ thống AI RAG Phase 3')}
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
            name="lead"
            validators={{
              onChange: ({ value }) => (!value?.trim() ? tr('Project lead is required', 'Quản lý dự án không được để trống') : undefined),
            }}
          >
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0] ?? null;
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    {tr('Project lead', 'Quản lý dự án (Project Lead)')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="VD: Anh Khoa"
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
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

          <form.Field name="department">
            {(field) => (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {tr('Responsible department', 'Phòng ban phụ trách')} <span className="text-rose-500">*</span>
                </label>
                <select
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer border-slate-200 dark:border-zinc-700 focus:border-blue-600"
                >
                  {availableDepartments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field
            name="deadline"
            validators={{
              onChange: ({ value }) => (!value ? tr('Due date is required', 'Hạn hoàn thành không được để trống') : undefined),
            }}
          >
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0] ?? null;
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    {tr('Due date', 'Hạn hoàn thành')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
                      hasError
                        ? 'border-rose-400 focus:border-rose-600'
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
        </div>

        <div>
          <form.Field name="description">
            {(field) => (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {tr('Project description', 'Mô tả dự án')}
                </label>
                <textarea
                  rows={3}
                  name={field.name}
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={tr('Describe goals, technical requirements, and project scope...', 'Mô tả mục tiêu, yêu cầu công nghệ và phạm vi dự án...')}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 resize-none"
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
            {tr('Create project', 'Tạo dự án')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
