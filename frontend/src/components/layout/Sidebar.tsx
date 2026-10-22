import React from 'react';
import { LayoutDashboard, MessageSquare, Calendar, BookOpen, Settings, X, Brain } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Check-in', path: '/checkin', icon: MessageSquare },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Guidance', path: '/guidance', icon: BookOpen },
    { name: 'WHO Advisor', path: '/rag-guide', icon: Brain },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarClass = isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0';

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-ink/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-surface border-r border-line pt-16 z-40 transition-transform duration-200 ease-in-out ${sidebarClass}`}
      >
        <div className="p-4 border-b border-line flex justify-between items-center">
          <div className="font-body">
            <p className="text-sm text-ink/60">Patient</p>
            <p className="font-medium text-ink">Patient Name</p>
          </div>
          <button className="md:hidden text-ink/60" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <nav className="mt-4 flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded font-body min-h-[44px] transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-ink/60 hover:bg-bg hover:text-ink'
                }`}
                onClick={() => onClose()}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
