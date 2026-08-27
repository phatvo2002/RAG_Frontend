import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { meetingYupSchema, MeetingFormData } from '@/types';
import { AlertCircle } from 'lucide-react';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose }) => {
  const { addMeeting, projects, showToast } = useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeetingFormData>({
    resolver: yupResolver(meetingYupSchema) as any,
    defaultValues: {
      title: '',
      date: '2024-05-20',
      time: '09:00 - 10:00',
      location: 'Phòng họp A3',
      organizer: 'Anh Khoa',
      project: projects[0]?.name || 'NEXORA Platform',
      participantsCount: 5,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        date: '2024-05-20',
        time: '09:00 - 10:00',
        location: 'Phòng họp A3',
        organizer: 'Anh Khoa',
        project: projects[0]?.name || 'NEXORA Platform',
        participantsCount: 5,
      });
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: MeetingFormData) => {
    addMeeting({
      title: data.title,
      date: data.date,
      time: data.time,
      location: data.location || '',
      organizer: data.organizer,
      project: data.project,
      status: 'Sắp diễn ra',
      participantsCount: Number(data.participantsCount) || 1,
      hasTranscript: false,
      hasSummary: false,
    });

    showToast(`Đã lên lịch cuộc họp "${data.title}" thành công!`, 'success');
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo cuộc họp mới">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Tên cuộc họp <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="Ví dụ: Họp Sprint Review tuần 20"
            className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 ${
              errors.title
                ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.title.message}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Ngày họp <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              {...register('date')}
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer ${
                errors.date
                  ? 'border-rose-400 focus:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.date.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Khung giờ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('time')}
              placeholder="09:00 - 10:00"
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
                errors.time
                  ? 'border-rose-400 focus:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            />
            {errors.time && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.time.message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">Địa điểm / Link họp</label>
            <input
              type="text"
              {...register('location')}
              placeholder="Phòng họp A3 hoặc Link Teams"
              className="w-full px-3 py-2 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Dự án liên quan <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('project')}
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 cursor-pointer ${
                errors.project
                  ? 'border-rose-400 focus:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.project && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.project.message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Người chủ trì <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('organizer')}
              placeholder="VD: Anh Khoa"
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
                errors.organizer
                  ? 'border-rose-400 focus:border-rose-600 focus:bg-rose-50/10'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            />
            {errors.organizer && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.organizer.message}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Số người tham dự <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              {...register('participantsCount')}
              className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
                errors.participantsCount
                  ? 'border-rose-400 focus:border-rose-600'
                  : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
              }`}
            />
            {errors.participantsCount && (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.participantsCount.message}</span>
              </p>
            )}
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
