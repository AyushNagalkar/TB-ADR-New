import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-ink/70 font-body">
          {label} {required && <span className="text-alert">*</span>}
        </label>
      )}
      <input
        className={`border ${error ? 'border-alert focus:border-alert' : 'border-line focus:border-primary'} bg-surface rounded py-3 px-4 font-body text-ink placeholder:text-ink/40 focus:outline-none focus:ring-1 ${error ? 'focus:ring-alert' : 'focus:ring-primary'} disabled:opacity-50 disabled:bg-bg`}
        required={required}
        {...props}
      />
      {error && <span className="text-sm text-alert font-body">{error}</span>}
    </div>
  );
};
