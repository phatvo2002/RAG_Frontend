import React, { useState } from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Sparkles, Database, Save } from 'lucide-react';

export const ConfigPage: React.FC = () => {
  const { showToast } = useApp();
  const [model, setModel] = useState('gemini-2.0-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Đã lưu cấu hình hệ thống thành công!', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <Header
        title="Cấu hình Hệ thống & AI"
        subTitle="Thiết lập mô hình ngôn ngữ lớn, cơ sở dữ liệu Vector và giới hạn tài nguyên"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto w-full">
        <form onSubmit={handleSave} className="space-y-5 text-xs">
          {/* AI LLM Settings */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Mô hình AI & LLM</h4>
                <p className="text-slate-400 dark:text-slate-500 text-[11px]">Cấu hình LLM trả lời và xử lý dữ liệu RAG</p>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Mô hình AI mặc định</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                >
                  <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Khuyên dùng - Nhanh & Chính xác)</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Phân tích chuyên sâu)</option>
                  <option value="gpt-4o">OpenAI GPT-4o</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-medium text-slate-700 dark:text-slate-300">Độ sáng tạo (Temperature)</label>
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
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span>Chính xác (0.0)</span>
                    <span>Sáng tạo (1.0)</span>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Max Tokens</label>
                  <input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vector Database & Storage */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Cơ sở dữ liệu Vector & Lưu trữ</h4>
                <p className="text-slate-400 dark:text-slate-500 text-[11px]">Trạng thái kết nối Embedding và RAG Index</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Vector Engine</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">pgvector / Qdrant Dedicated Cluster</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 rounded-md font-bold text-[11px]">
                  Hoạt động (Active)
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Dung lượng tối đa mỗi file tải lên</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">PDF, DOCX, XLSX, TXT</p>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">50 MB</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-2xs shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ConfigPage;
