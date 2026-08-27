import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
  const { addProject, showToast } = useApp();
  const { data: fetchedDepartments = [] } = useDepartmentsQuery();

  const availableDepartments = useMemo(() => {
    if (fetchedDepartments.length > 0) return fetchedDepartments;
    return DEFAULT_DEPARTMENTS;
  }, [fetchedDepartments]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: yupResolver(projectYupSchema) as any,
    defaultValues: {
      name: '',
      lead: 'Anh Khoa',
      department: 'Phòng Sản phẩm',
      deadline: '2024-07-30',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: '',
        lead: 'Anh Khoa',
        department: availableDepartments[0]?.name || 'Phòng Sản phẩm',
        deadline: '2024-07-30',
        description: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: ProjectFormData) => {
    addProject({
      name: data.name,
      lead: data.lead,
      progress: 0,
      status: 'Đang triển khai',
      deadline: data.deadline,
      taskCount: 0,
      completedTasks: 0,
      membersCount: 4,
    });

    showToast(`Đã tạo dự án "${data.name}" thành công!`, 'success');
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo dự án mới">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Tên dự án <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('name')}
            placeholder="Ví dụ: Nâng cấp hệ thống AI RAG Phase 3"
            className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
              errors.name
                ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.name.message}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Quản lý dự án (Project Lead) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('lead')}
              placeholder="VD: Anh Khoa"
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
                errors.lead
                  ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            />
            {errors.lead && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.lead.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Phòng ban phụ trách <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('department')}
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer ${
                errors.department
                  ? 'border-rose-400 focus:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            >
              {availableDepartments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.department.message}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Hạn hoàn thành <span className="text-rose-500">*</span>
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

        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Mô tả mục tiêu dự án</label>
          <textarea
            rows={3}
            {...register('description')}
            placeholder="Mô tả phạm vi và mục tiêu chính của dự án..."
            className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 resize-none"
          />
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
            Xác nhận khởi tạo
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default ProjectModal;
