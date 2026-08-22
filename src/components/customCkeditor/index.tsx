import React from 'react';

export interface CustomCkeditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomCkeditor: React.FC<CustomCkeditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Nhập nội dung văn bản...',
  className = '',
}) => {
  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white ${className}`}>
      {/* Editor Mock Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
        <button type="button" className="px-2 py-1 hover:bg-slate-200 rounded font-bold">B</button>
        <button type="button" className="px-2 py-1 hover:bg-slate-200 rounded italic">I</button>
        <button type="button" className="px-2 py-1 hover:bg-slate-200 rounded underline">U</button>
        <div className="w-[1px] h-4 bg-slate-300 mx-1" />
        <button type="button" className="px-2 py-1 hover:bg-slate-200 rounded">H1</button>
        <button type="button" className="px-2 py-1 hover:bg-slate-200 rounded">H2</button>
        <div className="w-[1px] h-4 bg-slate-300 mx-1" />
        <button type="button" className="px-2 py-1 hover:bg-slate-200 rounded">• List</button>
        <button type="button" className="px-2 py-1 hover:bg-slate-200 rounded">1. Number</button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full p-3 text-xs text-slate-800 focus:outline-none resize-y"
      />
    </div>
  );
};
export default CustomCkeditor;

