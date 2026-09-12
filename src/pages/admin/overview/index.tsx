import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useUsersQuery } from '@/api/users.api';
import { useDepartmentsQuery } from '@/api/departments.api';
import { useRolesQuery } from '@/api/roles.api';
import { useNavigate } from '@tanstack/react-router';
import { CustomTable } from '@/components/customTable';
import {
  Users,
  Building2,
  Shield,
  Clock,
  Sliders,
  FileCheck2,
  FolderKanban,
  CheckSquare,
  FileText,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { departments: localDepts } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'feedback' | 'doing'>('all');

  // TanStack Queries
  const { data: users = [] } = useUsersQuery();
  const { data: departments = [] } = useDepartmentsQuery();
  const { data: roles = [] } = useRolesQuery();

  const activeUsersCount = users.filter((u) => u.isActive !== false && u.status !== 'Inactive' && u.status !== 'Bị khóa').length;

  const mockTasksPriority = [
    {
      id: 't1',
      name: 'Phê duyệt ngân sách Q2/2024',
      project: 'Dự án ERP Nexora',
      deadline: 'Hôm nay',
      isToday: true,
      priority: 'Cao',
      status: 'Cần phản hồi',
      assignee: { username: 'lenhu', avatarBg: 'bg-blue-600' },
    },
    {
      id: 't2',
      name: 'Rà soát yêu cầu & đặc tả chức năng',
      project: 'Ứng dụng CRM',
      deadline: 'Ngày mai',
      priority: 'Cao',
      status: 'Đang thực hiện',
      assignee: { username: 'phat1', avatarBg: 'bg-emerald-600' },
    },
    {
      id: 't3',
      name: 'Kiểm thử tích hợp (UAT)',
      project: 'Dự án ERP Nexora',
      deadline: '23/05/2024',
      priority: 'Trung bình',
      status: 'Đang thực hiện',
      assignee: { username: 'Phat', avatarBg: 'bg-blue-600' },
    },
    {
      id: 't4',
      name: 'Chuẩn hóa dữ liệu khách hàng',
      project: 'Data Warehouse',
      deadline: '24/05/2024',
      priority: 'Trung bình',
      status: 'Cần phản hồi',
      assignee: { username: 'ngtuan', avatarBg: 'bg-blue-600' },
    },
    {
      id: 't5',
      name: 'Đào tạo người dùng đợt 2',
      project: 'Ứng dụng CRM',
      deadline: '24/05/2024',
      priority: 'Thấp',
      status: 'Chưa bắt đầu',
      assignee: { username: 'vhieu', avatarBg: 'bg-indigo-600' },
    },
  ];

  const mockProjectTimelines = [
    { name: 'Dự án ERP Nexora', progress: 68, greenWidth: '60%', redWidth: '8%', orangeWidth: '0%' },
    { name: 'Ứng dụng CRM', progress: 52, greenWidth: '42%', orangeWidth: '10%', redWidth: '0%' },
    { name: 'Data Warehouse', progress: 41, greenWidth: '35%', orangeWidth: '6%', redWidth: '0%' },
    { name: 'Website Nexora', progress: 78, greenWidth: '78%', orangeWidth: '0%', redWidth: '0%' },
  ];

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Tổng quan Quản trị Hệ thống
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Trung tâm điều hành cấu hình, tài khoản và an ninh dữ liệu
          </p>
        </div>

        {/* Top 4 KPI Stat Cards matching 01-executive-dashboard.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate({ to: '/admin/users' as any })}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-blue-300 dark:hover:border-zinc-700 transition-all"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Người dùng hệ thống</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length || 12}</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {activeUsersCount || 3} đang hoạt động
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => navigate({ to: '/admin/departments' as any })}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-blue-300 dark:hover:border-zinc-700 transition-all"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Phòng ban tổ chức</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{departments.length || 6}</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Đã chuẩn hóa cơ cấu
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => navigate({ to: '/admin/roles' as any })}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-blue-300 dark:hover:border-zinc-700 transition-all"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Vai trò & Quyền hạn</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{roles.length || 4}</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Phân quyền theo module
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => navigate({ to: '/admin/logs' as any })}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs flex items-center justify-between cursor-pointer hover:border-blue-300 dark:hover:border-zinc-700 transition-all"
          >
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Nhật ký hoạt động</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Audit Trail đầy đủ
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 2. Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT 2/3 COLUMN: Ưu tiên hôm nay + Tiến độ dự án */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section: Ưu tiên hôm nay */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Ưu tiên hôm nay</h3>
                <button
                  onClick={() => navigate({ to: '/admin/users' as any })}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>

              {/* Subheader Filter Tabs */}
              <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-zinc-900/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                    }`}
                  >
                    Tất cả (28)
                  </button>
                  <button
                    onClick={() => setActiveTab('overdue')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === 'overdue'
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                    }`}
                  >
                    Quá hạn (7)
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === 'feedback'
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                    }`}
                  >
                    Cần phản hồi (12)
                  </button>
                  <button
                    onClick={() => setActiveTab('doing')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === 'doing'
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                    }`}
                  >
                    Đang thực hiện (9)
                  </button>
                </div>
              </div>

              {/* Tasks Table */}
              <CustomTable<any> columns={[]} data={[]} className="border-0 shadow-none rounded-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50/70 dark:bg-zinc-900 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                    <tr>
                      <th className="w-10 px-4 py-3 text-center">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </th>
                      <th className="px-3 py-3">CÔNG VIỆC</th>
                      <th className="px-3 py-3">DỰ ÁN</th>
                      <th className="px-3 py-3">HẠN HOÀN THÀNH</th>
                      <th className="px-3 py-3">ƯU TIÊN</th>
                      <th className="px-3 py-3">TRẠNG THÁI</th>
                      <th className="px-3 py-3">GIAO CHO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {mockTasksPriority.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-4 py-3 text-center">
                          <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700 cursor-pointer" />
                        </td>
                        <td className="px-3 py-3 font-semibold text-slate-900 dark:text-zinc-100">
                          {task.name}
                        </td>
                        <td className="px-3 py-3 text-slate-600 dark:text-zinc-400">
                          {task.project}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`font-semibold ${
                              task.isToday
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-600 dark:text-zinc-400'
                            }`}
                          >
                            {task.deadline}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 font-medium ${task.priority === 'Cao' ? 'text-rose-500' : 'text-amber-500'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            {task.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full ${task.assignee.avatarBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                              {task.assignee.username.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-slate-700 dark:text-zinc-300 text-[11px] font-medium">
                              {task.assignee.username}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </CustomTable>
            </div>

            {/* Section: Tổng quan tiến độ dự án (Gantt timeline) */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Tổng quan tiến độ dự án</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Đúng tiến độ
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Chậm nhẹ
                  </span>
                </div>
              </div>

              {/* Timeline Header Grid */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-zinc-800/80 pb-2">
                  <div className="col-span-3">DỰ ÁN</div>
                  <div className="col-span-3 text-center border-l border-slate-100 dark:border-zinc-800">04/2024</div>
                  <div className="col-span-3 text-center border-l border-slate-100 dark:border-zinc-800">05/2024</div>
                  <div className="col-span-2 text-center border-l border-slate-100 dark:border-zinc-800">06/2024</div>
                  <div className="col-span-1 text-right">TIẾN ĐỘ</div>
                </div>

                {mockProjectTimelines.map((proj, idx) => (
                  <div key={idx} className="grid grid-cols-12 items-center text-xs py-1">
                    <div className="col-span-3 font-semibold text-slate-800 dark:text-zinc-200 truncate pr-2">
                      {proj.name}
                    </div>
                    <div className="col-span-8 px-2">
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden flex">
                        <div style={{ width: proj.greenWidth }} className="bg-emerald-500 h-full" />
                        {proj.orangeWidth !== '0%' && (
                          <div style={{ width: proj.orangeWidth }} className="bg-amber-500 h-full" />
                        )}
                        {proj.redWidth !== '0%' && (
                          <div style={{ width: proj.redWidth }} className="bg-rose-500 h-full" />
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 text-right font-mono font-bold text-slate-800 dark:text-zinc-200">
                      {proj.progress}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT 1/3 COLUMN: Cảnh báo & Rủi ro + Hoạt động gần đây */}
          <div className="space-y-6">
            
            {/* Box 1: Cảnh báo & rủi ro */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Cảnh báo & rủi ro</h3>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">4 mục</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">Dự án ERP Nexora</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Nguy cơ trễ hạn giai đoạn Kiểm thử tích hợp (UAT)
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 rounded shrink-0">
                    Cao
                  </span>
                </div>

                <div className="p-3 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">Ứng dụng CRM</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Phụ thuộc chờ phản hồi từ phòng Kinh doanh
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 rounded shrink-0">
                    Trung bình
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Hoạt động gần đây */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Hoạt động gần đây</h3>
                <button
                  onClick={() => navigate({ to: '/admin/logs' as any })}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Xem tất cả
                </button>
              </div>

              <div className="space-y-3.5 text-[11px]">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-slate-400 shrink-0 mt-0.5">10:24</span>
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-zinc-300">
                      <strong>lenhu</strong> đã hoàn thành công việc <strong>"Phân tích yêu cầu nghiệp vụ"</strong>
                    </p>
                    <span className="text-[10px] text-slate-400">Dự án ERP Nexora</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-slate-400 shrink-0 mt-0.5">09:58</span>
                  <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-zinc-300">
                      <strong>phat1</strong> đã tải lên tài liệu <strong>"Đặc tả tính năng v1.2.pdf"</strong>
                    </p>
                    <span className="text-[10px] text-slate-400">Ứng dụng CRM</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OverviewPage;
