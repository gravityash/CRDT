import React from 'react';
import { LayoutDashboard, FileText, Layout, BarChart2, BookOpen, Clock, ShieldCheck, Settings, Home } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'Workspace & Canvas', icon: Layout },
    { id: 'analytics', label: 'Research Analytics', icon: BarChart2 },
    { id: 'history', label: 'Version History', icon: Clock },
    { id: 'research', label: 'Theoretical Paper', icon: BookOpen },
    { id: 'admin', label: 'Admin Health', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-dark-900/60 backdrop-blur-xl border-r border-white/10 p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 font-mono">
          Workspace Navigation
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'text-gray-400 hover:text-white hover:bg-dark-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="glass-panel p-3.5 rounded-xl border border-white/5 space-y-2">
        <div className="text-xs font-bold text-gray-200">Distributed Systems Lab</div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Major Project evaluation suite for CRDT, Yjs & LWW synchronization.
        </p>
      </div>
    </aside>
  );
};
