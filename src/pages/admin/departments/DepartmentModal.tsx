import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { departmentYupSchema, DepartmentFormData, Department } from '@/types';
import { useCreateDepartmentMutation, useUpdateDepartmentMutation, useDepartmentsQuery } from '@/api/departments.api';
import { useUsersQuery } from '@/api/users.api';
import { Building, Phone, MapPin, User, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';

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

  const { data: departments = [] } = useDepartmentsQuery();
  const { data: users = [] } = useUsersQuery();

  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: yupResolver(departmentYupSchema) as any,
    defaultValues: {
      name: '',
      code: '',
      parentDepartmentId: '',
      managerUserId: '',
      status: 'Active',
      phone: '',
      address: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (departmentToEdit) {
        reset({
          name: departmentToEdit.name || '',
          code: departmentToEdit.code || '',
          parentDepartmentId: departmentToEdit.parentDepartmentId || '',
          managerUserId: departmentToEdit.managerUserId || '',
          status: departmentToEdit.status === 'Inactive' || departmentToEdit.status === 'Tạm dừng' ? 'Inactive' : 'Active',
          phone: departmentToEdit.phone || '',
          address: departmentToEdit.address || '',
          description: departmentToEdit.description || '',
        });
      } else {
        reset({
          name: '',
          code: '',
          parentDepartmentId: '',
          managerUserId: '',
          status: 'Active',
          phone: '',
          address: '',
          description: '',
        });
      }
    }
  }, [isOpen, departmentToEdit, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: DepartmentFormData) => {
    const toastCallback = onSuccessToast || showToast;

    const payloadData = {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      parentDepartmentId: data.parentDepartmentId && data.parentDepartmentId !== '' ? data.parentDepartmentId : null,
      managerUserId: data.managerUserId && data.managerUserId !== '' ? data.managerUserId : null,
      status: data.status || 'Active',
      phone: data.phone?.trim() || '',
      address: data.address?.trim() || '',
      description: data.description?.trim() || '',
    };

    if (isEditMode && departmentToEdit) {
      const deptId = departmentToEdit.departmentId || departmentToEdit.id || '';
      updateMutation.mutate(
        {
          departmentId: deptId,
          data: payloadData,
        },
        {
          onSuccess: (updatedDept) => {
            toastCallback(`Cập nhật phòng ban "${updatedDept.name || data.name}" thành công!`, 'success');
            reset();
            onClose();
          },
          onError: (err: any) => {
            const errorMsg = err.data?.message || err.message || 'Không thể cập nhật phòng ban';
            setError('root', { message: errorMsg });
            showToast(errorMsg, 'error');
          },
        }
      );
    } else {
      createMutation.mutate(
        payloadData,
        {
          onSuccess: (createdDept) => {
            toastCallback(`Đã thêm phòng ban "${createdDept.name || data.name}" thành công!`, 'success');
            reset();
            onClose();
          },
          onError: (err: any) => {
            const errorMsg = err.data?.message || err.message || 'Không thể tạo mới phòng ban';
            setError('root', { message: errorMsg });
            showToast(errorMsg, 'error');
          },
        }
      );
    }
  };

  // Lọc danh sách phòng ban cấp trên: Loại bỏ chính phòng ban đang sửa để tránh vòng lặp cha-con
  const eligibleParentDepartments = departments.filter((d) => {
    if (!departmentToEdit) return true;
    const currentId = departmentToEdit.id || departmentToEdit.departmentId;
    return (d.id || d.departmentId) !== currentId;
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {errors.root && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300 text-xs leading-relaxed flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errors.root.message}</span>
          </div>
        )}

        {/* Row 1: Tên phòng ban & Mã code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Tên phòng ban <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                {...register('name')}
                placeholder="VD: Phòng Công nghệ Thông tin"
                onChange={(e) => {
                  register('name').onChange(e);
                  if (!isEditMode) {
                    const words = e.target.value
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .split(' ')
                      .filter(Boolean);
                    if (words.length > 0) {
                      const codeSuggest = words.map((w) => w[0]).join('').toUpperCase();
                      setValue('code', codeSuggest);
                    }
                  }
                }}
                className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                  errors.name ? 'input-error' : ''
                }`}
              />
              <Building className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
            </div>
            {errors.name && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.name.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Mã code <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('code')}
              placeholder="VD: CNTT"
              className={`input input-bordered input-sm w-full px-3 text-xs uppercase font-mono bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                errors.code ? 'input-error' : ''
              }`}
            />
            {errors.code && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                {errors.code.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Phòng ban cấp trên & Trưởng phòng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Phòng ban cấp trên (Parent Department)
            </label>
            <div className="relative flex items-center">
              <select
                {...register('parentDepartmentId')}
                className="select select-bordered select-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
              >
                <option value="">-- Không có (Phòng ban gốc) --</option>
                {eligibleParentDepartments.map((dept) => {
                  const deptId = dept.id || dept.departmentId || '';
                  return (
                    <option key={deptId} value={deptId}>
                      {dept.name} ({dept.code || 'PB'})
                    </option>
                  );
                })}
              </select>
              <Building className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Trưởng phòng / Quản lý (Manager)
            </label>
            <div className="relative flex items-center">
              <select
                {...register('managerUserId')}
                className="select select-bordered select-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
              >
                <option value="">-- Chưa phân công --</option>
                {users.map((user) => {
                  const uId = user.id || (user as any).userId || '';
                  return (
                    <option key={uId} value={uId}>
                      {user.name || (user as any).displayName} ({user.email || 'No email'})
                    </option>
                  );
                })}
              </select>
              <UserCheck className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
            </div>
          </div>
        </div>

        {/* Row 3: Trạng thái & Số điện thoại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Trạng thái (Status)
            </label>
            <select
              {...register('status')}
              className="select select-bordered select-sm w-full text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            >
              <option value="Active">Active (Đang hoạt động)</option>
              <option value="Inactive">Inactive (Tạm dừng)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Số điện thoại liên hệ</label>
            <div className="relative flex items-center">
              <input
                type="text"
                {...register('phone')}
                placeholder="VD: 0274 374 0530"
                className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                  errors.phone ? 'input-error' : ''
                }`}
              />
              <Phone className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
            </div>
            {errors.phone && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Vị trí / Địa chỉ */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Địa chỉ / Vị trí văn phòng</label>
          <div className="relative flex items-center">
            <input
              type="text"
              {...register('address')}
              placeholder="VD: Tầng 4, Tòa nhà Trụ sở chính"
              className="input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
            />
            <MapPin className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
          </div>
        </div>

        {/* Row 5: Mô tả chức năng */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Mô tả chức năng</label>
          <textarea
            rows={2}
            {...register('description')}
            placeholder="Mô tả ngắn về nhiệm vụ và phạm vi của phòng ban..."
            className="textarea textarea-bordered w-full text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost text-slate-700 dark:text-zinc-300 font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-sm btn-primary text-white font-medium shadow-xs"
          >
            {isPending && <span className="loading loading-spinner loading-xs" />}
            <span>{isEditMode ? 'Lưu thay đổi' : 'Tạo phòng ban'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default DepartmentModal;
