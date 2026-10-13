import React, { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { departmentYupSchema, DepartmentFormData, Department } from '@/types';
import { useCreateDepartmentMutation, useUpdateDepartmentMutation, useDepartmentsQuery } from '@/api/departments.api';
import { useUsersQuery } from '@/api/users.api';
import { Building, Phone, MapPin, AlertCircle, UserCheck } from 'lucide-react';

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
  const { showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const isEditMode = Boolean(departmentToEdit);
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: departments = [] } = useDepartmentsQuery();
  const { data: users = [] } = useUsersQuery();

  const createMutation = useCreateDepartmentMutation();
  const updateMutation = useUpdateDepartmentMutation();

  const form = useForm({
    defaultValues: {
      name: '',
      code: '',
      parentDepartmentId: '',
      managerUserId: '',
      status: 'Active',
      phone: '',
      address: '',
      description: '',
    } as DepartmentFormData,
    validators: {
      onSubmit: ({ value }) => {
        try {
          departmentYupSchema.validateSync(value, { abortEarly: false });
          return undefined;
        } catch (err: any) {
          return err.message || tr('Invalid department information', 'Dữ liệu phòng ban không hợp lệ');
        }
      },
    },
    onSubmit: async ({ value }) => {
      const toastCallback = onSuccessToast || showToast;
      setServerError(null);

      const payloadData = {
        name: value.name.trim(),
        code: value.code.trim().toUpperCase(),
        parentDepartmentId: value.parentDepartmentId && value.parentDepartmentId !== '' ? value.parentDepartmentId : null,
        managerUserId: value.managerUserId && value.managerUserId !== '' ? value.managerUserId : null,
        status: value.status || 'Active',
        phone: value.phone?.trim() || '',
        address: value.address?.trim() || '',
        description: value.description?.trim() || '',
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
              toastCallback(tr(`Updated department "${updatedDept.name || value.name}".`, `Cập nhật phòng ban "${updatedDept.name || value.name}" thành công!`), 'success');
              form.reset();
              onClose();
            },
            onError: (err: any) => {
              const errorMsg = err.data?.message || err.message || tr('Could not update department', 'Không thể cập nhật phòng ban');
              setServerError(errorMsg);
              showToast(errorMsg, 'error');
            },
          }
        );
      } else {
        createMutation.mutate(
          payloadData,
          {
            onSuccess: (createdDept) => {
              toastCallback(tr(`Created department "${createdDept.name || value.name}".`, `Đã thêm phòng ban "${createdDept.name || value.name}" thành công!`), 'success');
              form.reset();
              onClose();
            },
            onError: (err: any) => {
              const errorMsg = err.data?.message || err.message || tr('Could not create department', 'Không thể tạo mới phòng ban');
              setServerError(errorMsg);
              showToast(errorMsg, 'error');
            },
          }
        );
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      setServerError(null);
      if (departmentToEdit) {
        form.setFieldValue('name', departmentToEdit.name || '');
        form.setFieldValue('code', departmentToEdit.code || '');
        form.setFieldValue('parentDepartmentId', departmentToEdit.parentDepartmentId || '');
        form.setFieldValue('managerUserId', departmentToEdit.managerUserId || '');
        form.setFieldValue('status', departmentToEdit.status === 'Inactive' || departmentToEdit.status === 'Tạm dừng' ? 'Inactive' : 'Active');
        form.setFieldValue('phone', departmentToEdit.phone || '');
        form.setFieldValue('address', departmentToEdit.address || '');
        form.setFieldValue('description', departmentToEdit.description || '');
      } else {
        form.reset();
      }
    }
  }, [isOpen, departmentToEdit]);

  if (!isOpen) return null;

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
      title={isEditMode ? tr('Edit department', 'Chỉnh sửa phòng ban') : tr('Add department', 'Thêm phòng ban mới')}
      maxWidth="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4 text-xs"
      >
        {serverError && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300 text-xs leading-relaxed flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Row 1: Tên phòng ban & Mã code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => (!value?.trim() ? tr('Department name is required', 'Tên phòng ban không được để trống') : undefined),
              }}
            >
              {(field) => {
                const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
                const hasError = Boolean(errorMessage);

                return (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {tr('Department name', 'Tên phòng ban')} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                          if (!isEditMode) {
                            const words = e.target.value
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .split(' ')
                              .filter(Boolean);
                            if (words.length > 0) {
                              const codeSuggest = words.map((w) => w[0]).join('').toUpperCase();
                              form.setFieldValue('code', codeSuggest);
                            }
                          }
                        }}
                        placeholder={tr('e.g. Information Technology', 'VD: Phòng Công nghệ Thông tin')}
                        className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                          hasError ? 'input-error' : ''
                        }`}
                      />
                      <Building className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
                    </div>
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
            <form.Field
              name="code"
              validators={{
                onChange: ({ value }) => (!value?.trim() ? tr('Department code is required', 'Mã phòng ban không được để trống') : undefined),
              }}
            >
              {(field) => {
                const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
                const hasError = Boolean(errorMessage);

                return (
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {tr('Department code', 'Mã code')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      placeholder={tr('e.g. IT', 'VD: CNTT')}
                      className={`input input-bordered input-sm w-full px-3 text-xs uppercase font-mono bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                        hasError ? 'input-error' : ''
                      }`}
                    />
                    {hasError && (
                      <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                        {errorMessage}
                      </p>
                    )}
                  </div>
                );
              }}
            </form.Field>
          </div>
        </div>

        {/* Row 2: Phòng ban cấp trên & Trưởng phòng */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field name="parentDepartmentId">
            {(field) => (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {tr('Parent department', 'Phòng ban cấp trên (Parent Department)')}
                </label>
                <div className="relative flex items-center">
                  <select
                    name={field.name}
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="select select-bordered select-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="">{tr('-- None (root department) --', '-- Không có (Phòng ban gốc) --')}</option>
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
            )}
          </form.Field>

          <form.Field name="managerUserId">
            {(field) => (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {tr('Department manager', 'Trưởng phòng / Quản lý (Manager)')}
                </label>
                <div className="relative flex items-center">
                  <select
                    name={field.name}
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="select select-bordered select-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                  >
                    <option value="">{tr('-- Unassigned --', '-- Chưa phân công --')}</option>
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
            )}
          </form.Field>
        </div>

        {/* Row 3: Trạng thái & Số điện thoại */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <form.Field name="status">
            {(field) => (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  {tr('Status', 'Trạng thái (Status)')}
                </label>
                <select
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="select select-bordered select-sm w-full text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                >
                  <option value="Active">{tr('Active', 'Active (Đang hoạt động)')}</option>
                  <option value="Inactive">{tr('Inactive', 'Inactive (Tạm dừng)')}</option>
                </select>
              </div>
            )}
          </form.Field>

          <form.Field name="phone">
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">{tr('Contact phone', 'Số điện thoại liên hệ')}</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name={field.name}
                      value={field.state.value || ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={tr('e.g. 0274 374 0530', 'VD: 0274 374 0530')}
                      className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                        hasError ? 'input-error' : ''
                      }`}
                    />
                    <Phone className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
                  </div>
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

        {/* Row 4: Vị trí / Địa chỉ */}
        <form.Field name="address">
          {(field) => (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">{tr('Office address', 'Địa chỉ / Vị trí văn phòng')}</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  name={field.name}
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={tr('e.g. 4th floor, headquarters', 'VD: Tầng 4, Tòa nhà Trụ sở chính')}
                  className="input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />
                <MapPin className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
              </div>
            </div>
          )}
        </form.Field>

        {/* Row 5: Mô tả chức năng */}
        <form.Field name="description">
          {(field) => (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">{tr('Responsibilities', 'Mô tả chức năng')}</label>
              <textarea
                rows={2}
                name={field.name}
                value={field.state.value || ''}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={tr('Briefly describe this department’s responsibilities...', 'Mô tả ngắn về nhiệm vụ và phạm vi của phòng ban...')}
                className="textarea textarea-bordered w-full text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 resize-none"
              />
            </div>
          )}
        </form.Field>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost text-slate-700 dark:text-zinc-300 font-medium"
          >
            {tr('Cancel', 'Hủy')}
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="btn btn-sm btn-primary text-white font-medium shadow-xs"
          >
            {isPending && <span className="loading loading-spinner loading-xs" />}
            <span>{isEditMode ? tr('Save changes', 'Lưu thay đổi') : tr('Create department', 'Tạo phòng ban')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentModal;
