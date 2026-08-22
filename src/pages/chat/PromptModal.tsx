import React from 'react';
import { Modal } from '@/components/disclosure';
import { Sparkles, FileText, BarChart2, Calendar, CheckSquare } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (promptText: string) => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onSelectPrompt
}) => {
  const promptTemplates = [
    {
      category: 'Dự án & Tiến độ',
      icon: BarChart2,
      items: [
        'Tóm tắt tiến độ dự án NEXORA Platform',
        'Phân tích các rủi ro chính của dự án CRM Integration',
        'So sánh tiến độ thực tế với kế hoạch Sprint 6'
      ]
    },
    {
      category: 'Tài liệu & Báo cáo',
      icon: FileText,
      items: [
        'Tổng hợp các điểm quan trọng trong Biên bản họp 14-05',
        'Trích xuất ngân sách marketing từ kế hoạch Q2',
        'Soạn thảo báo cáo tóm tắt cho ban giám đốc'
      ]
    },
    {
      category: 'Cuộc họp & Công việc',
      icon: Calendar,
      items: [
        'Lên chương trình nghị sự cho buổi Họp khởi động dự án',
        'Tạo danh sách công việc cần làm cho module Phòng họp',
        'Soạn email gửi khách hàng về báo cáo tiến độ tuần'
      ]
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thư viện câu hỏi gợi ý" maxWidth="lg">
      <div className="space-y-4">
        {promptTemplates.map((group, idx) => {
          const Icon = group.icon;
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="p-1 rounded-lg bg-blue-50 text-blue-600">
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span>{group.category}</span>
              </div>
              <div className="space-y-1.5 pl-6">
                {group.items.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => {
                      onSelectPrompt(prompt);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-blue-50/70 hover:border-blue-200 text-xs text-slate-700 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
export default PromptModal;

