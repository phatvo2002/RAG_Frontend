import React, { useState } from 'react';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { Building, Phone, MapPin, User } from 'lucide-react';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({ isOpen, onClose }) => {
  const { addDepartment, showToast } = useApp();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [head, setHead] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addDepartment({
      name,
      code: code || name.slice(0, 4).toUpperCase(),
      phone,
      address,
      head: head || 'Chưa phân công',
      description,
      memberCount: 0,
      status: 'Đang hoạt động',
    });

    showToast(`Đã thêm phòng ban "${name}" thành công!`, 'success');
    setName('');
    setCode('');
    setPhone('');
    setAddress('');
    setHead('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm phòng ban mới" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">
              Tên phòng ban <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Building className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Phòng Công nghệ Thông tin"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Mã phòng ban</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0274 374 0530"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Địa chỉ / Vị trí</label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 absolute left-3 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
              value={head}
              onChange={(e) => setHead(e.target.value)}
              placeholder="VD: Nguyễn Văn B"
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">Mô tả chức năng</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ngắn về nhiệm vụ của phòng ban..."
            className="w-full p-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800 text-xs"
          />
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-2xs shadow-blue-500/20 cursor-pointer transition-colors"
          >
            Tạo phòng ban
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default DepartmentModal;
