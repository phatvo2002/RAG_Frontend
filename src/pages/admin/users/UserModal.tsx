import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/disclosure';
import { User, UserRole } from '@/types';
import { useCreateUserMutation, useUpdateUserMutation } from '@/api/users.api';
import { Lock, Mail, User as UserIcon, Phone, Building, Shield } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  departments: { id: string; name: string }[];
  onSuccessToast: (msg: string) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  userToEdit,
  departments,
  onSuccessToast,
}) => {
  const isEditMode = Boolean(userToEdit);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Nhân viên');
  const [department, setDepartment] = useState('Công nghệ thông tin');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setRole((userToEdit.role as UserRole) || 'Nhân viên');
      setDepartment(userToEdit.department || departments[0]?.name || 'Công nghệ thông tin');
      setPhone(userToEdit.phone || '');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('Nhân viên');
      setDepartment(departments[0]?.name || 'Công nghệ thông tin');
      setPhone('');
    }
    setError(null);
  }, [userToEdit, isOpen, departments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Vui lòng nhập đầy đủ họ tên và email');
      return;
    }

    if (!isEditMode && password && password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự');
      return;
    }

    if (isEditMode && userToEdit) {
      updateMutation.mutate(
        {
          userId: userToEdit.id,
          data: {
            name,
            fullName: name,
            email,
            role,
            department,
            phone,
          },
        },
        {
          onSuccess: (updatedUser) => {
            onSuccessToast(`Đã cập nhật thông tin người dùng ${updatedUser.name} thành công!`);
            onClose();
          },
          onError: (err: any) => {
            setError(err.message || 'Không thể cập nhật người dùng');
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name,
          fullName: name,
          email,
          userName: email.split('@')[0],
          password: password || 'Nexora@2026',
          role,
          department,
          phone,
        },
        {
          onSuccess: (createdUser) => {
            onSuccessToast(`Đã thêm người dùng ${createdUser.name} thành công!`);
            onClose();
          },
          onError: (err: any) => {
            setError(err.message || 'Không thể tạo mới người dùng');
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
      title={isEditMode ? 'Chỉnh sửa thông tin người dùng' : 'Thêm người dùng mới'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {error && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-[11px] leading-relaxed">
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Họ và tên <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <UserIcon className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email đăng nhập <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="VD: a.nguyen@congty.vn"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 text-xs"
            />
          </div>
        </div>

        {!isEditMode && (
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Mật khẩu khởi tạo (Mặc định: Nexora@2026)
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu hoặc để trống lấy mặc định"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 text-xs"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Phòng ban</label>
            <div className="relative flex items-center">
              <Building className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 text-xs cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
                <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                <option value="Ban Giám đốc">Ban Giám đốc</option>
                <option value="Phòng Sản phẩm">Phòng Sản phẩm</option>
                <option value="Phòng Marketing">Phòng Marketing</option>
                <option value="Phòng Nhân sự">Phòng Nhân sự</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Vai trò</label>
            <div className="relative flex items-center">
              <Shield className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 text-xs cursor-pointer"
              >
                <option value="Quản trị viên">Quản trị viên</option>
                <option value="Trưởng phòng">Trưởng phòng</option>
                <option value="Trưởng dự án">Trưởng dự án</option>
                <option value="Nhân viên">Nhân viên</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Số điện thoại</label>
          <div className="relative flex items-center">
            <Phone className="w-4 h-4 absolute left-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0912 345 678"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 text-xs"
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-2xs shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-colors"
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
