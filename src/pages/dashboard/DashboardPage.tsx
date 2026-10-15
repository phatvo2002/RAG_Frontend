import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useNavigate } from '@tanstack/react-router';
import { CustomTable } from '@/components/customTable';
import {
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
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface TaskPriorityItem {
  id: string;
  name: string;
  project: string;
  deadline: string;
  isOverdue?: boolean;
  isToday?: boolean;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  status: 'Cần phản hồi' | 'Đang thực hiện' | 'Chưa bắt đầu';
  assignee: {
    name: string;
    username: string;
    avatarBg: string;
  };
}

const mockTasksPriority: TaskPriorityItem[] = [
  {
    id: 't1',
    name: 'Phê duyệt ngân sách Q2/2024',
    project: 'Dự án ERP Nexora',
    deadline: 'Hôm nay',
    isToday: true,
    priority: 'Cao',
    status: 'Cần phản hồi',
    assignee: { name: 'Lê Như', username: 'lenhu', avatarBg: 'bg-blue-600' },
  },
  {
    id: 't2',
    name: 'Rà soát yêu cầu & đặc tả chức năng',
    project: 'Ứng dụng CRM',
    deadline: 'Ngày mai',
    priority: 'Cao',
    status: 'Đang thực hiện',
    assignee: { name: 'Văn Phát', username: 'phat1', avatarBg: 'bg-emerald-600' },
  },
  {
    id: 't3',
    name: 'Kiểm thử tích hợp (UAT)',
    project: 'Dự án ERP Nexora',
    deadline: '23/05/2024',
    priority: 'Trung bình',
    status: 'Đang thực hiện',
    assignee: { name: 'Phát Nguyễn', username: 'Phat', avatarBg: 'bg-blue-600' },
  },
  {
    id: 't4',
    name: 'Chuẩn hóa dữ liệu khách hàng',
    project: 'Data Warehouse',
    deadline: '24/05/2024',
    priority: 'Trung bình',
    status: 'Cần phản hồi',
    assignee: { name: 'Nguyễn Tuấn', username: 'ngtuan', avatarBg: 'bg-blue-600' },
  },
  {
    id: 't5',
    name: 'Đào tạo người dùng đợt 2',
    project: 'Ứng dụng CRM',
    deadline: '24/05/2024',
    priority: 'Thấp',
    status: 'Chưa bắt đầu',
    assignee: { name: 'Vũ Hiếu', username: 'vhieu', avatarBg: 'bg-indigo-600' },
  },
  {
    id: 't6',
    name: 'Báo cáo tiến độ tuần 21',
    project: 'Văn phòng PMO',
    deadline: '27/05/2024',
    priority: 'Thấp',
    status: 'Chưa bắt đầu',
    assignee: { name: 'Admin', username: 'Admin', avatarBg: 'bg-blue-600' },
  },
  {
    id: 't7',
    name: 'Đánh giá rủi ro dự án',
    project: 'Dự án ERP Nexora',
    deadline: '28/05/2024',
    priority: 'Cao',
    status: 'Đang thực hiện',
    assignee: { name: 'Văn Phát', username: 'phat1', avatarBg: 'bg-emerald-600' },
  },
];

const mockProjectTimelines = [
  {
    name: 'Dự án ERP Nexora',
    progress: 68,
    greenWidth: '60%',
    redWidth: '8%',
    orangeWidth: '0%',
  },
  {
    name: 'Ứng dụng CRM',
    progress: 52,
    greenWidth: '42%',
    orangeWidth: '10%',
    redWidth: '0%',
  },
  {
    name: 'Data Warehouse',
    progress: 41,
    greenWidth: '35%',
    orangeWidth: '6%',
    redWidth: '0%',
  },
  {
    name: 'Website Nexora',
    progress: 78,
    greenWidth: '78%',
    orangeWidth: '0%',
    redWidth: '0%',
  },
];

export const DashboardPage: React.FC = () => {
  const { showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const statusLabel = (value: string) => ({ 'Cần phản hồi': tr('Needs response', 'Cần phản hồi'), 'Đang thực hiện': tr('In progress', 'Đang thực hiện'), 'Chưa bắt đầu': tr('Not started', 'Chưa bắt đầu') }[value] ?? value);
  const priorityLabel = (value: string) => ({ 'Cao': tr('High', 'Cao'), 'Trung bình': tr('Medium', 'Trung bình'), 'Thấp': tr('Low', 'Thấp') }[value] ?? value);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'overdue' | 'feedback' | 'doing'>('all');

  const filteredTasks = mockTasksPriority.filter((t) => {
    if (activeTab === 'overdue') return t.isOverdue || t.isToday;
    if (activeTab === 'feedback') return t.status === 'Cần phản hồi';
    if (activeTab === 'doing') return t.status === 'Đang thực hiện';
    return true;
  });

  const getPriorityColor = (priority: string) => {
    if (priority === 'Cao') return 'text-rose-500';
    if (priority === 'Trung bình') return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Cần phản hồi':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'Đang thực hiện':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'Chưa bắt đầu':
        return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        
        {/* Page Title & Subtitle matching 01-executive-dashboard.png */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            {tr('Executive overview', 'Tổng quan điều hành')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {tr('Today’s priorities, progress, and risks', 'Ưu tiên, tiến độ và rủi ro cần chú ý hôm nay')}
          </p>
        </div>

        {/* 1. Top 4 KPI Stat Cards matching 01-executive-dashboard.png */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{tr('Active projects', 'Dự án đang chạy')}</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>{tr('↑ 2 vs. last week', '↑ 2 so với tuần trước')}</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{tr('Tasks requiring action', 'Công việc cần xử lý')}</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">28</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>{tr('↑ 6 vs. yesterday', '↑ 6 so với hôm qua')}</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{tr('Indexed documents', 'Tài liệu đã lập chỉ mục')}</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">8.356</div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>{tr('↑ 312 vs. last week', '↑ 312 so với tuần trước')}</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">{tr('Meetings today', 'Cuộc họp hôm nay')}</span>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</div>
              <div className="text-[11px] font-medium text-rose-500 flex items-center gap-1">
                <span>{tr('↓ 1 vs. yesterday', '↓ 1 so với hôm qua')}</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
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
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{tr('Today’s priorities', 'Ưu tiên hôm nay')}</h3>
                <button
                  onClick={() => navigate({ to: '/tasks' as any })}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {tr('View all', 'Xem tất cả')}
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
                    {tr('All', 'Tất cả')} (28)
                  </button>
                  <button
                    onClick={() => setActiveTab('overdue')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === 'overdue'
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                    }`}
                  >
                    {tr('Overdue', 'Quá hạn')} (7)
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === 'feedback'
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                    }`}
                  >
                    {tr('Needs response', 'Cần phản hồi')} (12)
                  </button>
                  <button
                    onClick={() => setActiveTab('doing')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      activeTab === 'doing'
                        ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400'
                    }`}
                  >
                    {tr('In progress', 'Đang thực hiện')} (9)
                  </button>
                </div>

                <button
                  onClick={() => showToast(tr('Open advanced filters', 'Mở bộ lọc nâng cao'), 'info')}
                  className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 rounded-md text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Filter className="w-3 h-3" />
                  <span>{tr('Filters', 'Bộ lọc')}</span>
                </button>
              </div>

              {/* Tasks Table */}
              <CustomTable<any> columns={[]} data={[]} className="border-0 shadow-none rounded-none">
              <div className="overflow-x-auto">
                <CustomTable.Table className="w-full text-left text-xs border-collapse">
                  <CustomTable.Head className="bg-slate-50/70 dark:bg-zinc-900 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                    <CustomTable.Row>
                      <CustomTable.HeaderCell className="w-10 px-4 py-3 text-center">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700" />
                      </CustomTable.HeaderCell>
                      <CustomTable.HeaderCell className="px-3 py-3">{tr('TASK', 'CÔNG VIỆC')}</CustomTable.HeaderCell>
                      <CustomTable.HeaderCell className="px-3 py-3">{tr('PROJECT', 'DỰ ÁN')}</CustomTable.HeaderCell>
                      <CustomTable.HeaderCell className="px-3 py-3">{tr('DUE DATE', 'HẠN HOÀN THÀNH')}</CustomTable.HeaderCell>
                      <CustomTable.HeaderCell className="px-3 py-3">{tr('PRIORITY', 'ƯU TIÊN')}</CustomTable.HeaderCell>
                      <CustomTable.HeaderCell className="px-3 py-3">{tr('STATUS', 'TRẠNG THÁI')}</CustomTable.HeaderCell>
                      <CustomTable.HeaderCell className="px-3 py-3">{tr('ASSIGNEE', 'GIAO CHO')}</CustomTable.HeaderCell>
                      <CustomTable.HeaderCell className="w-10 px-4 py-3 text-right"></CustomTable.HeaderCell>
                    </CustomTable.Row>
                  </CustomTable.Head>
                  <CustomTable.Body className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {filteredTasks.map((task) => (
                      <CustomTable.Row
                        key={task.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <CustomTable.Cell className="px-4 py-3 text-center">
                          <input type="checkbox" className="rounded border-slate-300 dark:border-zinc-700 cursor-pointer" />
                        </CustomTable.Cell>
                        <CustomTable.Cell className="px-3 py-3 font-semibold text-slate-900 dark:text-zinc-100">
                          {task.name}
                        </CustomTable.Cell>
                        <CustomTable.Cell className="px-3 py-3 text-slate-600 dark:text-zinc-400">
                          {task.project}
                        </CustomTable.Cell>
                        <CustomTable.Cell className="px-3 py-3">
                          <span
                            className={`font-semibold ${
                              task.isToday
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-600 dark:text-zinc-400'
                            }`}
                          >
                            {task.deadline === 'Hôm nay' ? tr('Today', 'Hôm nay') : task.deadline === 'Ngày mai' ? tr('Tomorrow', 'Ngày mai') : task.deadline}
                          </span>
                        </CustomTable.Cell>
                        <CustomTable.Cell className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 font-medium ${getPriorityColor(task.priority)}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            {priorityLabel(task.priority)}
                          </span>
                        </CustomTable.Cell>
                        <CustomTable.Cell className="px-3 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusBadge(task.status)}`}>
                            {statusLabel(task.status)}
                          </span>
                        </CustomTable.Cell>
                        <CustomTable.Cell className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full ${task.assignee.avatarBg} text-white font-bold text-[9px] flex items-center justify-center shrink-0`}>
                              {task.assignee.username.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-slate-700 dark:text-zinc-300 text-[11px] font-medium truncate max-w-[80px]">
                              {task.assignee.username}
                            </span>
                          </div>
                        </CustomTable.Cell>
                        <CustomTable.Cell className="px-4 py-3 text-right">
                          <button
                            onClick={() => showToast(tr(`Options for ${task.name}`, `Tùy chọn ${task.name}`), 'info')}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded cursor-pointer"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </CustomTable.Cell>
                      </CustomTable.Row>
                    ))}
                  </CustomTable.Body>
                </CustomTable.Table>
              </div>
              </CustomTable>

              {/* Table Pagination */}
              <div className="nexora-table-footer px-4 py-3 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>{tr(`Showing 1–${filteredTasks.length} of 28`, `Hiển thị 1–${filteredTasks.length} trong 28`)}</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span>10 / trang</span>
                  </div>
                  <span>1 / 3</span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 border border-slate-200 dark:border-zinc-800 rounded hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-40" disabled>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 border border-slate-200 dark:border-zinc-800 rounded hover:bg-slate-50 dark:hover:bg-zinc-800">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Tổng quan tiến độ dự án (Gantt timeline) */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{tr('Project progress overview', 'Tổng quan tiến độ dự án')}</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {tr('On track', 'Đúng tiến độ')}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    {tr('Slightly delayed', 'Chậm nhẹ')}
                  </span>
                  <span className="flex items-center gap-1 text-slate-600 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    {tr('Significantly delayed', 'Chậm nghiêm trọng')}
                  </span>
                </div>
              </div>

              {/* Timeline Header Grid */}
              <div className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-zinc-800/80 pb-2">
                  <div className="col-span-3">{tr('PROJECT', 'DỰ ÁN')}</div>
                  <div className="col-span-3 text-center border-l border-slate-100 dark:border-zinc-800">04/2024</div>
                  <div className="col-span-3 text-center border-l border-slate-100 dark:border-zinc-800">05/2024</div>
                  <div className="col-span-2 text-center border-l border-slate-100 dark:border-zinc-800">06/2024</div>
                  <div className="col-span-1 text-right">{tr('PROGRESS', 'TIẾN ĐỘ')}</div>
                </div>

                {/* Project Rows */}
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

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>{tr('Illustrative data', 'Dữ liệu minh họa')}</span>
                <button
                  onClick={() => navigate({ to: '/projects' as any })}
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {tr('View all projects', 'Xem tất cả dự án')}
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT 1/3 COLUMN: Cảnh báo & Rủi ro + Hoạt động gần đây */}
          <div className="space-y-6">
            
            {/* Box 1: Cảnh báo & rủi ro */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{tr('Alerts & risks', 'Cảnh báo & rủi ro')}</h3>
                <button
                  onClick={() => showToast(tr('View system risk register', 'Xem danh mục rủi ro hệ thống'), 'info')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {tr('View all', 'Xem tất cả')}
                </button>
              </div>

              <div className="space-y-3">
                {/* Item 1 */}
                <div className="p-3 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">Dự án ERP Nexora</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {tr('Integration testing (UAT) may be delayed', 'Nguy cơ trễ hạn giai đoạn Kiểm thử tích hợp (UAT)')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 rounded shrink-0">
                    Cao
                  </span>
                </div>

                {/* Item 2 */}
                <div className="p-3 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">Ứng dụng CRM</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {tr('Waiting for a response from Sales', 'Phụ thuộc chờ phản hồi từ phòng Kinh doanh')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 rounded shrink-0">
                    {tr('Medium', 'Trung bình')}
                  </span>
                </div>

                {/* Item 3 */}
                <div className="p-3 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">Data Warehouse</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {tr('Data entry is 15% behind schedule', 'Tiến độ nhập dữ liệu chậm 15% so với kế hoạch')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 rounded shrink-0">
                    {tr('Medium', 'Trung bình')}
                  </span>
                </div>

                {/* Item 4 */}
                <div className="p-3 bg-slate-50/70 dark:bg-zinc-800/50 rounded-lg border border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-zinc-100">{tr('Security policy', 'Chính sách bảo mật')}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {tr('New policy update requires confirmation', 'Cập nhật chính sách mới — cần xác nhận')}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded shrink-0">
                    {tr('Info', 'Thông tin')}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Hoạt động gần đây */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{tr('Recent activity', 'Hoạt động gần đây')}</h3>
                <button
                  onClick={() => navigate({ to: '/admin/logs' as any })}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {tr('View all', 'Xem tất cả')}
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
                      <strong>lenhu</strong> {tr('completed task', 'đã hoàn thành công việc')} <strong>"{tr('Business requirements analysis', 'Phân tích yêu cầu nghiệp vụ')}"</strong>
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
                      <strong>phat1</strong> {tr('uploaded document', 'đã tải lên tài liệu')} <strong>"{tr('Feature specification v1.2.pdf', 'Đặc tả tính năng v1.2.pdf')}"</strong>
                    </p>
                    <span className="text-[10px] text-slate-400">Ứng dụng CRM</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-slate-400 shrink-0 mt-0.5">09:31</span>
                  <div className="w-4 h-4 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-zinc-300">
                      {tr('Meeting', 'Họp')} <strong>"{tr('Project progress review', 'Rà soát tiến độ dự án')}"</strong> {tr('was updated', 'đã được cập nhật')}
                    </p>
                    <span className="text-[10px] text-slate-400">{tr('Meeting Room A', 'Phòng họp A')} • 11:00 – 12:00</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-slate-400 shrink-0 mt-0.5">09:12</span>
                  <div className="w-4 h-4 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-zinc-300">
                      {tr('System created an alert for', 'Hệ thống tạo cảnh báo cho')} <strong>{tr('Nexora ERP Project', 'Dự án ERP Nexora')}</strong>
                    </p>
                    <span className="text-[10px] text-slate-400">{tr('Integration testing (UAT) may be delayed', 'Nguy cơ trễ hạn giai đoạn Kiểm thử tích hợp (UAT)')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-slate-400 shrink-0 mt-0.5">08:45</span>
                  <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 dark:text-zinc-300">
                      <strong>vhieu</strong> {tr('approved the Q2/2024 budget', 'đã phê duyệt ngân sách Q2/2024')}
                    </p>
                    <span className="text-[10px] text-slate-400">Dự án ERP Nexora</span>
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

export default DashboardPage;
