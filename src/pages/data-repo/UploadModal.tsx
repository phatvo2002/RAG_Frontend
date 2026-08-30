import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { uploadDocumentYupSchema, UploadDocumentFormData, validationMessages } from '@/types';
import { Upload, FileText, X, AlertCircle, Sparkles, Database, Check } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const { addDocument, currentUser, showToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

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
      setCurrentStep(1);
      setIsProcessing(false);
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
      setCurrentStep(2);
    }
  };

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      setFileError(null);
      setCurrentStep(2);
    }
  };

  if (!isOpen) return null;

  const onSubmit = (data: UploadDocumentFormData) => {
    if (!file) {
      setFileError(validationMessages.document.fileRequired);
      return;
    }

    setIsProcessing(true);
    setCurrentStep(3);

    setTimeout(() => {
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

      setCurrentStep(4);
      setIsProcessing(false);
      showToast(`Đã tải lên & Index Vector tài liệu "${file.name}" thành công!`, 'success');

      setTimeout(() => {
        setFile(null);
        reset();
        onClose();
      }, 600);
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tải tài liệu vào Kho Tri thức RAG" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
        {/* DaisyUI Steps Visual Indicator */}
        <div className="py-1">
          <ul className="steps steps-horizontal w-full text-[11px] font-medium">
            <li className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>Chọn tài liệu</li>
            <li className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>Phân quyền</li>
            <li className={`step ${currentStep >= 3 ? 'step-primary' : ''}`}>Index Vector</li>
            <li className={`step ${currentStep >= 4 ? 'step-primary' : ''}`}>Sẵn sàng RAG</li>
          </ul>
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className={`border-2 border-dashed rounded-box p-6 text-center transition-colors cursor-pointer ${
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
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              Kéo thả tập tin vào đây hoặc <span className="text-blue-600 dark:text-blue-400 underline">chọn từ máy tính</span>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">Hỗ trợ PDF, XLSX, DOCX, PPTX (tối đa 50MB)</p>
          </label>
        </div>

        {fileError && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-box text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {file && (
          <div className="p-3 bg-blue-50/70 dark:bg-zinc-800/80 border border-blue-200 dark:border-zinc-700 rounded-box flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-slate-800 dark:text-zinc-200">{file.name}</span>
              <span className="badge badge-sm badge-ghost text-[10px]">
                {(file.size / 1024).toFixed(0)} KB
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setCurrentStep(1);
              }}
              className="btn btn-ghost btn-xs btn-circle text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Quyền truy cập tài liệu <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('accessScope')}
            className={`select select-bordered select-sm w-full text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 ${
              errors.accessScope ? 'select-error' : ''
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
            className="btn btn-sm btn-ghost text-slate-700 dark:text-zinc-300 font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!file || isProcessing}
            className="btn btn-sm btn-primary text-white font-medium shadow-xs"
          >
            {isProcessing && <span className="loading loading-spinner loading-xs" />}
            <span>{isProcessing ? 'Đang Index Vector...' : 'Tải lên & Tự động Index'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default UploadModal;
