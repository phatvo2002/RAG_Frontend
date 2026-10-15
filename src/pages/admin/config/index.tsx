import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';
import { Sparkles, Database, Save } from 'lucide-react';

export const ConfigPage: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useTranslation(['admin', 'common']);
  const [model, setModel] = useState('gemini-2.0-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(t('common:notifications.savedSuccess', { defaultValue: 'Configuration saved successfully!' }), 'success');
  };

  return (
    <div className="nexora-page flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden transition-colors">
      <Header />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 w-full">
        {/* Page Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            {t('config.title', { defaultValue: 'Cấu hình Hệ thống & AI' })}
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t('config.subtitle', { defaultValue: 'Thiết lập mô hình Large Language Model, Vector Database và phân bổ tài nguyên' })}
          </p>
        </div>
        <form onSubmit={handleSave} className="space-y-5 text-xs w-full">
          {/* AI LLM Settings */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{t('config.aiModelTitle', { defaultValue: 'AI & LLM Model' })}</h4>
                <p className="text-slate-400 dark:text-zinc-500 text-[11px]">{t('config.aiModelSub', { defaultValue: 'Configure generative LLM for answering and RAG processing' })}</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">{t('config.defaultModel', { defaultValue: 'Default AI Model' })}</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-xs font-medium text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                >
                  <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Recommended - Fast & Accurate)</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Reasoning)</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-medium text-slate-700 dark:text-zinc-300">{t('config.creativity', { defaultValue: 'Creativity (Temperature)' })}</label>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
                    <span>{t('config.precise', { defaultValue: 'Precise (0.0)' })}</span>
                    <span>{t('config.creative', { defaultValue: 'Creative (1.0)' })}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-zinc-300 mb-1">{t('config.maxTokens', { defaultValue: 'Max Tokens' })}</label>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-xs font-medium text-slate-800 dark:text-zinc-100 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vector Database & Storage */}
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-lg border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div className="w-8 h-8 rounded bg-emerald-50 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-sm">{t('config.vectorTitle', { defaultValue: 'Vector Database & Storage' })}</h4>
                <p className="text-slate-400 dark:text-zinc-500 text-[11px]">{t('config.vectorSub', { defaultValue: 'Embedding connection status and RAG Index cluster' })}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 rounded flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">{t('config.vectorEngine', { defaultValue: 'Vector Engine' })}</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">pgvector / Qdrant Dedicated Cluster</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 rounded font-bold text-[11px]">
                  Active
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700/60 rounded flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-zinc-200">{t('config.maxFileSize', { defaultValue: 'Maximum file size per upload' })}</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500">PDF, DOCX, XLSX, TXT</p>
                </div>
                <span className="font-bold text-slate-800 dark:text-zinc-200 text-xs">50 MB</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs shadow-2xs shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t('config.save', { defaultValue: 'Save Changes' })}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ConfigPage;
