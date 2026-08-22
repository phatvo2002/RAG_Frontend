import React, { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { formatBytes } from '@/utils';

export interface DropZoneProps {
  onFilesSelected?: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  accept = '.pdf,.docx,.xlsx,.pptx,.txt',
  maxFiles = 5,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      setSelectedFiles(filesArr);
      onFilesSelected?.(filesArr);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files).slice(0, maxFiles);
      setSelectedFiles(filesArr);
      onFilesSelected?.(filesArr);
    }
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, idx) => idx !== index);
    setSelectedFiles(updated);
    onFilesSelected?.(updated);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-700">
          Kéo thả tệp tin vào đây, hoặc <span className="text-blue-600">chọn tệp</span>
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Hỗ trợ: PDF, DOCX, XLSX, PPTX, TXT (tối đa 25MB)
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-1.5">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">({formatBytes(file.size)})</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default DropZone;

