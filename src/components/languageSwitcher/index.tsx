import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Check } from 'lucide-react';

export interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
}) => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  ] as const;

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  return (
    <div
      ref={dropdownRef}
      className={`dropdown dropdown-end ${isOpen ? 'dropdown-open' : ''} ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        className="btn btn-sm btn-ghost gap-1.5 text-xs font-semibold px-2"
        title="Change language / Đổi ngôn ngữ"
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        <span className="uppercase text-[11px] font-bold">{currentLang.code}</span>
      </button>

      {isOpen && (
        <div
          tabIndex={0}
          className="dropdown-content menu z-50 p-1.5 shadow-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-box w-40 text-xs text-slate-800 dark:text-zinc-100 mt-1"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 mb-1">
            Language
          </div>
          {languages.map((l) => {
            const isSelected = l.code === language;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLanguage(l.code);
                  setIsOpen(false);
                }}
                className={`btn btn-sm btn-ghost justify-between font-medium ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 font-bold'
                    : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{l.flag}</span>
                  <span>{l.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default LanguageSwitcher;
