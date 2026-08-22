import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CollapseProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Collapse: React.FC<CollapseProps> = ({
  title,
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-slate-200 rounded-xl overflow-hidden bg-white ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-xs text-slate-800 hover:bg-slate-50 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100">{children}</div>}
    </div>
  );
};
export default Collapse;

