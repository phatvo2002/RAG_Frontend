import React from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { Shield, Plus, Check } from 'lucide-react';
import { mockDataPolicies } from '@/data/mockData';

export const PoliciesPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('policies.title', { defaultValue: 'Chính sách Dữ liệu & An ninh' })}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t('policies.subtitle', { defaultValue: 'Kiểm soát quyền truy cập tài liệu RAG, chống thất thoát dữ liệu và an toàn tài sản số' })}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {t('policies.activeTitle', { defaultValue: 'Active Security Policies' })}
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              {t('policies.activeSub', { defaultValue: 'Enforced automatically across all RAG documents and AI Chat sessions' })}
            </p>
          </div>

          <button
            onClick={() => showToast(t('policies.addPolicy', { defaultValue: 'Add Policy' }), 'info')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('policies.addPolicy', { defaultValue: 'Add Policy' })}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockDataPolicies.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3 hover:border-blue-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{t('policies.activeStatus', { defaultValue: 'Active' })}</span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{p.title}</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{p.countText}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-zinc-500">{t('policies.scope', { defaultValue: 'Scope: Organization-wide' })}</span>
                <button
                  onClick={() => showToast(`Policy details: ${p.title}`, 'info')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  {t('policies.details', { defaultValue: 'Details' })}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PoliciesPage;
