import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Trang không tồn tại (404)</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        Đường dẫn bạn yêu cầu không tìm thấy hoặc đã bị di chuyển. Vui lòng quay lại màn hình chính.
      </p>
      <Link
        to="/chat"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về trang chủ</span>
      </Link>
    </div>
  );
};
export default NotFoundPage;
