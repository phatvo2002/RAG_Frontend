import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export interface DisclosureProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const Disclosure: React.FC<DisclosureProps> = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`dropdown ${align === 'right' ? 'dropdown-end' : 'dropdown-start'} ${
        isOpen ? 'dropdown-open' : ''
      } ${className}`}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
        role="button"
        className="cursor-pointer"
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          tabIndex={0}
          className="dropdown-content menu z-50 p-2 shadow-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-box min-w-44 text-slate-800 dark:text-zinc-100"
        >
          {children}
        </div>
      )}
    </div>
  );
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'w-11/12 max-w-7xl',
    full: 'w-[96vw] max-w-[96vw] h-[92vh] max-h-[92vh] flex flex-col',
  };

  return (
    <dialog className="modal modal-open z-50 bg-black/70 backdrop-blur-xs">
      <div
        className={`modal-box ${maxWidthClasses[maxWidth]} w-full p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-box text-slate-800 dark:text-zinc-100 ${className}`}
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost btn-circle text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose} className="cursor-default">
          close
        </button>
      </form>
    </dialog>
  );
};

export * from './ConfirmModal';
export default Disclosure;
