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
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Tên cuộc họp <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Họp Sprint Review tuần 20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Ngày họp</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Khung giờ</label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="09:00 - 10:00"
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Địa điểm / Link họp</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Phòng họp A3 hoặc Link Teams"
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Dự án liên quan</label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer"
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
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Người chủ trì</label>
            <input
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Số người tham dự</label>
            <input
              type="number"
              min={1}
              value={participantsCount}
              onChange={(e) => setParticipantsCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-2xs shadow-blue-500/20 cursor-pointer transition-colors"
          >
            Tạo cuộc họp
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default MeetingModal;
