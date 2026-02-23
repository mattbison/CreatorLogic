
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Search, History, BarChart3, LogOut, ChevronUp, Building2, Target } from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: 'search' | 'history' | 'analytics' | 'agency' | 'track';
  onTabChange: (tab: 'search' | 'history' | 'analytics' | 'agency' | 'track') => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  user, 
  activeTab, 
  onTabChange, 
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-20 print:hidden">
      {/* Brand */}
      <div className="p-6">
        <div className="flex items-center gap-2 text-indigo-600">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">CollabFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <NavButton 
          active={activeTab === 'search'} 
          onClick={() => onTabChange('search')}
          icon={<Search size={20} />}
          label="Search"
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => onTabChange('history')}
          icon={<History size={20} />}
          label="History"
        />
        <NavButton 
          active={activeTab === 'analytics'} 
          onClick={() => onTabChange('analytics')}
          icon={<BarChart3 size={20} />}
          label="Advanced Insights"
        />
        <NavButton 
          active={activeTab === 'track'} 
          onClick={() => onTabChange('track')}
          icon={<Target size={20} />}
          label="Track"
        />
        
        {/* Admin Only Tab */}
        {user.role === 'admin' && (
           <>
            <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
               Agency Admin
            </div>
            <NavButton 
               active={activeTab === 'agency'} 
               onClick={() => onTabChange('agency')}
               icon={<Building2 size={20} />}
               label="Team View"
               badge="Admin"
            />
           </>
        )}
      </div>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-slate-100">
        <div 
            ref={menuRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors mb-2 cursor-pointer relative ${isMenuOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
        >
          <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full bg-slate-200" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{user.name}</div>
            <div className="text-xs text-slate-500 truncate">{user.email}</div>
          </div>
          
          <ChevronUp 
            size={14} 
            className={`text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
          />
          
          {/* Mini Menu */}
          {isMenuOpen && (
             <div className="absolute bottom-full left-0 w-full bg-white border border-slate-200 shadow-xl rounded-lg mb-2 p-1 animate-fade-in-up z-50">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, badge }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-indigo-50 text-indigo-700' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      {label}
    </div>
    {badge && (
      <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-600 rounded-md">
        {badge}
      </span>
    )}
  </button>
);
