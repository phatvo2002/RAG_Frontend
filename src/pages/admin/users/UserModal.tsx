import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/disclosure';
import { User, userYupSchema, UserFormData } from '@/types';
import { useCreateUserMutation, useUpdateUserMutation } from '@/api/users.api';
import { useDepartmentsQuery } from '@/api/departments.api';
import { useRolesQuery } from '@/api/roles.api';
import { Lock, Mail, User as UserIcon, Phone, Building, Shield, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';

const FALLBACK_DEPARTMENTS = [
  { id: 'dept_1', name: 'Công nghệ thông tin' },
  { id: 'dept_2', name: 'Phòng Sản phẩm' },
  { id: 'dept_3', name: 'Phòng Marketing' },
  { id: 'dept_4', name: 'Phòng Nhân sự' },
  { id: 'dept_5', name: 'Ban Giám đốc' },
];

const FALLBACK_ROLES = [
  { id: 'role_1', name: 'Quản trị viên', role: 'Quản trị viên' },
  { id: 'role_2', name: 'Trưởng phòng', role: 'Trưởng phòng' },
  { id: 'role_3', name: 'Trưởng dự án', role: 'Trưởng dự án' },
  { id: 'role_4', name: 'Nhân viên', role: 'Nhân viên' },
];

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  departments?: { id: string; name: string }[];
  onSuccessToast: (msg: string) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  departments: initialDepartments,
  onSuccessToast,
}) => {
  const isEditMode = Boolean(userToEdit);
  const [showPassword, setShowPassword] = useState(false);

  // Fetch departments and roles from Backend APIs
  const { data: fetchedDepartments = [] } = useDepartmentsQuery();
  const { data: fetchedRoles = [] } = useRolesQuery();

  // Robustly build availableDepartments list including the userToEdit's department
  const availableDepartments = useMemo(() => {
    let list =
      fetchedDepartments.length > 0
        ? [...fetchedDepartments]
        : initialDepartments && initialDepartments.length > 0
        ? [...initialDepartments]
        : [...FALLBACK_DEPARTMENTS];

    if (userToEdit?.department) {
      const exists = list.some(
        (d) =>
          d.name.toLowerCase() === userToEdit.department.toLowerCase() ||
          d.id === userToEdit.department ||
          (userToEdit.departmentId && d.id === userToEdit.departmentId)
      );
      if (!exists) {
        list = [{ id: userToEdit.departmentId || `dept_custom_${Date.now()}`, name: userToEdit.department }, ...list];
      }
    }
    return list;
  }, [fetchedDepartments, initialDepartments, userToEdit?.department, userToEdit?.departmentId]);

  // Robustly build availableRoles list including the userToEdit's role
  const availableRoles = useMemo(() => {
    let list = fetchedRoles.length > 0 ? [...fetchedRoles] : [...FALLBACK_ROLES];

    const currentRole = (userToEdit?.role as string) || '';
    if (currentRole) {
      const exists = list.some(
        (r) =>
          (r.name || (r as any).role || '').toLowerCase() === currentRole.toLowerCase() ||
          r.id === currentRole ||
          (userToEdit?.roleId && r.id === userToEdit.roleId)
      );
      if (!exists) {
        list = [{ id: userToEdit?.roleId || `role_custom_${Date.now()}`, name: currentRole, role: currentRole }, ...list];
      }
    }
    return list;
  }, [fetchedRoles, userToEdit?.role, userToEdit?.roleId]);

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: yupResolver(userYupSchema) as any,
    defaultValues: {
      displayName: '',
      name: '',
      email: '',
      password: '',
      role: 'Nhân viên',
      department: 'Công nghệ thông tin',
      phone: '',
    },
  });

  // Automatically match and populate the existing department and role when opening edit modal
  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      if (userToEdit) {
        // Match department
        const matchedDept = availableDepartments.find(
          (d) =>
            (userToEdit.departmentId && d.id === userToEdit.departmentId) ||
            d.id === userToEdit.department ||
            d.name.toLowerCase() === (userToEdit.department || '').toLowerCase()
        );
        const resolvedDept = matchedDept?.name || userToEdit.department || availableDepartments[0]?.name || 'Công nghệ thông tin';

        // Match role
        const matchedRole = availableRoles.find(
          (r) =>
            (userToEdit.roleId && r.id === userToEdit.roleId) ||
            r.id === (userToEdit.role as string) ||
            (r.name || (r as any).role || '').toLowerCase() === ((userToEdit.role as string) || '').toLowerCase()
        );
        const resolvedRole = matchedRole?.name || (matchedRole as any)?.role || (userToEdit.role as string) || availableRoles[0]?.name || (availableRoles[0] as any)?.role || 'Nhân viên';

        reset({
          displayName: userToEdit.displayName || userToEdit.name || userToEdit.fullName || '',
          name: userToEdit.name || userToEdit.fullName || userToEdit.displayName || '',
          email: userToEdit.email || '',
          role: resolvedRole,
          department: resolvedDept,
          phone: userToEdit.phone || '',
          password: '',
        });
      } else {
        reset({
          displayName: '',
          name: '',
          email: '',
          password: 'Nexora@2026',
          role: availableRoles[0]?.name || (availableRoles[0] as any)?.role || 'Nhân viên',
          department: availableDepartments[0]?.name || 'Công nghệ thông tin',
          phone: '',
        });
      }
    }
  }, [isOpen, userToEdit, availableDepartments, availableRoles]);

  if (!isOpen) return null;

  const handleBackendError = (err: any) => {
    const errorDetails =
      err?.data?.error?.details ||
      err?.data?.details ||
      err?.data?.errors ||
      err?.details;

    if (Array.isArray(errorDetails) && errorDetails.length > 0) {
      errorDetails.forEach((d: { field?: string; message?: string }) => {
        if (d.field && d.message) {
          const fieldName = d.field.charAt(0).toLowerCase() + d.field.slice(1);
          setError(fieldName as any, { message: d.message });
        }
      });
    } else {
      setError('root', { message: err.message || 'Không thể thực hiện thao tác' });
    }
  };

  const onSubmit = (data: UserFormData) => {
    const matchedRole = availableRoles.find((r) => r.name === data.role || (r as any).role === data.role);
    const matchedDept = availableDepartments.find((d) => d.name === data.department);

    if (isEditMode && userToEdit) {
      updateMutation.mutate(
        {
          userId: userToEdit.id,
          data: {
            displayName: data.displayName || data.name,
            name: data.name,
            fullName: data.name,
            email: data.email,
            role: data.role,
            roleId: matchedRole?.id,
            department: data.department,
            departmentId: matchedDept?.id,
            phone: data.phone || '',
          },
        },
        {
          onSuccess: (updatedUser) => {
            onSuccessToast(`Đã cập nhật thông tin người dùng ${updatedUser.name} thành công!`);
            onClose();
          },
          onError: handleBackendError,
        }
      );
    } else {
      createMutation.mutate(
        {
          displayName: data.displayName || data.name,
          name: data.name,
          fullName: data.name,
          email: data.email,
          userName: data.email.split('@')[0],
          password: data.password || 'Nexora@2026',
          role: data.role,
          roleId: matchedRole?.id,
          department: data.department,
          departmentId: matchedDept?.id,
          phone: data.phone || '',
        },
        {
          onSuccess: (createdUser) => {
            onSuccessToast(`Đã thêm người dùng ${createdUser.name} thành công!`);
            onClose();
          },
          onError: handleBackendError,
        }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa thông tin người dùng' : 'Thêm người dùng mới'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
        {errors.root && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Tên hiển thị (displayName) */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Tên hiển thị (Display Name) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <UserIcon className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                {...register('displayName')}
                placeholder="VD: Nguyễn Văn A"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none text-xs ${
                  errors.displayName
                    ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                    : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
            </div>
            {errors.displayName && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.displayName.message}</span>
              </p>
            )}
          </div>

          {/* Họ và tên (Full Name) */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Họ và tên (Full Name) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <UserIcon className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                {...register('name')}
                placeholder="VD: Nguyễn Văn A"
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
        </div>

        {/* Email đăng nhập */}
        <div>
          <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
            Email đăng nhập <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
            <input
              type="email"
              {...register('email')}
              placeholder="VD: a.nguyen@congty.vn"
              className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none text-xs ${
                errors.email
                  ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>

        {/* Mật khẩu khởi tạo (Chỉ hiển thị khi thêm mới) */}
        {!isEditMode && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-medium text-slate-700 dark:text-zinc-300">
                Mật khẩu khởi tạo <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">Mặc định: Nexora@2026</span>
            </div>
            <div className="relative flex items-center">
              <KeyRound className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Nhập mật khẩu cho tài khoản (tối thiểu 6 ký tự)"
                className={`w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-zinc-800 border rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none text-xs ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                    : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password.message}</span>
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Phòng ban Dropdown */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Phòng ban <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Building className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <select
                {...register('department')}
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border rounded text-slate-800 dark:text-zinc-100 focus:outline-none text-xs cursor-pointer ${
                  errors.department
                    ? 'border-rose-400 focus:border-rose-600'
                    : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              >
                {availableDepartments.map((d) => (
                  <option key={d.id || d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.department && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.department.message}</span>
              </p>
            )}
          </div>

          {/* Vai trò Dropdown */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Vai trò <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Shield className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500 pointer-events-none" />
              <select
                {...register('role')}
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border rounded text-slate-800 dark:text-zinc-100 focus:outline-none text-xs cursor-pointer ${
                  errors.role
                    ? 'border-rose-400 focus:border-rose-600'
                    : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800'
                }`}
              >
                {availableRoles.map((r) => {
                  const roleName = r.name || (r as any).role;
                  return (
                    <option key={r.id || roleName} value={roleName}>
                      {roleName}
                    </option>
                  );
                })}
              </select>
            </div>
            {errors.role && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.role.message}</span>
              </p>
            )}
          </div>
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Số điện thoại</label>
          <div className="relative flex items-center">
            <Phone className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              {...register('phone')}
              placeholder="VD: 0912 345 678"
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

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-medium rounded cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-2xs shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {isPending && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            <span>{isEditMode ? 'Lưu thay đổi' : 'Tạo người dùng'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default UserModal;
