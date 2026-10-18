import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { Modal } from '@/components/disclosure';
import { uploadDocumentYupSchema, UploadDocumentFormData, validationMessages } from '@/types';
import { FolderItem, useDocumentFoldersQuery } from '@/api/document-folders.api';
import { DocumentUploadResponse, useUploadDocumentMutation } from '@/api/documents.api';
import { Upload, FileText, X, AlertCircle, Sparkles, Database } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderId?: string;
  onUploaded?: (receipt: DocumentUploadResponse, file: File, folder: FolderItem, accessScope: string) => void;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.md', '.docx'];

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, defaultFolderId, onUploaded }) => {
  const { language } = useApp();
  const tr = (en: string, vi: string) => language === 'vi' ? vi : en;
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [folderId, setFolderId] = useState(defaultFolderId || '');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { data: folders = [], isLoading: isFoldersLoading } = useDocumentFoldersQuery();
  const uploadMutation = useUploadDocumentMutation();

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
          return err.message || tr('Invalid data', 'Dữ liệu không hợp lệ');
        }
      },
    },
    onSubmit: async ({ value }) => {
      if (!file) {
        setFileError(validationMessages.document.fileRequired());
        return;
      }

      if (!folderId) {
        setFileError(tr('Select a folder for the document.', 'Vui lòng chọn thư mục lưu tài liệu.'));
        return;
      }

      const selectedFolder = folders.find((folder) => folder.id === folderId);
      if (!selectedFolder) {
        setFileError(tr('The selected folder no longer exists. Select another.', 'Thư mục đã chọn không còn tồn tại. Vui lòng chọn lại.'));
        return;
      }

      setIsProcessing(true);
      setCurrentStep(3);

      try {
        const receipt = await uploadMutation.mutateAsync({ folderId, file });
        setIsProcessing(false);
        setFileError(null);
        const uploadedFile = file;
        setFile(null);
        form.reset();
        onClose();
        onUploaded?.(receipt, uploadedFile, selectedFolder, value.accessScope);
      } catch (error: any) {
        setIsProcessing(false);
        setCurrentStep(2);
        setFileError(error?.message || tr('Could not upload the document.', 'Không thể tải tài liệu lên máy chủ.'));
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setFileError(null);
      setFolderId(defaultFolderId || '');
      setCurrentStep(1);
      setIsProcessing(false);
      form.reset();
    }
  }, [isOpen, defaultFolderId]);

  const validateSelectedFile = (selectedFile: File): string | null => {
    const extension = `.${selectedFile.name.split('.').pop()?.toLowerCase() || ''}`;
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return tr('Only PDF, TXT, MD, and DOCX files are supported.', 'Chỉ hỗ trợ file PDF, TXT, MD hoặc DOCX.');
    }
    if (selectedFile.size <= 0 || selectedFile.size > MAX_FILE_SIZE) {
      return tr('File size must be greater than 0 and no more than 25 MB.', 'Dung lượng file phải lớn hơn 0 và không vượt quá 25 MB.');
    }
    return null;
  };

  const selectFile = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null);
      setFileError(null);
      setCurrentStep(1);
      return;
    }

    const validationError = validateSelectedFile(selectedFile);
    if (validationError) {
      setFile(null);
      setFileError(validationError);
      setCurrentStep(1);
      return;
    }

    setFile(selectedFile);
    setFileError(null);
    setCurrentStep(2);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    selectFile(e.dataTransfer.files?.[0] || null);
  };

  const handleFileSelect = (selectedFile: File | null) => {
    selectFile(selectedFile);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tr('Upload document to RAG Knowledge Base', 'Tải tài liệu vào Kho Tri thức RAG')} maxWidth="lg">
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
            <li className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>{tr('Select document', 'Chọn tài liệu')}</li>
            <li className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>{tr('Access rights', 'Phân quyền')}</li>
            <li className={`step ${currentStep >= 3 ? 'step-primary' : ''}`}>Index Vector</li>
            <li className={`step ${currentStep >= 4 ? 'step-primary' : ''}`}>{tr('RAG ready', 'Sẵn sàng RAG')}</li>
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
              {tr('Drop a file here or', 'Kéo thả tập tin vào đây hoặc')} <span className="text-blue-600 dark:text-blue-400 underline">{tr('browse your computer', 'chọn từ máy tính')}</span>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500">{tr('PDF, TXT, MD, DOCX supported (max 25 MB)', 'Hỗ trợ PDF, TXT, MD, DOCX (tối đa 25MB)')}</p>
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

        <div>
          <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            {tr('Destination folder', 'Thư mục lưu tài liệu')} <span className="text-rose-500">*</span>
          </label>
          <select
            value={folderId}
            onChange={(event) => {
              setFolderId(event.target.value);
              setFileError(null);
            }}
            disabled={isFoldersLoading || isProcessing}
            className="select select-bordered select-sm w-full text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
          >
            <option value="">{isFoldersLoading ? tr('Loading folders...', 'Đang tải thư mục...') : tr('Select folder', 'Chọn thư mục')}</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>

        {/* Form Field: accessScope */}
        <form.Field name="accessScope">
          {(field) => (
            <div>
              <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                {tr('Security scope & access rights', 'Phạm vi bảo mật & Phân quyền truy cập')} <span className="text-rose-500">*</span>
              </label>
              <select
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="select select-bordered select-sm w-full text-xs bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100"
              >
                <option value="Toàn bộ công ty">{tr('Entire company (Public)', 'Toàn bộ công ty (Public)')}</option>
                <option value="Phòng Công nghệ Thông tin">{tr('IT Department (Internal)', 'Phòng Công nghệ Thông tin (Internal Dept)')}</option>
                <option value="Dự án NEXORA">{tr('NEXORA Project (Project Specific)', 'Dự án NEXORA (Project Specific)')}</option>
                <option value="Ban Giám đốc">{tr('Executive Board (Confidential)', 'Ban Giám đốc (Confidential)')}</option>
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
                {tr('Uploading document...', 'Đang tải tài liệu lên máy chủ...')}
              </span>
              <span className="font-mono text-[11px]">Qdrant</span>
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
            {tr('Cancel', 'Hủy')}
          </button>
          <button
            type="submit"
            disabled={isProcessing || !file || !folderId || isFoldersLoading}
            className="btn btn-sm btn-primary text-white font-medium shadow-xs gap-1.5"
          >
            {isProcessing ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                <span>{tr('Uploading...', 'Đang tải lên...')}</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5" />
                <span>{tr('Upload & vectorize', 'Bắt đầu tải lên & Vectorize')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadModal;
