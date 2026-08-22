import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/button';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Users,
  MapPin,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const { meetings, tasks, showToast } = useApp();
  const [currentMonth, setCurrentMonth] = useState('Tháng 05, 2024');
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
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <Header title="Lịch & Phòng họp" subTitle="Lịch làm việc tập trung, đặt phòng họp và đồng bộ lịch họp AI" />

      <div className="flex-1 flex overflow-hidden">
        {/* Main Calendar Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Month Navigator Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{currentMonth}</h2>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shadow-2xs">
                <button
                  onClick={() => showToast('Tháng trước', 'info')}
                  className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => showToast('Tháng sau', 'info')}
                  className="p-1.5 hover:bg-slate-50 text-slate-600 rounded-lg cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('Thêm sự kiện mới', 'info')}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm sự kiện</span>
              </button>
            </div>
          </div>

          {/* Calendar Grid 7 days */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold text-xs text-center py-3 uppercase tracking-wider text-[11px]">
              <div>T2</div>
              <div>T3</div>
              <div>T4</div>
              <div>T5</div>
              <div>T6</div>
              <div className="text-blue-600">T7</div>
              <div className="text-rose-500">CN</div>
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
              {daysInMonth.map((day) => {
                const events = getEventsForDay(day);
                const isSelected = selectedDay === day;
                const isToday = day === 16;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`p-2 min-h-[100px] transition-colors cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-500'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-700'
                        }`}
                      >
                        {day}
                      </span>
                      {events.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>

                    <div className="space-y-1">
                      {events.map((evt, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded-lg text-[10px] font-semibold truncate ${
                            evt.type === 'meeting'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : evt.type === 'milestone'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}
                        >
                          <span className="opacity-70">{evt.time} </span>
                          <span>{evt.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Day Detail Pane */}
        <aside className="w-80 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto hidden md:flex select-none text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Lịch trình trong ngày
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              Ngày {selectedDay} Tháng 05, 2024
            </h3>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800">Sự kiện ({getEventsForDay(selectedDay).length})</h4>
            {getEventsForDay(selectedDay).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDay(selectedDay).map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{evt.title}</span>
                      <Badge variant="primary">{evt.type}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.time}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic py-4">Không có sự kiện hoặc cuộc họp nào.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
export default CalendarPage;

