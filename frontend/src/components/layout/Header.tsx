import React from 'react';
import { PhoneCall, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-line z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 md:hidden text-ink/70 hover:text-ink focus:outline-none"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
        )}
        <h1 className="font-heading text-xl font-semibold text-ink">TB ADR Companion</h1>
      </div>
      <Link
        to="/emergency"
        className="flex items-center gap-2 bg-critical text-white px-4 py-2 rounded font-body font-medium hover:bg-critical/90 transition-colors min-h-[44px]"
      >
        <PhoneCall size={18} />
        <span>Emergency</span>
      </Link>
    </header>
  );
};
