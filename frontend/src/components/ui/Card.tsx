import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div
      className={`bg-surface border border-line rounded ${noPadding ? '' : 'p-6'} ${className}`}
    >
      {children}
    </div>
  );
};
