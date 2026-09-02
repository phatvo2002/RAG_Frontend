import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Modal } from '@/components/disclosure';
import { useApp } from '@/context/AppContext';
import { uploadDocumentYupSchema, UploadDocumentFormData, validationMessages } from '@/types';
import { Upload, FileText, X, AlertCircle, Sparkles, Database } from 'lucide-react';

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

  const form = useForm({
    defaultValues: {
      accessScope: 'Dự án NEXORA',
    } as UploadDocumentFormData,
    validators: {
      onSubmit: ({ value }) => {
        try {
          uploadDocumentYupSchema.validateSync(value, { abortEarly: false });
          return undefined;
        } catch (err: any) {
          return err.message || 'Dữ liệu không hợp lệ';
        }
      },
    },
    onSubmit: async ({ value }) => {
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
          accessScope: value.accessScope,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        });

        setCurrentStep(4);
        setIsProcessing(false);
        showToast(`Đã tải lên & Index Vector tài liệu "${file.name}" thành công!`, 'success');

        setTimeout(() => {
          setFile(null);
          form.reset();
          onClose();
        }, 600);
      }, 800);
    },
  });

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setFileError(null);
      setCurrentStep(1);
      setIsProcessing(false);
      form.reset();
    }
  }, [isOpen]);

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tải tài liệu vào Kho Tri thức RAG" maxWidth="lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4 text-xs"
      >
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
              className="btn btn-ghost btn-xs btn-square text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Field: accessScope */}
        <form.Field name="accessScope">
          {(field) => (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Phạm vi bảo mật & Phân quyền truy cập <span className="text-rose-500">*</span>
              </label>
              <select
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="select select-bordered select-sm w-full text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
              >
                <option value="Toàn bộ công ty">Toàn bộ công ty (Public)</option>
                <option value="Phòng Công nghệ Thông tin">Phòng Công nghệ Thông tin (Internal Dept)</option>
                <option value="Dự án NEXORA">Dự án NEXORA (Project Specific)</option>
                <option value="Ban Giám đốc">Ban Giám đốc (Confidential)</option>
              </select>
            </div>
          )}
        </form.Field>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-3.5 bg-blue-50/60 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 rounded-box space-y-2">
            <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Đang phân đoạn chunking & sinh Embedding Vector...
              </span>
              <span className="font-mono text-[11px]">Milvus DB</span>
            </div>
            <progress className="progress progress-primary w-full h-1.5" />
          </div>
        )}

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="btn btn-sm btn-ghost text-slate-700 dark:text-zinc-300 font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isProcessing || !file}
            className="btn btn-sm btn-primary text-white font-medium shadow-xs gap-1.5"
          >
            {isProcessing ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>Đang xử lý RAG...</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5" />
                <span>Bắt đầu tải lên & Vectorize</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadModal;
