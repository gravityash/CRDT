import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { EngineSelector } from './EngineSelector';
import { PresenceBar } from './PresenceBar';
import { NetworkSimPanel } from './NetworkSimPanel';
import { Sliders, Sparkles, FolderKanban, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const { user, setUser, networkSim } = useStore();
  const [showSimPanel, setShowSimPanel] = useState(false);

  return (
    <>
      <header className="h-16 bg-dark-900/90 backdrop-blur-md border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              Collab<span className="electric-gradient-text">Sync</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">v1.0 CRDT</span>
            </h1>
          </div>
        </div>

        {/* Sync Engine Selector */}
        <EngineSelector />

        {/* Presence Bar & Network Sim Controls */}
        <div className="flex items-center gap-4">
          <PresenceBar />

          {/* Dev Sim Button */}
          <button
            onClick={() => setShowSimPanel(!showSimPanel)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              networkSim.enabled || showSimPanel
                ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30'
                : 'bg-dark-800 text-gray-300 border-white/10 hover:border-blue-500/40 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Dev Network Panel</span>
            {networkSim.enabled && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            )}
          </button>

          {/* Profile Menu / Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full border border-blue-400/30" />
            <div className="hidden md:block text-left text-xs">
              <div className="font-semibold text-gray-200">{user?.name}</div>
              <div className="text-[10px] text-gray-400 font-mono">{user?.role}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Network Simulation Panel Drawer */}
      <NetworkSimPanel isOpen={showSimPanel} onClose={() => setShowSimPanel(false)} />
    </>
  );
};
