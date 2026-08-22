import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Badge, Button } from '@/components/button';
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
  Download,
  Filter,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { showToast } = useApp();
  const [timeRange, setTimeRange] = useState('Tháng này');

  const monthlyProgress = [
    { name: 'T1', projectProgress: 45, taskDone: 120, aiUsage: 1200 },
    { name: 'T2', projectProgress: 52, taskDone: 145, aiUsage: 2100 },
    { name: 'T3', projectProgress: 61, taskDone: 180, aiUsage: 3400 },
    { name: 'T4', projectProgress: 70, taskDone: 210, aiUsage: 4200 },
    { name: 'T5', projectProgress: 82, taskDone: 260, aiUsage: 5800 }
  ];

  const deptWorkload = [
    { name: 'Sản phẩm', tasks: 48, completed: 36 },
    { name: 'Kỹ thuật', tasks: 62, completed: 48 },
    { name: 'Marketing', tasks: 28, completed: 22 },
    { name: 'Nhân sự', tasks: 18, completed: 16 }
  ];

  const taskTypePie = [
    { name: 'Phát triển RAG', value: 35, color: '#2563eb' },
    { name: 'Quản lý dự án', value: 25, color: '#7c3aed' },
    { name: 'Bảo mật & Phân quyền', value: 20, color: '#059669' },
    { name: 'Tạo tài liệu', value: 20, color: '#ea580c' }
  ];

  const handleGenerateAIReport = () => {
    showToast('AI đang tổng hợp và phân tích số liệu báo cáo...', 'info');
    setTimeout(() => {
      showToast('Báo cáo phân tích hiệu suất AI đã sẵn sàng!', 'success');
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <Header title="Báo cáo & Phân tích" subTitle="Thống kê hiệu suất toàn diện và dự báo tiến độ thông minh" />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
              >
                <option value="Tuần này">Tuần này</option>
                <option value="Tháng này">Tháng này (Tháng 5)</option>
                <option value="Quý 2">Quý 2, 2024</option>
                <option value="Năm 2024">Cả năm 2024</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateAIReport}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>AI Tổng hợp báo cáo</span>
              </button>

              <ExcelExport data={monthlyProgress} filename="bao_cao_thang.xlsx" />
              <WordExport content="<h1>Báo cáo tổng kết dự án</h1>" filename="bao_cao.doc" />
            </div>
          </div>

          {/* 3 Metric Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Tỷ lệ hoàn thành nhiệm vụ</span>
              <div className="text-2xl font-bold text-slate-900">82.4%</div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% so với tháng trước</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Khối lượng truy vấn AI</span>
              <div className="text-2xl font-bold text-slate-900">5,800 lượt</div>
              <p className="text-[11px] text-blue-600 font-semibold">Tiết kiệm ~120 giờ làm việc</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <span className="text-xs text-slate-500 font-medium">Dự án đúng hạn</span>
              <div className="text-2xl font-bold text-slate-900">91.6%</div>
              <p className="text-[11px] text-emerald-600 font-semibold">11/12 dự án đúng tiến độ</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Tiến độ và Khối lượng công việc theo tháng */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Xu hướng hoàn thành công việc theo tháng</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="taskDone" fill="#2563eb" radius={[6, 6, 0, 0]} name="Task hoàn thành" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Khối lượng công việc các phòng ban */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Hiệu suất phân bổ phòng ban</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptWorkload}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Tổng task" />
                    <Bar dataKey="completed" fill="#059669" radius={[6, 6, 0, 0]} name="Đã xong" />
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

