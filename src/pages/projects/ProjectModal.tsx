import React, { useState } from 'react';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  const { addProject, departments } = useApp();
  const [name, setName] = useState('');
  const [lead, setLead] = useState('Anh Khoa');
  const [department, setDepartment] = useState(departments[0]?.name || 'Sản phẩm');
  const [deadline, setDeadline] = useState('2024-07-30');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addProject({
      name,
      lead,
      progress: 0,
      status: 'Đang triển khai',
      deadline,
      taskCount: 0,
      completedTasks: 0,
      membersCount: 4
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo dự án mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên dự án <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Nâng cấp hệ thống AI RAG Phase 3"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quản lý dự án (Project Lead)</label>
            <input
              type="text"
              required
              value={lead}
              onChange={(e) => setLead(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phòng ban phụ trách</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn hoàn thành</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mô tả mục tiêu dự án</label>
          <textarea
            rows={3}
            placeholder="Mô tả phạm vi và mục tiêu chính của dự án..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-xs cursor-pointer"
          >
            Xác nhận khởi tạo
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default ProjectModal;

