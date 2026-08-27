import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { departmentYupSchema, DepartmentFormData, Department } from '@/types';
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from '@/api/departments.api';
import { Building, Phone, MapPin, User, AlertCircle } from 'lucide-react';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentToEdit?: Department | null;
  onSuccessToast?: (msg: string) => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  departmentToEdit,
  onSuccessToast,
}) => {
  const { showToast } = useApp();
  const isEditMode = Boolean(departmentToEdit);

  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: yupResolver(departmentYupSchema) as any,
    defaultValues: {
      name: '',
      code: '',
      phone: '',
      address: '',
      head: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (departmentToEdit) {
        reset({
          name: departmentToEdit.name || '',
          code: departmentToEdit.code || '',
          phone: departmentToEdit.phone || '',
          address: departmentToEdit.address || '',
          head: departmentToEdit.head || departmentToEdit.manager || '',
          description: departmentToEdit.description || '',
        });
      } else {
        reset({
          name: '',
          code: '',
          phone: '',
          address: '',
          head: '',
          description: '',
        });
      }
    }
  }, [isOpen, departmentToEdit]);

  if (!isOpen) return null;

  const onSubmit = (data: DepartmentFormData) => {
    const toastCallback = onSuccessToast || showToast;

    if (isEditMode && departmentToEdit) {
      updateMutation.mutate(
        {
          departmentId: departmentToEdit.id,
          data: {
            name: data.name,
            code: data.code || data.name.slice(0, 4).toUpperCase(),
            phone: data.phone || '',
            address: data.address || '',
            head: data.head || '',
            manager: data.head || '',
            description: data.description || '',
          },
        },
        {
          onSuccess: (updatedDept) => {
            toastCallback(`Cập nhật phòng ban "${updatedDept.name}" thành công!`, 'success');
            reset();
            onClose();
          },
          onError: (err: any) => {
            setError('root', { message: err.message || 'Không thể cập nhật phòng ban' });
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: data.name,
          code: data.code || data.name.slice(0, 4).toUpperCase(),
          phone: data.phone || '',
          address: data.address || '',
          head: data.head || 'Chưa phân công',
          manager: data.head || 'Chưa phân công',
          description: data.description || '',
        },
        {
          onSuccess: (createdDept) => {
            toastCallback(`Đã thêm phòng ban "${createdDept.name}" thành công!`, 'success');
            reset();
            onClose();
          },
          onError: (err: any) => {
            setError('root', { message: err.message || 'Không thể tạo mới phòng ban' });
          },
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
        {errors.root && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Tên phòng ban <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Building className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                {...register('name')}
                placeholder="VD: Phòng Công nghệ Thông tin"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none text-xs ${
                  errors.name
                    ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                    : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Mã phòng ban</label>
            <input
              type="text"
              {...register('code')}
              placeholder="VD: CNTT"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Số điện thoại</label>
            <div className="relative flex items-center">
              <Phone className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                {...register('phone')}
                placeholder="VD: 0274 374 0530"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none text-xs ${
                  errors.phone
                    ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                    : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Địa chỉ / Vị trí</label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                {...register('address')}
                placeholder="VD: Tầng 4, Tòa A"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Trưởng phòng / Quản lý</label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              {...register('head')}
              placeholder="VD: Nguyễn Văn B"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Mô tả chức năng</label>
          <div className="relative flex items-start">
            <textarea
              rows={2}
              {...register('description')}
              placeholder="Mô tả ngắn về nhiệm vụ của phòng ban..."
              className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-2xs shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {isPending && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{isEditMode ? 'Lưu thay đổi' : 'Tạo phòng ban'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default DepartmentModal;
