import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { Modal } from '@/components/disclosure';
import { User, userYupSchema, UserFormData } from '@/types';
import { useCreateUserMutation, useUpdateUserMutation } from '@/api/users.api';
import { useDepartmentsQuery } from '@/api/departments.api';
import { useRolesQuery } from '@/api/roles.api';
import { useCurrentOrganizationQuery } from '@/api/organizations.api';
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
  const [serverError, setServerError] = useState<string | null>(null);

  // Fetch departments and roles from Backend APIs
  const { data: fetchedDepartments = [] } = useDepartmentsQuery();
  const { data: fetchedRoles = [] } = useRolesQuery();
  const { data: currentOrganization, isError: organizationLoadFailed } = useCurrentOrganizationQuery(isEditMode && isOpen);

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

  const form = useForm({
    defaultValues: {
      displayName: '',
      name: '',
      email: '',
      password: 'Nexora@2026',
      role: 'Nhân viên',
      department: 'Công nghệ thông tin',
      organizationId: '',
      phone: '',
    } as UserFormData,
    validators: {
      onSubmit: ({ value }) => {
        try {
          userYupSchema.validateSync(value, { abortEarly: false });
          return undefined;
        } catch (err: any) {
          return err.message || 'Dữ liệu người dùng không hợp lệ';
        }
      },
    },
    onSubmit: async ({ value }) => {
      setServerError(null);

      const matchedRole = availableRoles.find(
        (r) => r.name === value.role || (r as any).role === value.role || r.id === value.role
      );
      const matchedDept = availableDepartments.find(
        (d) => d.name === value.department || d.id === value.department
      );

      const roleName = value.role;
      const roleId = matchedRole?.id;

      if (isEditMode && userToEdit) {
        updateMutation.mutate(
          {
            userId: userToEdit.id || userToEdit.userId || '',
            data: {
              displayName: value.displayName || value.name,
              userName: value.name || value.email,
              name: value.name,
              fullName: value.name,
              email: value.email,
              role: roleName,
              roleName: roleName,
              roleId: roleId,
              roles: roleId ? [{ roleId, roleName, status: 'Active' }] : [{ roleName, status: 'Active' }],
              roleIds: roleId ? [roleId] : [],
              department: value.department,
              departmentId: matchedDept?.id,
              organizationId: currentOrganization?.organizationId === value.organizationId ? value.organizationId : undefined,
              phone: value.phone || '',
              phoneNumber: value.phone || '',
            },
          },
          {
            onSuccess: (updatedUser) => {
              onSuccessToast(`Đã cập nhật thông tin người dùng ${updatedUser.name} thành công!`);
              form.reset();
              onClose();
            },
            onError: (err: any) => {
              setServerError(err.message || 'Không thể cập nhật người dùng');
            },
          }
        );
      } else {
        createMutation.mutate(
          {
            displayName: value.displayName || value.name,
            name: value.name,
            fullName: value.name,
            email: value.email,
            userName: value.name || value.email.split('@')[0],
            password: value.password || 'Nexora@2026',
            role: roleName,
            roleName: roleName,
            roleId: roleId,
            roles: roleId ? [{ roleId, roleName, status: 'Active' }] : [{ roleName, status: 'Active' }],
            roleIds: roleId ? [roleId] : [],
            department: value.department,
            departmentId: matchedDept?.id,
            phone: value.phone || '',
            phoneNumber: value.phone || '',
          },
          {
            onSuccess: (createdUser) => {
              onSuccessToast(`Đã thêm người dùng ${createdUser.name} thành công!`);
              form.reset();
              onClose();
            },
            onError: (err: any) => {
              setServerError(err.message || 'Không thể tạo mới người dùng');
            },
          }
        );
      }
    },
  });

  // Tự động gán và binding chính xác thông tin phòng ban và vai trò khi mở Modal Edit
  useEffect(() => {
    if (isOpen) {
      setShowPassword(false);
      setServerError(null);
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

        form.setFieldValue('displayName', userToEdit.displayName || userToEdit.name || userToEdit.fullName || '');
        form.setFieldValue('name', userToEdit.name || userToEdit.fullName || userToEdit.displayName || '');
        form.setFieldValue('email', userToEdit.email || '');
        form.setFieldValue('role', resolvedRole);
        form.setFieldValue('department', resolvedDept);
        form.setFieldValue('organizationId', userToEdit.organizationId || '');
        form.setFieldValue('phone', userToEdit.phone || userToEdit.phoneNumber || '');
        form.setFieldValue('password', '');
      } else {
        const defaultRole = availableRoles[0]?.name || (availableRoles[0] as any)?.role || 'Nhân viên';
        const defaultDept = availableDepartments[0]?.name || 'Công nghệ thông tin';
        form.reset();
        form.setFieldValue('role', defaultRole);
        form.setFieldValue('department', defaultDept);
        form.setFieldValue('password', 'Nexora@2026');
      }
    }
  }, [isOpen, userToEdit, availableDepartments, availableRoles]);

  if (!isOpen) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa thông tin người dùng' : 'Thêm người dùng mới'}
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
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300 text-xs leading-relaxed flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tên hiển thị (displayName) */}
          <form.Field
            name="displayName"
            validators={{
              onChange: ({ value }) => (!value?.trim() ? 'Tên hiển thị không được để trống' : undefined),
            }}
          >
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Tên hiển thị (Display Name) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name={field.name}
                      value={field.state.value || ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="VD: lenhu"
                      className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                        hasError ? 'input-error' : ''
                      }`}
                    />
                    <UserIcon className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
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

          {/* Họ và tên (Full Name) */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => (!value?.trim() ? 'Họ và tên không được để trống' : undefined),
            }}
          >
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Họ và tên (Full Name) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name={field.name}
                      value={field.state.value || ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="VD: Lê Thị Quỳnh Như"
                      className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                        hasError ? 'input-error' : ''
                      }`}
                    />
                    <UserIcon className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
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

        {/* Email đăng nhập */}
        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => (!value?.trim() ? 'Email không được để trống' : undefined),
          }}
        >
          {(field) => {
            const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
            const hasError = Boolean(errorMessage);

            return (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                  Email đăng nhập <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    name={field.name}
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="VD: lethiquynhu@gmail.com"
                    className={`input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                      hasError ? 'input-error' : ''
                    }`}
                  />
                  <Mail className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
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

        {/* Mật khẩu khởi tạo (Chỉ hiển thị khi thêm mới) */}
        {!isEditMode && (
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => (!value || value.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự' : undefined),
            }}
          >
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
              const hasError = Boolean(errorMessage);

              return (
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
                      name={field.name}
                      value={field.state.value || ''}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Nhập mật khẩu cho tài khoản (tối thiểu 6 ký tự)"
                      className={`input input-bordered input-sm w-full pl-9 pr-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
                        hasError ? 'input-error' : ''
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
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Phòng ban Dropdown */}
          <form.Field name="department">
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Phòng ban <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <select
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`select select-bordered select-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
                        hasError ? 'select-error' : ''
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

          {isEditMode && (
            <form.Field name="organizationId">
              {(field) => (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Tổ chức</label>
                  <div className="relative flex items-center">
                    <select
                      name={field.name}
                      value={field.state.value || ''}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      disabled={!currentOrganization}
                      className="select select-bordered select-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
                    >
                      <option value="">Không thay đổi tổ chức</option>
                      {currentOrganization && (
                        <option value={currentOrganization.organizationId}>{currentOrganization.name}</option>
                      )}
                    </select>
                    <Building className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
                  </div>
                  {organizationLoadFailed && <p className="mt-1 text-[11px] text-rose-600">Không tải được tổ chức hiện tại; bạn vẫn có thể sửa thông tin khác.</p>}
                </div>
              )}
            </form.Field>
          )}

          {/* Vai trò Dropdown */}
          <form.Field name="role">
            {(field) => {
              const errorMessage = field.state.meta.errors?.[0]?.message || (typeof field.state.meta.errors?.[0] === 'string' ? field.state.meta.errors[0] : null);
              const hasError = Boolean(errorMessage);

              return (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Vai trò <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <select
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={`select select-bordered select-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
                        hasError ? 'select-error' : ''
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

        {/* Số điện thoại */}
        <form.Field name="phone">
          {(field) => (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Số điện thoại</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  name={field.name}
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="VD: 0708 223 608"
                  className="input input-bordered input-sm w-full pl-9 text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
                />
                <Phone className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-400 pointer-events-none z-10" />
              </div>
            </div>
          )}
        </form.Field>

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
