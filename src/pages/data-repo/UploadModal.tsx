import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { uploadDocumentYupSchema, UploadDocumentFormData, validationMessages } from '@/types';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { addDocument, currentUser, showToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadDocumentFormData>({
    resolver: yupResolver(uploadDocumentYupSchema) as any,
    defaultValues: {
      accessScope: 'Dự án NEXORA',
    },
  });

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setFileError(null);
      reset({
        accessScope: 'Dự án NEXORA',
      });
    }
  }, [isOpen, reset]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setFileError(null);
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      setFileError(null);
    }
  };

  if (!isOpen) return null;

  const onSubmit = (data: UploadDocumentFormData) => {
    if (!file) {
      setFileError(validationMessages.document.fileRequired);
      return;
    }

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
      accessScope: data.accessScope,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    });

    showToast(`Đã tải lên tài liệu "${file.name}" thành công!`, 'success');
    setFile(null);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tải tài liệu mới lên">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            fileError
              ? 'border-rose-400 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-slate-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-zinc-800/40'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          />
          <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
            <div className="w-12 h-12 rounded bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              Kéo thả tập tin vào đây hoặc <span className="text-blue-600 dark:text-blue-400 underline">chọn từ máy tính</span>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Hỗ trợ PDF, XLSX, DOCX, PPTX (tối đa 50MB)</p>
          </label>
        </div>

        {fileError && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {file && (
          <div className="p-3 bg-blue-50/70 dark:bg-zinc-800/80 border border-blue-200 dark:border-zinc-700 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{file.name}</span>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Quyền truy cập <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('accessScope')}
            className={`w-full px-3 py-2 border rounded-lg text-xs focus:outline-none bg-slate-50/50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 cursor-pointer ${
              errors.accessScope
                ? 'border-rose-400 focus:border-rose-600'
                : 'border-slate-200 dark:border-zinc-700 focus:border-blue-600'
            }`}
          >
            <option value="Dự án NEXORA">Dự án NEXORA</option>
            <option value="Phòng Sản phẩm">Phòng Sản phẩm</option>
            <option value="Phòng Marketing">Phòng Marketing</option>
            <option value="Toàn bộ công ty">Toàn bộ công ty</option>
          </select>
          {errors.accessScope && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.accessScope.message}</span>
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!file}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-2xs shadow-blue-500/20 disabled:opacity-50 cursor-pointer transition-colors"
          >
            Tải lên ngay
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default UploadModal;
