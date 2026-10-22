import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  required,
  className = '',
  placeholder,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-ink/70 font-body">
          {label} {required && <span className="text-alert">*</span>}
        </label>
      )}
      <select
        className={`border ${error ? 'border-alert focus:border-alert' : 'border-line focus:border-primary'} bg-surface rounded py-3 px-4 font-body text-ink focus:outline-none focus:ring-1 ${error ? 'focus:ring-alert' : 'focus:ring-primary'} disabled:opacity-50 disabled:bg-bg appearance-none`}
        required={required}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-alert font-body">{error}</span>}
    </div>
  );
};
