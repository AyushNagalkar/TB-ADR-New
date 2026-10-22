import React from 'react';

export interface StatusBadgeProps {
  status: 'normal' | 'elevated' | 'critical';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const defaultLabels = {
    normal: 'Normal',
    elevated: 'Needs attention',
    critical: 'Urgent',
  };

  const styles = {
    normal: 'bg-secondary/10 text-secondary',
    elevated: 'bg-alert/10 text-alert',
    critical: 'bg-critical/10 text-critical',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-body ${styles[status]}`}
    >
      {label || defaultLabels[status]}
    </span>
  );
};
