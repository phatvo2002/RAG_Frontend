import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { ProjectModal } from './ProjectModal';
import { CustomTable } from '@/components/customTable';
import { Modal } from '@/components/disclosure';
import { useNavigate } from '@tanstack/react-router';
import {
  Plus,
  Search,
  Filter,
  List,
  Grid,
  Star,
  MoreHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Edit2,
  TrendingUp,
} from 'lucide-react';

interface ProjectRow {
  id: string;
  name: string;
  code: string;
  group: 'Đang triển khai' | 'Lên kế hoạch' | 'Đang đánh giá';
  owner: {
    name: string;
    initials: string;
    department: string;
    avatarBg: string;
  };
  health: 'Tốt' | 'Cảnh báo';
  progress: number;
  currentMilestone: string;
  deadline: string;
  openTasksCount: number;
  risk: 'Cao' | 'Trung bình' | 'Thấp';
  isStarred?: boolean;
}

const mockProjectsData: ProjectRow[] = [
  {
    id: 'p1',
    name: 'Dự án ERP Nexora',
    code: 'PRJ-2024-001',
    group: 'Đang triển khai',
    owner: { name: 'Vũ Hiếu', initials: 'VH', department: 'Phòng PMO', avatarBg: 'bg-blue-600' },
    health: 'Tốt',
    progress: 68,
    currentMilestone: 'Kiểm thử tích hợp (UAT)',
    deadline: '30/06/2024',
    openTasksCount: 12,
    risk: 'Trung bình',
    isStarred: true,
  },
  {
    id: 'p2',
    name: 'Ứng dụng CRM',
    code: 'PRJ-2024-002',
    group: 'Đang triển khai',
    owner: { name: 'Nguyễn Tuấn', initials: 'NT', department: 'Phòng Kinh doanh', avatarBg: 'bg-blue-600' },
    health: 'Cảnh báo',
    progress: 52,
    currentMilestone: 'Phát triển chức năng',
    deadline: '31/07/2024',
    openTasksCount: 9,
    risk: 'Thấp',
  },
  {
    id: 'p3',
    name: 'Data Warehouse',
    code: 'PRJ-2024-003',
    group: 'Lên kế hoạch',
    owner: { name: 'Phạm Thảo', initials: 'PT', department: 'Phòng IT', avatarBg: 'bg-blue-600' },
    health: 'Tốt',
    progress: 41,
    currentMilestone: 'Thiết kế dữ liệu',
    deadline: '31/08/2024',
    openTasksCount: 8,
    risk: 'Thấp',
  },
  {
    id: 'p4',
    name: 'Cổng thông tin nội bộ',
    code: 'PRJ-2024-004',
    group: 'Lên kế hoạch',
    owner: { name: 'Lê Huy', initials: 'LH', department: 'Phòng Hành chính', avatarBg: 'bg-blue-600' },
    health: 'Tốt',
    progress: 25,
    currentMilestone: 'Phân tích yêu cầu',
    deadline: '30/09/2024',
    openTasksCount: 6,
    risk: 'Thấp',
  },
  {
    id: 'p5',
    name: 'Chuẩn hóa quy trình mua hàng',
    code: 'PRJ-2024-005',
    group: 'Đang đánh giá',
    owner: { name: 'Admin', initials: 'AD', department: 'Ban Điều hành', avatarBg: 'bg-blue-600' },
    health: 'Cảnh báo',
    progress: 18,
    currentMilestone: 'Đánh giá hiện trạng',
    deadline: '15/10/2024',
    openTasksCount: 4,
    risk: 'Trung bình',
  },
];

export const ProjectsPage: React.FC = () => {
  const { showToast, language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const groupLabel = (value: string) => ({ 'Đang triển khai': tr('In progress', 'Đang triển khai'), 'Lên kế hoạch': tr('Planning', 'Lên kế hoạch'), 'Đang đánh giá': tr('In review', 'Đang đánh giá') }[value] ?? value);
  const healthLabel = (value: string) => ({ 'Tốt': tr('Good', 'Tốt'), 'Cảnh báo': tr('At risk', 'Cảnh báo') }[value] ?? value);
  const riskLabel = (value: string) => ({ 'Cao': tr('High', 'Cao'), 'Trung bình': tr('Medium', 'Trung bình'), 'Thấp': tr('Low', 'Thấp') }[value] ?? value);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'catalog' | 'progress' | 'tasks'>('catalog');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('p1');
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timelineView, setTimelineView] = useState<'list' | 'roadmap'>('list');

  const selectedProject = mockProjectsData.find((p) => p.id === selectedProjectId) || mockProjectsData[0];

  const filteredProjects = mockProjectsData.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || p.group === statusFilter;
    const matchDept = deptFilter === 'all' || p.owner.department.includes(deptFilter);
    return matchSearch && matchStatus && matchDept;
  });

  const groupedProjects = {
    'Đang triển khai': filteredProjects.filter((p) => p.group === 'Đang triển khai'),
    'Lên kế hoạch': filteredProjects.filter((p) => p.group === 'Lên kế hoạch'),
    'Đang đánh giá': filteredProjects.filter((p) => p.group === 'Đang đánh giá'),
  };

  const handleAskAI = (proj: ProjectRow) => {
    navigate({ to: '/chat' as any });
    showToast(tr(`Opened AI assistant with context ${proj.name}`, `Đã chuyển sang Trợ lý AI với ngữ cảnh ${proj.name}`), 'info');
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-black overflow-hidden transition-colors">
      
      {/* Global Header */}
      <Header />

      {/* Page Title & Actions Bar matching 04-project-task-workbench.png */}
      <div className="px-4 md:px-5 py-3 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-wrap shrink-0">
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            {tr('Projects & Tasks', 'Dự án & Công việc')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {tr('Track goals, progress, and related work in one place', 'Theo dõi mục tiêu, tiến độ và công việc liên quan trong một không gian')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{tr('Create project', 'Tạo dự án')}</span>
          </button>
          <button
            onClick={() => showToast(tr('Advanced options', 'Tùy chọn nâng cao'), 'info')}
            className="p-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-500 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Workbench */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* ==================================================================== */}
        {/* 1. LEFT 2/3 COLUMN: Tabs, Filters, Grouped Table & Milestone Timeline */}
        {/* ==================================================================== */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5 space-y-5 min-w-0">
          
          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`pb-2.5 relative transition-colors cursor-pointer ${
                activeTab === 'catalog'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
              }`}
            >
              <span>{tr('Catalog', 'Danh mục')}</span>
              {activeTab === 'catalog' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`pb-2.5 relative transition-colors cursor-pointer ${
                activeTab === 'progress'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
              }`}
            >
              <span>{tr('Progress', 'Tiến độ')}</span>
              {activeTab === 'progress' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>

            <button
              onClick={() => navigate({ to: '/tasks' as any })}
              className={`pb-2.5 relative transition-colors cursor-pointer ${
                activeTab === 'tasks'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800'
              }`}
            >
              <span>{tr('Tasks', 'Công việc')}</span>
            </button>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => setIsProjectDetailOpen(true)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">{tr('Selected project details', 'Chi tiết dự án đang chọn')}</button>
          </div>

          {/* Search & Filters Row */}
          <div className="nexora-table-filters flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[220px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder={tr('Search projects by name or code...', 'Tìm dự án theo tên, mã...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="all">{tr('Status', 'Trạng thái')}</option>
                <option value="Đang triển khai">{groupLabel('Đang triển khai')}</option>
                <option value="Lên kế hoạch">{groupLabel('Lên kế hoạch')}</option>
                <option value="Đang đánh giá">{groupLabel('Đang đánh giá')}</option>
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer shadow-2xs"
              >
                <option value="all">{tr('Department', 'Phòng ban')}</option>
                <option value="PMO">PMO</option>
                <option value="IT">IT</option>
                <option value="Kinh doanh">{tr('Sales', 'Kinh doanh')}</option>
                <option value="Hành chính">{tr('Administration', 'Hành chính')}</option>
                <option value="Ban Điều hành">{tr('Executive Board', 'Ban Điều hành')}</option>
              </select>
            </div>

            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5 shadow-2xs">
              <button className="p-1.5 rounded bg-slate-100 dark:bg-zinc-800 text-blue-600 font-bold">
                <List className="w-3.5 h-3.5" />
              </button>
              <button className="p-1.5 rounded text-slate-400 hover:text-slate-600">
                <Grid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Grouped Project Table Card matching 04-project-task-workbench.png */}
          <CustomTable<any> columns={[]} data={[]} className="bg-white dark:bg-zinc-900">
            <div className="overflow-x-auto">
              <CustomTable.Table className="w-full text-left text-xs border-collapse">
                <CustomTable.Head className="bg-slate-50/70 dark:bg-zinc-900 text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800">
                  <CustomTable.Row>
                    <CustomTable.HeaderCell className="w-8 px-3 py-3 text-center"></CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="px-3 py-3">{tr('PROJECT', 'DỰ ÁN')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="px-3 py-3">{tr('OWNER', 'CHỦ SỞ HỮU')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="px-3 py-3">{tr('HEALTH', 'SỨC KHỎE')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="px-3 py-3">{tr('PROGRESS', 'TIẾN ĐỘ')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="px-3 py-3">{tr('CURRENT MILESTONE', 'MỐC HIỆN TẠI')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="px-3 py-3">{tr('DUE DATE', 'HẠN HOÀN THÀNH')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="px-3 py-3 text-center">{tr('OPEN TASKS', 'CÔNG VIỆC MỞ')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="px-3 py-3">{tr('RISK', 'RỦI RO')}</CustomTable.HeaderCell>
                    <CustomTable.HeaderCell className="w-8 px-3 py-3 text-right"></CustomTable.HeaderCell>
                  </CustomTable.Row>
                </CustomTable.Head>
                <CustomTable.Body>
                  {(Object.keys(groupedProjects) as (keyof typeof groupedProjects)[]).map((grpName) => {
                    const list = groupedProjects[grpName];
                    if (list.length === 0) return null;

                    return (
                      <React.Fragment key={grpName}>
                        {/* Group Header Row */}
                        <CustomTable.Row className="bg-slate-50/50 dark:bg-zinc-900/80 border-y border-slate-200 dark:border-zinc-800">
                          <CustomTable.Cell colSpan={10} className="px-4 py-2 font-bold text-xs text-slate-800 dark:text-zinc-200">
                            {groupLabel(grpName)} ({list.length})
                          </CustomTable.Cell>
                        </CustomTable.Row>

                        {list.map((proj) => {
                          const isSelected = selectedProjectId === proj.id;
                          return (
                            <CustomTable.Row
                              key={proj.id}
                              onClick={() => { setSelectedProjectId(proj.id); setIsProjectDetailOpen(true); }}
                              className={`border-b border-slate-100 dark:border-zinc-800/80 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                              }`}
                            >
                              <CustomTable.Cell className="px-3 py-3 text-center">
                                <Star
                                  className={`w-3.5 h-3.5 cursor-pointer ${
                                    proj.isStarred ? 'text-blue-600 fill-blue-600' : 'text-slate-300 dark:text-zinc-600'
                                  }`}
                                />
                              </CustomTable.Cell>
                              <CustomTable.Cell className="px-3 py-3">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-zinc-100 text-xs">
                                    {proj.name}
                                  </p>
                                  <p className="font-mono text-[10px] text-slate-400">{proj.code}</p>
                                </div>
                              </CustomTable.Cell>
                              <CustomTable.Cell className="px-3 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0">
                                    {proj.owner.initials}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-800 dark:text-zinc-200 text-xs">{proj.owner.name}</p>
                                    <p className="text-[10px] text-slate-400">{proj.owner.department}</p>
                                  </div>
                                </div>
                              </CustomTable.Cell>
                              <CustomTable.Cell className="px-3 py-3">
                                <span
                                  className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                                    proj.health === 'Tốt' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {healthLabel(proj.health)}
                                </span>
                              </CustomTable.Cell>
                              <CustomTable.Cell className="px-3 py-3">
                                <div className="space-y-1 w-24">
                                  <span className="font-bold text-xs text-slate-800 dark:text-zinc-200 font-mono">
                                    {proj.progress}%
                                  </span>
                                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      style={{ width: `${proj.progress}%` }}
                                      className={`h-full ${proj.health === 'Tốt' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    />
                                  </div>
                                </div>
                              </CustomTable.Cell>
                              <CustomTable.Cell className="px-3 py-3 text-slate-700 dark:text-zinc-300">
                                {proj.currentMilestone}
                              </CustomTable.Cell>
                              <CustomTable.Cell className="px-3 py-3 font-mono text-slate-500 text-[11px]">
                                {proj.deadline}
                              </CustomTable.Cell>
                              <CustomTable.Cell className="px-3 py-3 text-center">
                                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                                  {proj.openTasksCount}
                                </span>
                              </CustomTable.Cell>
                              <CustomTable.Cell className="px-3 py-3">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                  proj.risk === 'Trung bình' ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {riskLabel(proj.risk)}
                                </span>
                              </CustomTable.Cell>
                              <CustomTable.Cell className="px-3 py-3 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showToast(tr(`Options for ${proj.name}`, `Tùy chọn ${proj.name}`), 'info');
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded cursor-pointer"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </CustomTable.Cell>
                            </CustomTable.Row>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </CustomTable.Body>
              </CustomTable.Table>
            </div>

            {/* Pagination */}
            <div className="nexora-table-footer px-4 py-3 bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500">
              <span>{tr('Showing', 'Hiển thị')} 1–{filteredProjects.length} {tr('of', 'trong')} {mockProjectsData.length} {tr('projects', 'dự án')}</span>
              <div className="flex items-center gap-3">
                <span>10 / {tr('page', 'trang')}</span>
                <span>1 / 1</span>
                <div className="flex items-center gap-1">
                  <button className="p-1 border border-slate-200 dark:border-zinc-800 rounded hover:bg-slate-50 disabled:opacity-40" disabled>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 border border-slate-200 dark:border-zinc-800 rounded hover:bg-slate-50 disabled:opacity-40" disabled>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </CustomTable>

          {/* Section: Mốc thời gian tổng quan matching 04-project-task-workbench.png */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">{tr('Timeline overview', 'Mốc thời gian tổng quan')}</h3>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setTimelineView('list')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    timelineView === 'list' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  {tr('List', 'Danh sách')}
                </button>
                <button
                  onClick={() => setTimelineView('roadmap')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    timelineView === 'roadmap' ? 'bg-white dark:bg-zinc-700 text-blue-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  {tr('Roadmap', 'Lộ trình')}
                </button>
              </div>
            </div>

            {/* Timeline Stepper Line */}
            <div className="pt-3 pb-2">
              <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-zinc-700 z-0" />

                {/* Milestone 1 */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                  <span className="font-mono text-[11px] text-slate-400 font-medium">20/04/2024</span>
                  <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-slate-400" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800 dark:text-zinc-200">{tr('Project kickoff', 'Khởi động dự án')}</p>
                    <p className="text-[10px] text-slate-400">ERP Nexora</p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                  <span className="font-mono text-[11px] text-slate-400 font-medium">24/05/2024</span>
                  <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-slate-400" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800 dark:text-zinc-200">{tr('System design', 'Thiết kế hệ thống')}</p>
                    <p className="text-[10px] text-slate-400">ERP Nexora</p>
                  </div>
                </div>

                {/* Milestone 3 (Active) */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold">23/05/2024</span>
                  <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-zinc-900 ring-2 ring-blue-400" />
                  <div className="text-[11px]">
                    <p className="font-bold text-blue-600 dark:text-blue-400">{tr('Integration testing', 'Kiểm thử tích hợp')}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">ERP Nexora</p>
                  </div>
                </div>

                {/* Milestone 4 */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                  <span className="font-mono text-[11px] text-slate-400 font-medium">30/06/2024</span>
                  <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-slate-400" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800 dark:text-zinc-200">{tr('User training', 'Đào tạo người dùng')}</p>
                    <p className="text-[10px] text-slate-400">ERP Nexora</p>
                  </div>
                </div>

                {/* Milestone 5 */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-1">
                  <span className="font-mono text-[11px] text-slate-400 font-medium">15/07/2024</span>
                  <div className="w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border-2 border-slate-400" />
                  <div className="text-[11px]">
                    <p className="font-bold text-slate-800 dark:text-zinc-200">Go-live</p>
                    <p className="text-[10px] text-slate-400">ERP Nexora</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>

        {/* ==================================================================== */}
        {/* 2. RIGHT 1/3 COLUMN: Chi Tiết Dự Án (Project Detail Panel) 320px */}
        {/* ==================================================================== */}
        {isProjectDetailOpen && <Modal isOpen={isProjectDetailOpen} onClose={() => setIsProjectDetailOpen(false)} title={tr(`Project details: ${selectedProject.name}`, `Chi tiết dự án: ${selectedProject.name}`)} maxWidth="xl">
        <div className="max-h-[72vh] overflow-y-auto p-1">
        <div className="bg-white dark:bg-zinc-950 flex flex-col space-y-5 p-2 text-xs">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
              {tr('Project details', 'Chi tiết dự án')}
            </h3>
            <span className="text-slate-400">⌃</span>
          </div>

          {/* Title & Status */}
          <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">{selectedProject.name}</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
                {groupLabel(selectedProject.group)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{tr('Project code', 'Mã dự án')}</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-zinc-300">{selectedProject.code}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{tr('Owner', 'Chủ sở hữu')}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
                    {selectedProject.owner.initials}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{selectedProject.owner.name}</span>
                    <span className="text-[10px] text-slate-400 block">{selectedProject.owner.department}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">{tr('Due date', 'Hạn hoàn thành')}</span>
                <span className="text-slate-700 dark:text-zinc-300 font-medium">
                  {selectedProject.deadline} <span className="text-[10px] text-slate-400">{tr('(37 days left)', '(Còn 37 ngày)')}</span>
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">{tr('Overall progress', 'Tiến độ tổng thể')}</span>
                  <span className="font-bold text-slate-800 dark:text-zinc-200 font-mono">{selectedProject.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div style={{ width: `${selectedProject.progress}%` }} className="bg-emerald-500 h-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Thành viên dự án (6) */}
          <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <span className="font-bold text-slate-800 dark:text-zinc-200 block text-xs">{tr('Project members', 'Thành viên dự án')} (6)</span>
            <div className="flex items-center gap-1.5">
              {['VH', 'NT', 'PT', 'LH', 'VH', 'AD'].map((init, idx) => (
                <div
                  key={idx}
                  className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white dark:border-zinc-900 shrink-0"
                >
                  {init}
                </div>
              ))}
              <button
                onClick={() => showToast(tr('Add a project member', 'Thêm thành viên vào dự án'), 'info')}
                className="w-7 h-7 rounded-full border border-dashed border-slate-300 dark:border-zinc-700 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Mốc hiện tại */}
          <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">{tr('Current milestone', 'Mốc hiện tại')}</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {tr('In progress', 'Đang thực hiện')}
              </span>
            </div>
            <div className="p-3 bg-slate-50/70 dark:bg-zinc-900 rounded-lg space-y-1.5">
              <p className="font-bold text-slate-800 dark:text-zinc-200 text-xs">{selectedProject.currentMilestone}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>23/05/2024 – 31/05/2024</span>
                <span className="font-bold text-slate-700 dark:text-zinc-300 font-mono">65%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[65%]" />
              </div>
            </div>
          </div>

          {/* Công việc sắp tới */}
          <div className="space-y-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">{tr('Upcoming tasks', 'Công việc sắp tới')}</span>
              <button
                onClick={() => navigate({ to: '/tasks' as any })}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {tr('View all', 'Xem tất cả')}
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">{tr('Prepare UAT scenarios', 'Chuẩn bị kịch bản UAT')}</span>
                </label>
                <span className="text-slate-400 font-mono">24/05/2024</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">{tr('Execute UAT tests', 'Thực thi kiểm thử UAT')}</span>
                </label>
                <span className="text-slate-400 font-mono">27/05/2024</span>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span className="text-slate-700 dark:text-zinc-300 font-medium">{tr('Summarize and resolve defects', 'Tổng hợp & xử lý lỗi')}</span>
                </label>
                <span className="text-slate-400 font-mono">31/05/2024</span>
              </div>
            </div>
          </div>

          {/* Cập nhật gần nhất */}
          <div className="space-y-2 pb-3">
            <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs block">{tr('Latest update', 'Cập nhật gần nhất')}</span>
            <div className="p-3 bg-slate-50/70 dark:bg-zinc-900 rounded-lg space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
                  NT
                </div>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Nguyễn Tuấn</span>
                <span className="text-[10px] text-slate-400">• 23/05/2024 10:24</span>
              </div>
              <p className="text-slate-600 dark:text-zinc-400 leading-relaxed pl-7">
                {tr('Integration testing is 65% complete. Twelve medium-severity defects were found.', 'Hoàn thành 65% hạng mục kiểm thử tích hợp. Đã phát hiện 12 lỗi mức trung bình.')}
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate({ to: '/tasks' as any })}
                className="py-2 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>{tr('Open tasks', 'Mở công việc')}</span>
              </button>
              <button
                onClick={() => showToast(tr('Update project progress', 'Cập nhật tiến độ dự án'), 'info')}
                className="py-2 px-3 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{tr('Update progress', 'Cập nhật tiến độ')}</span>
              </button>
            </div>

            <button
              onClick={() => handleAskAI(selectedProject)}
              className="w-full py-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{tr('Ask AI about this project', 'Hỏi AI về dự án')}</span>
            </button>
          </div>

        </div>
        </div>
        </Modal>}

      </div>

      {/* Create Project Modal */}
      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ProjectsPage;
