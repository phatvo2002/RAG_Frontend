import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useTranslation } from 'react-i18next';
import { Clock, Search, Download } from 'lucide-react';
import { mockActivityLogs } from '@/data/mockData';

export const LogsPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [search, setSearch] = useState('');

  const filteredLogs = mockActivityLogs.filter(
    (l) =>
      l.user.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      <Header
        title={t('logs.title', { defaultValue: 'System Activity Logs' })}
        subTitle={t('logs.subtitle', { defaultValue: 'Real-time auditing of user logins, data modifications, and AI queries' })}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 w-full">
        {/* Search Bar */}
        <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between gap-3 transition-colors">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={t('logs.searchPlaceholder', { defaultValue: 'Search by operator, action...' })}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8.5 pr-4 py-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-zinc-800"
            />
          </div>

          <button className="px-3 py-1.5 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>{t('logs.export', { defaultValue: 'Export Logs' })}</span>
          </button>
        </div>

        {/* Logs List */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden transition-colors">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-zinc-200 text-xs uppercase tracking-wider">
              {t('logs.listTitle', { defaultValue: 'Audit Records' })} ({filteredLogs.length})
            </h3>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500">{t('logs.realtime', { defaultValue: 'Real-time automated tracking' })}</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-xs">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {log.user.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium">
                      <span className="font-semibold text-slate-900 dark:text-zinc-100">{log.user}</span> {log.action}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">IP: 192.168.1.10{log.id.slice(-1)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-400 dark:text-zinc-500 text-[11px]">
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
