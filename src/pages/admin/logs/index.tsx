import React, { useState } from 'react';
import { Header } from '@/components/header';
import { Clock, Search, Download } from 'lucide-react';
import { mockActivityLogs } from '@/data/mockData';

export const LogsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const filteredLogs = mockActivityLogs.filter(
    (l) =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <Header
        title="Nhật ký Hoạt động Hệ thống"
        subTitle="Theo dõi và lưu vết toàn bộ hoạt động đăng nhập, chỉnh sửa và truy vấn AI"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-6xl mx-auto w-full">
        {/* Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-3 transition-colors">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo người thực hiện, hành động..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8.5 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800"
            />
          </div>

          <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Xuất nhật ký</span>
          </button>
        </div>

        {/* Logs List */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Lịch sử ghi nhận ({filteredLogs.length})
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Tự động cập nhật thời gian thực</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {log.user.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{log.user}</span> {log.action}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Địa chỉ IP: 192.168.1.10{log.id.slice(-1)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default LogsPage;
