import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { ExcelExport } from '@/components/excelExport';
import { WordExport } from '@/components/wordExport';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Briefcase
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const [timeRange, setTimeRange] = useState('month');

  const monthlyProgress = [
    { name: tr('Jan', 'T1'), projectProgress: 45, taskDone: 120, aiUsage: 1200 },
    { name: tr('Feb', 'T2'), projectProgress: 52, taskDone: 145, aiUsage: 2100 },
    { name: tr('Mar', 'T3'), projectProgress: 61, taskDone: 180, aiUsage: 3400 },
    { name: tr('Apr', 'T4'), projectProgress: 70, taskDone: 210, aiUsage: 4200 },
    { name: tr('May', 'T5'), projectProgress: 82, taskDone: 260, aiUsage: 5800 }
  ];

  const deptWorkload = [
    { name: tr('Product', 'Sản phẩm'), tasks: 48, completed: 36 },
    { name: tr('Engineering', 'Kỹ thuật'), tasks: 62, completed: 48 },
    { name: 'Marketing', tasks: 28, completed: 22 },
    { name: tr('HR', 'Nhân sự'), tasks: 18, completed: 16 }
  ];

  const taskTypePie = [
    { name: tr('RAG development', 'Phát triển RAG'), value: 35, color: '#2563eb' },
    { name: tr('Project management', 'Quản lý dự án'), value: 25, color: '#7c3aed' },
    { name: tr('Security & permissions', 'Bảo mật & Phân quyền'), value: 20, color: '#059669' },
    { name: tr('Document creation', 'Tạo tài liệu'), value: 20, color: '#ea580c' }
  ];

  const handleGenerateAIReport = () => {
    showToast(tr('AI is compiling and analyzing report data...', 'AI đang tổng hợp và phân tích số liệu báo cáo...'), 'info');
    setTimeout(() => {
      showToast(tr('AI performance report is ready!', 'Báo cáo phân tích hiệu suất AI đã sẵn sàng!'), 'success');
    }, 2000);
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-black transition-colors">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        <div className="w-full space-y-6">
          {/* Page Title & Subtitle */}
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
              {tr('Reports & Analytics', 'Báo cáo & Phân tích')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {tr('Performance metrics and intelligent progress forecasts', 'Thống kê hiệu suất toàn diện và dự báo tiến độ thông minh')}
            </p>
          </div>

          {/* Controls row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3.5 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded text-xs font-semibold text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
              >
                <option value="week">{tr('This week', 'Tuần này')}</option>
                <option value="month">{tr('This month (May)', 'Tháng này (Tháng 5)')}</option>
                <option value="quarter">{tr('Q2, 2024', 'Quý 2, 2024')}</option>
                <option value="year">{tr('Full year 2024', 'Cả năm 2024')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateAIReport}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>{tr('Generate AI report', 'AI Tổng hợp báo cáo')}</span>
              </button>

              <ExcelExport data={monthlyProgress} filename="bao_cao_thang.xlsx" />
              <WordExport content={tr('<h1>Project summary report</h1>', '<h1>Báo cáo tổng kết dự án</h1>')} filename="report.doc" />
            </div>
          </div>

          {/* Key KPI Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs">
                <span>{tr('Project completion rate', 'Tỷ lệ hoàn thành dự án')}</span>
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">82.4%</div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{tr('+12% vs. last month', '+12% so với tháng trước')}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs">
                <span>{tr('Tasks completed', 'Tổng nhiệm vụ đã xử lý')}</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">260</div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">{tr('Average 18 tasks/day', 'Trung bình 18 việc/ngày')}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs">
                <span>{tr('Meeting hours & AI transcripts', 'Số giờ họp & biên bản AI')}</span>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">34.5h</div>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{tr('100% with AI transcripts', '100% có AI Transcript')}</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs">
                <span>{tr('AI RAG queries', 'Truy vấn AI RAG')}</span>
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">5,820</div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">{tr('RAG accuracy 96.8%', 'Độ chính xác RAG 96.8%')}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Trend Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{tr('Progress & task trends', 'Xu hướng tiến độ & Nhiệm vụ')}</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">{tr('Monthly goal completion rate', 'Tốc độ hoàn thành mục tiêu theo từng tháng')}</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>{tr('Progress (%)', 'Tiến độ (%)')}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>{tr('Tasks completed', 'Nhiệm vụ xong')}</span>
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="projectProgress" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="taskDone" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Department Workload Distribution */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{tr('Workload by department', 'Phân bổ theo phòng ban')}</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500">{tr('Workload and completion rate', 'Tải công việc và tỷ lệ xử lý xong')}</p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptWorkload} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" stroke="#71717a" fontSize={11} />
                    <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={11} width={70} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="completed" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReportsPage;
