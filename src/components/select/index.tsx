import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1 w-full">
      {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
      <div className="relative flex items-center">
        <select
          className={`nexora-control w-full appearance-none pl-3.5 pr-9 py-2.5 bg-slate-50/50 border rounded-xl text-xs text-slate-800 focus:outline-none transition-all cursor-pointer ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:bg-rose-50/20'
              : 'border-slate-200 focus:border-blue-600 focus:bg-white'
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
      </div>
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
export default Select;
