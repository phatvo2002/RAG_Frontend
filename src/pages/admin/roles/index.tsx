import React from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { Shield, Plus, CheckCircle, Users } from 'lucide-react';
import { mockRoles } from '@/data/mockData';

export const RolesPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      <Header
        title={t('roles.title', { defaultValue: 'Roles & Permissions' })}
        subTitle={t('roles.subtitle', { defaultValue: 'Granular access control policies for user groups across the system' })}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {t('roles.listTitle', { defaultValue: 'Role List' })} ({mockRoles.length})
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              {t('roles.subtitle', { defaultValue: 'Granular access control policies for user groups across the system' })}
            </p>
          </div>

          <button
            onClick={() => showToast(t('roles.addRole', { defaultValue: 'Add Role' }), 'info')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('roles.addRole', { defaultValue: 'Add Role' })}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockRoles.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4 hover:border-blue-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  <Users className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                  <span>{t('roles.usersCount', { count: r.userCount, defaultValue: `${r.userCount} users` })}</span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{r.role}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{r.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t('roles.active', { defaultValue: 'Active' })}</span>
                </span>
                <button
                  onClick={() => showToast(`Configure permissions for ${r.role}`, 'info')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  {t('roles.configure', { defaultValue: 'Configure Permissions' })}
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
