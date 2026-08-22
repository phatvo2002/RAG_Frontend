import React from 'react';
import { Header } from '@/components/header';
import { useApp } from '@/context/AppContext';
import { Shield, Plus, Check } from 'lucide-react';
import { mockDataPolicies } from '@/data/mockData';

export const PoliciesPage: React.FC = () => {
  const { showToast } = useApp();

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      <Header
        title="Chính sách Dữ liệu & Bảo mật"
        subTitle="Kiểm soát quyền truy cập tài liệu, bảo mật thông tin nội bộ và chống rò rỉ dữ liệu"
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Các quy định bảo mật đang kích hoạt</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Áp dụng tự động cho toàn bộ tài liệu RAG và phiên Chat AI</p>
          </div>

          <button
            onClick={() => showToast('Tạo chính sách dữ liệu mới', 'info')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-2xs shadow-blue-500/20 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm chính sách</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockDataPolicies.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Kích hoạt</span>
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{p.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.countText}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500">Phạm vi: Toàn công ty</span>
                <button
                  onClick={() => showToast(`Cấu hình chính sách: ${p.title}`, 'info')}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                >
                  Chi tiết
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
