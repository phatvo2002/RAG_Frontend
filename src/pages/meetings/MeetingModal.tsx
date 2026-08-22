import React, { useState } from 'react';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose }) => {
  const { addMeeting, projects } = useApp();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2024-05-20');
  const [time, setTime] = useState('09:00 - 10:00');
  const [location, setLocation] = useState('Phòng họp A3');
  const [organizer, setOrganizer] = useState('Anh Khoa');
  const [project, setProject] = useState(projects[0]?.name || 'NEXORA Platform');
  const [participantsCount, setParticipantsCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    addMeeting({
      title,
      date,
      time,
      location,
      organizer,
      project,
      status: 'Sắp diễn ra',
      participantsCount,
      hasTranscript: false,
      hasSummary: false
    });

    setTitle('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo cuộc họp mới">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tên cuộc họp <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Họp Sprint Review tuần 20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày họp</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Khung giờ</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="09:00 - 10:00"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Địa điểm / Link họp</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Phòng họp A3 hoặc Link Teams"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Dự án liên quan</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Người chủ trì</label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Số người tham dự</label>
            <input
              type="number"
              min={1}
              value={participantsCount}
              onChange={(e) => setParticipantsCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
            />
          </div>
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
            Tạo cuộc họp
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default MeetingModal;

