import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { showToast } = useApp();
  const [currentMonth] = useState('Tháng 05, 2024');
  const [selectedDay, setSelectedDay] = useState(16);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  const getEventsForDay = (day: number) => {
    if (day === 14) return [{ title: 'Họp khởi động dự án CRM', type: 'meeting', time: '14:00' }];
    if (day === 16) return [{ title: 'Phát triển module Lịch & Phòng họp', type: 'task', time: '09:00' }];
    if (day === 20) return [{ title: 'Họp Ban giám đốc tuần 20', type: 'meeting', time: '09:00' }];
    if (day === 22) return [{ title: 'Kiểm thử hiệu năng RAG', type: 'task', time: '10:00' }];
    if (day === 25) return [{ title: 'Bàn giao Phase 2 Beta', type: 'milestone', time: '17:00' }];
    return [];
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black transition-colors">
      <Header title="Lịch & Phòng họp" subTitle="Lịch làm việc tập trung, đặt phòng họp và đồng bộ lịch họp AI" />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Calendar Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
          {/* Month Navigator Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{currentMonth}</h2>
              <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 p-0.5 shadow-2xs">
                <button
                  onClick={() => showToast('Tháng trước', 'info')}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => showToast('Tháng sau', 'info')}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 rounded cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Thêm sự kiện mới', 'info')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm sự kiện</span>
              </button>
            </div>
          </div>

          {/* Calendar Grid 7 days */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs overflow-hidden transition-colors">
            <div className="grid grid-cols-7 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 font-bold text-xs text-center py-3 uppercase tracking-wider text-[11px]">
              <div>T2</div>
              <div>T3</div>
              <div>T4</div>
              <div>T5</div>
              <div>T6</div>
              <div className="text-blue-600 dark:text-blue-400">T7</div>
              <div className="text-rose-600 dark:text-rose-400">CN</div>
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-zinc-800/80">
              {/* Empty leading days */}
              <div className="min-h-[100px] p-2 bg-slate-50/30 dark:bg-zinc-950/40 opacity-40 text-slate-400 text-xs">29</div>
              <div className="min-h-[100px] p-2 bg-slate-50/30 dark:bg-zinc-950/40 opacity-40 text-slate-400 text-xs">30</div>

              {/* 31 days */}
              {daysInMonth.map((day) => {
                const isSelected = selectedDay === day;
                const isToday = day === 16;
                const events = getEventsForDay(day);

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[100px] p-2 transition-all cursor-pointer relative space-y-1 ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-zinc-800/80 ring-2 ring-blue-600/40 dark:ring-blue-500/40 inset-0 z-10'
                        : 'hover:bg-slate-50/70 dark:hover:bg-zinc-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isToday
                            ? 'bg-blue-600 text-white shadow-2xs shadow-blue-500/30'
                            : 'text-slate-800 dark:text-zinc-200'
                        }`}
                      >
                        {day}
                      </span>
                      {events.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                      )}
                    </div>

                    {/* Events pills */}
                    <div className="space-y-1">
                      {events.map((evt, idx) => (
                        <div
                          key={idx}
                          className={`p-1 rounded text-[10px] font-semibold truncate ${
                            evt.type === 'meeting'
                              ? 'bg-blue-100 dark:bg-zinc-800 text-blue-800 dark:text-blue-300 border border-blue-200/50 dark:border-zinc-700'
                              : evt.type === 'milestone'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                          }`}
                        >
                          {evt.time} {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Event Detail Sidebar */}
        <aside className="w-80 bg-white dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800 p-5 flex flex-col gap-5 shrink-0 overflow-y-auto hidden lg:flex select-none text-xs transition-colors">
          <div>
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
              Sự kiện ngày {selectedDay} Tháng 05
            </span>
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm mt-1">Lịch trình & Việc cần làm</h3>
          </div>

          <div className="space-y-3">
            {getEventsForDay(selectedDay).length > 0 ? (
              getEventsForDay(selectedDay).map((evt, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800 rounded space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-zinc-100 text-xs">{evt.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    <span>{evt.time}</span>
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                Không có sự kiện hoặc cuộc họp nào trong ngày này.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
export default CalendarPage;
