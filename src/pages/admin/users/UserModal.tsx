import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/disclosure';
import { User, userYupSchema, UserFormData } from '@/types';
import { useCreateUserMutation, useUpdateUserMutation } from '@/api/users.api';
import { useDepartmentsQuery } from '@/api/departments.api';
import { useRolesQuery } from '@/api/roles.api';
import { Mail, User as UserIcon, Phone, Building, Shield, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';

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

  // Danh sách các vai trò hệ thống mặc định để luôn đảm bảo có dữ liệu
  const defaultSystemRoles = useMemo(
    () => [
      { id: 'role_admin', name: 'Quản trị viên', role: 'Quản trị viên' },
      { id: 'role_lead', name: 'Trưởng dự án', role: 'Trưởng dự án' },
      { id: 'role_dept_head', name: 'Trưởng phòng', role: 'Trưởng phòng' },
      { id: 'role_staff', name: 'Nhân viên', role: 'Nhân viên' },
    ],
    []
  );

  // Xây dựng danh sách phòng ban đầy đủ và bao gồm phòng ban của người dùng đang sửa
  const availableDepartments = useMemo(() => {
    let list =
      fetchedDepartments.length > 0
        ? [...fetchedDepartments]
        : initialDepartments && initialDepartments.length > 0
        ? [...initialDepartments]
        : [{ id: 'dept_cntt', name: 'Công nghệ thông tin' }, { id: 'dept_sp', name: 'Sản phẩm' }];

    if (userToEdit && userToEdit.department) {
      const deptName = userToEdit.department;
      const exists = list.some(
        (d) =>
          d.name.toLowerCase() === deptName.toLowerCase() ||
          d.id === deptName ||
          (userToEdit.departmentId && d.id === userToEdit.departmentId)
      );
      if (!exists) {
        list = [{ id: userToEdit.departmentId || `dept_custom_${Date.now()}`, name: deptName }, ...list];
      }
    }
    return list;
  }, [fetchedDepartments, initialDepartments, userToEdit?.department, userToEdit?.departmentId]);

  // Xây dựng danh sách vai trò đầy đủ, đảm bảo role của userToEdit luôn tồn tại
  const availableRoles = useMemo(() => {
    let list = fetchedRoles && fetchedRoles.length > 0 ? [...fetchedRoles] : [...defaultSystemRoles];

    const currentRole = userToEdit?.roles?.[0]?.roleName || userToEdit?.role || (userToEdit as any)?.roleName || '';
    const currentRoleId = userToEdit?.roles?.[0]?.roleId || userToEdit?.roleId;

    if (currentRole) {
      const exists = list.some(
        (r) =>
          (r.name || (r as any).role || '').toLowerCase() === currentRole.toLowerCase() ||
          r.id === currentRole ||
          (currentRoleId && r.id === currentRoleId)
      );
      if (!exists) {
        list = [
          {
            id: currentRoleId || `role_${currentRole}`,
            name: currentRole,
            role: currentRole,
            description: 'Vai trò người dùng',
            userCount: 1,
            status: 'Đang hoạt động',
          } as any,
          ...list,
        ];
      }
    }
    return list;
  }, [fetchedRoles, userToEdit?.role, userToEdit?.roleId, userToEdit?.roles, defaultSystemRoles]);

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
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

  // Tự động gán và binding chính xác thông tin phòng ban và vai trò khi mở Modal Edit
  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      if (userToEdit) {
        // Tìm phòng ban khớp
        const matchedDept = availableDepartments.find(
          (d) =>
            (userToEdit.departmentId && d.id === userToEdit.departmentId) ||
            d.id === userToEdit.department ||
            d.name.toLowerCase() === (userToEdit.department || '').toLowerCase()
        );
        const resolvedDept =
          matchedDept?.name ||
          userToEdit.department ||
          availableDepartments[0]?.name ||
          'Công nghệ thông tin';

        // Tìm vai trò khớp
        const rawRole = userToEdit.roles?.[0]?.roleName || userToEdit.role || (userToEdit as any)?.roleName || '';
        const rawRoleId = userToEdit.roles?.[0]?.roleId || userToEdit.roleId;
        const matchedRole = availableRoles.find(
          (r) =>
            (rawRoleId && r.id === rawRoleId) ||
            (r.id && r.id === rawRole) ||
            (r.name && r.name.toLowerCase() === rawRole.toLowerCase()) ||
            ((r as any).role && (r as any).role.toLowerCase() === rawRole.toLowerCase())
        );

        const resolvedRole =
          matchedRole?.name ||
          (matchedRole as any)?.role ||
          rawRole ||
          availableRoles[0]?.name ||
          (availableRoles[0] as any)?.role ||
          'Nhân viên';

        reset({
          displayName: userToEdit.displayName || userToEdit.name || userToEdit.fullName || '',
          name: userToEdit.name || userToEdit.fullName || userToEdit.displayName || '',
          email: userToEdit.email || '',
          role: resolvedRole,
          department: resolvedDept,
          phone: userToEdit.phone || userToEdit.phoneNumber || '',
          password: '',
        });

        // Đồng bộ trực tiếp vào React Hook Form state
        setValue('role', resolvedRole);
        setValue('department', resolvedDept);
      } else {
        const defaultRole = availableRoles[0]?.name || (availableRoles[0] as any)?.role || 'Nhân viên';
        const defaultDept = availableDepartments[0]?.name || 'Công nghệ thông tin';
        reset({
          displayName: '',
          name: '',
          email: '',
          password: 'Nexora@2026',
          role: defaultRole,
          department: defaultDept,
          phone: '',
        });
        setValue('role', defaultRole);
        setValue('department', defaultDept);
      }
    }
  }, [isOpen, userToEdit, availableDepartments, availableRoles, reset, setValue]);

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
    const matchedRole = availableRoles.find(
      (r) => r.name === data.role || (r as any).role === data.role || r.id === data.role
    );
    const matchedDept = availableDepartments.find(
      (d) => d.name === data.department || d.id === data.department
    );

    const roleName = data.role;
    const roleId = matchedRole?.id;

    if (isEditMode && userToEdit) {
      updateMutation.mutate(
        {
          userId: userToEdit.id || userToEdit.userId || '',
          data: {
            displayName: data.displayName || data.name,
            userName: data.name || data.email,
            name: data.name,
            fullName: data.name,
            email: data.email,
            role: roleName,
            roleName: roleName,
            roleId: roleId,
            roles: roleId ? [{ roleId, roleName, status: 'Active' }] : [{ roleName, status: 'Active' }],
            roleIds: roleId ? [roleId] : [],
            department: data.department,
            departmentId: matchedDept?.id,
            phone: data.phone || '',
            phoneNumber: data.phone || '',
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
          userName: data.name || data.email.split('@')[0],
          password: data.password || 'Nexora@2026',
          role: roleName,
          roleName: roleName,
          roleId: roleId,
          roles: roleId ? [{ roleId, roleName, status: 'Active' }] : [{ roleName, status: 'Active' }],
          roleIds: roleId ? [roleId] : [],
          department: data.department,
          departmentId: matchedDept?.id,
          phone: data.phone || '',
          phoneNumber: data.phone || '',
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
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {errors.root && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300 text-xs leading-relaxed flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.root.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tên hiển thị (displayName) */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Tên hiển thị (Display Name) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                {...register('displayName')}
                placeholder="VD: lenhu"
                className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                  errors.displayName ? 'input-error' : ''
                }`}
              />
              <UserIcon className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
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
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Họ và tên (Full Name) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                {...register('name')}
                placeholder="VD: Lê Thị Quỳnh Như"
                className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                  errors.name ? 'input-error' : ''
                }`}
              />
              <UserIcon className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
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
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Email đăng nhập <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="email"
              {...register('email')}
              placeholder="VD: lethiquynhu@gmail.com"
              className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                errors.email ? 'input-error' : ''
              }`}
            />
            <Mail className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
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
              <label className="block font-semibold text-slate-700 dark:text-zinc-300">
                Mật khẩu khởi tạo <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500">Mặc định: Nexora@2026</span>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Nhập mật khẩu cho tài khoản (tối thiểu 6 ký tự)"
                className={`input input-bordered input-sm w-full pl-9 pr-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                  errors.password ? 'input-error' : ''
                }`}
              />
              <KeyRound className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer z-10"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phòng ban Dropdown */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Phòng ban <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <select
                {...register('department')}
                className={`select select-bordered select-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
                  errors.department ? 'select-error' : ''
                }`}
              >
                {availableDepartments.map((d) => (
                  <option key={d.id || d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              <Building className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
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
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Vai trò <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <select
                {...register('role')}
                className={`select select-bordered select-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
                  errors.role ? 'select-error' : ''
                }`}
              >
                {availableRoles.map((r) => {
                  const roleName = r.name || (r as any).role || r.id;
                  return (
                    <option key={r.id || roleName} value={roleName}>
                      {roleName}
                    </option>
                  );
                })}
              </select>
              <Shield className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
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
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Số điện thoại</label>
          <div className="relative flex items-center">
            <input
              type="text"
              {...register('phone')}
              placeholder="VD: 0708 223 608"
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

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
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
            <span>{isEditMode ? 'Lưu thay đổi' : 'Tạo người dùng'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default UserModal;
