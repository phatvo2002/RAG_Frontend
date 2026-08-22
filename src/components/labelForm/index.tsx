import React from 'react';

export interface LabelFormProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const LabelForm: React.FC<LabelFormProps> = ({
  children,
  required,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      <label className={`block text-xs font-semibold text-slate-700 ${className}`} {...props}>
        {children}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {helperText && !error && <p className="text-[11px] text-slate-400">{helperText}</p>}
      {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
export default LabelForm;

