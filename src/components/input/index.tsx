import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1 w-full">
        {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
        <div className="relative flex items-center">
          {leftIcon && <span className="absolute left-3 text-slate-400 pointer-events-none">{leftIcon}</span>}
          <input
            ref={ref}
            className={`w-full py-2.5 bg-slate-50/50 border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
              leftIcon ? 'pl-9' : 'pl-3.5'
            } ${rightIcon ? 'pr-9' : 'pr-3.5'} ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:bg-rose-50/20'
                : 'border-slate-200 focus:border-blue-600 focus:bg-white'
            } ${className}`}
            {...props}
          />
          {rightIcon && <span className="absolute right-3">{rightIcon}</span>}
        </div>
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;

