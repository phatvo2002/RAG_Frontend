import React from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useUsersQuery } from '@/api/users.api';
import { useNavigate } from '@tanstack/react-router';
import {
  Users,
  Building2,
  HardDrive,
  Sparkles,
  Shield,
  FileCheck2,
  Clock,
  Sliders,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { mockRoles, mockDataPolicies, mockActivityLogs } from '@/data/mockData';

export const OverviewPage: React.FC = () => {
  const { departments } = useApp();
  const navigate = useNavigate();

  // TanStack Query for Users
  const { data: users = [] } = useUsersQuery();

  const activeUsersCount = users.filter((u) => u.status === 'Đang hoạt động').length;

  const quickLinks = [
    {
      title: 'Quản lý Người dùng',
      desc: 'Xem danh sách, thêm mới, sửa, khóa và phân quyền tài khoản',
      count: `${users.length} tài khoản`,
      icon: Users,
      color: 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400',
      path: '/admin/users',
    },
    {
      title: 'Quản lý Phòng ban',
      desc: 'Cơ cấu tổ chức phòng ban và trưởng bộ phận trực thuộc',
      count: `${departments.length} phòng ban`,
      icon: Building2,
      color: 'bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400',
      path: '/admin/departments',
    },
    {
      title: 'Vai trò & Phân quyền',
      desc: 'Thiết lập quyền truy cập cho Quản trị, Trưởng phòng, Nhân viên',
      count: `${mockRoles.length} vai trò`,
      icon: Shield,
      color: 'bg-amber-50 dark:bg-zinc-800 text-amber-600 dark:text-amber-400',
      path: '/admin/roles',
    },
    {
      title: 'Chính sách Dữ liệu',
      desc: 'Kiểm soát quyền truy cập tài liệu RAG và bảo mật thông tin nội bộ',
      count: `${mockDataPolicies.length} chính sách`,
      icon: FileCheck2,
      color: 'bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400',
      path: '/admin/policies',
    },
    {
      title: 'Nhật ký Hoạt động',
      desc: 'Ghi nhận và lưu vết toàn bộ hoạt động của người dùng',
      count: `${mockActivityLogs.length} sự kiện mới`,
      icon: Clock,
      color: 'bg-purple-50 dark:bg-zinc-800 text-purple-600 dark:text-purple-400',
      path: '/admin/logs',
    },
    {
      title: 'Cấu hình Hệ thống & AI',
      desc: 'Thiết lập mô hình AI, LLM, Vector Database và dung lượng',
      count: 'Gemini 2.0 Flash',
      icon: Sliders,
      color: 'bg-rose-50 dark:bg-zinc-800 text-rose-600 dark:text-rose-400',
      path: '/admin/config',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      <Header
        title="Tổng quan Quản trị Hệ thống"
        subTitle="Trung tâm điều hành cấu hình, tài khoản và an ninh dữ liệu"
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate({ to: '/admin/users' as any })}
            className="bg-white dark:bg-zinc-900 p-4.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2 hover:border-blue-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-medium">
              <span>Người dùng (API)</span>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{users.length}</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span>{activeUsersCount} đang hoạt động</span>
            </p>
          </div>

          <div
            onClick={() => navigate({ to: '/admin/departments' as any })}
            className="bg-white dark:bg-zinc-900 p-4.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2 hover:border-blue-300 dark:hover:border-zinc-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-medium">
              <span>Phòng ban</span>
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">{departments.length}</div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Đầy đủ trưởng bộ phận</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-medium">
              <span>Dung lượng lưu trữ</span>
              <HardDrive className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">13.6 GB</div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '68%' }} />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4.5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400 text-xs font-medium">
              <span>Sử dụng AI Token</span>
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-zinc-100">1.2M</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Trong tháng này</p>
          </div>
        </div>

        {/* Quick Navigation Cards to Distinct Modules */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
            Các Phân hệ Quản trị Chức năng
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((item, idx) => {
              const Icon = item.icon;

              return (
                <div
                  key={idx}
                  onClick={() => navigate({ to: item.path as any })}
                  className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs hover:border-blue-400 dark:hover:border-zinc-700 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded flex items-center justify-center ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {item.count}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Truy cập phân hệ</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity & Logs Snippet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Nhật ký hoạt động gần đây</h3>
              <button
                onClick={() => navigate({ to: '/admin/logs' as any })}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
              {mockActivityLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center justify-center font-bold text-[10px]">
                      {log.user.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-slate-800 dark:text-zinc-200 font-medium">
                        <span className="font-semibold text-slate-900 dark:text-zinc-100">{log.user}</span> {log.action}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 shrink-0">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Data Policy status */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-sm">Chính sách dữ liệu</h3>
              <button
                onClick={() => navigate({ to: '/admin/policies' as any })}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Quản lý
              </button>
            </div>
            <div className="space-y-2">
              {mockDataPolicies.slice(0, 3).map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 dark:bg-zinc-800/70 border border-slate-100 dark:border-zinc-700/60 rounded flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-zinc-300 truncate">{p.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OverviewPage;
