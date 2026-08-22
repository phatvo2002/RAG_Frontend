import React, { useState } from 'react';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { Upload, FileText, X } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { addDocument, currentUser } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [accessScope, setAccessScope] = useState('Dự án NEXORA');

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const docType = (['pdf', 'xlsx', 'docx', 'pptx'].includes(ext) ? ext : 'pdf') as any;

    const now = new Date();
    const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    addDocument({
      name: file.name,
      type: docType,
      updatedBy: currentUser.name,
      updatedAt: dateStr,
      accessScope,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    });

    setFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tải tài liệu mới lên">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors cursor-pointer"
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
          />
          <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Kéo thả tập tin vào đây hoặc <span className="text-blue-600 underline">chọn từ máy tính</span>
            </p>
            <p className="text-[11px] text-slate-400">Hỗ trợ PDF, XLSX, DOCX, PPTX (tối đa 50MB)</p>
          </label>
        </div>

        {file && (
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-800">{file.name}</span>
            </div>
            <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Quyền truy cập
          </label>
          <select
            value={accessScope}
            onChange={(e) => setAccessScope(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
          >
            <option value="Dự án NEXORA">Dự án NEXORA</option>
            <option value="Phòng Sản phẩm">Phòng Sản phẩm</option>
            <option value="Phòng Marketing">Phòng Marketing</option>
            <option value="Toàn bộ công ty">Toàn bộ công ty</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!file}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-xs disabled:opacity-50 cursor-pointer"
          >
            Tải lên ngay
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default UploadModal;

