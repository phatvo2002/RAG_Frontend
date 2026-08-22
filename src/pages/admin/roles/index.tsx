import React from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Shield, Plus, CheckCircle, Users } from 'lucide-react';
import { mockRoles } from '@/data/mockData';

export const RolesPage: React.FC = () => {
  const { showToast } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <Header
        title="Vai trò & Quyền hạn"
        subTitle="Phân quyền chi tiết cho các nhóm người dùng trong hệ thống"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Danh sách Vai trò ({mockRoles.length})</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Quyền truy cập và thao tác tương ứng</p>
          </div>

          <button
            onClick={() => showToast('Tạo vai trò mới', 'info')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm vai trò</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockRoles.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{r.userCount} người dùng</span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{r.role}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{r.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Đang áp dụng</span>
                </span>
                <button
                  onClick={() => showToast(`Cấu hình quyền cho ${r.role}`, 'info')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  Cấu hình quyền
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default RolesPage;
