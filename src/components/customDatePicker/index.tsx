import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export interface CustomDatePickerProps {
  value?: string;
  onChange?: (val: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value = '',
  onChange,
  label,
  placeholder = 'YYYY-MM-DD',
  className = '',
  error,
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <div className="relative flex items-center">
        <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 py-2 bg-slate-50/50 border rounded-xl text-xs text-slate-800 focus:outline-none transition-all ${
            error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-blue-600 focus:bg-white'
          }`}
        />
      </div>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
export default CustomDatePicker;

