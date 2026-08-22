import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const bgColors = {
          success: 'bg-emerald-600 text-white shadow-emerald-500/20',
          error: 'bg-rose-600 text-white shadow-rose-500/20',
          warning: 'bg-amber-600 text-white shadow-amber-500/20',
          info: 'bg-blue-600 text-white shadow-blue-500/20',
        };

        const icons = {
          success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
          info: <Info className="w-4 h-4 shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-xs font-medium transition-all animate-in fade-in slide-in-from-bottom-2 ${
              bgColors[toast.type]
            }`}
          >
            {icons[toast.type]}
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 hover:opacity-75 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

