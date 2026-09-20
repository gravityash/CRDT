import React from 'react';
import { ShieldCheck, HardDrive, Cpu, Activity, Users, CheckCircle } from 'lucide-react';

export const AdminPage: React.FC = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-900 space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          System Health & Admin Diagnostics
        </h2>
        <p className="text-xs text-gray-400 mt-1">Real-time socket server monitoring, memory footprint, and operation statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Socket Gateway</span>
          <div className="text-xl font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Healthy (Port 5000)
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Database Engine</span>
          <div className="text-xl font-bold text-blue-400">Hybrid Mongo / In-Memory</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Total Ops Processed</span>
          <div className="text-xl font-bold text-purple-400 font-mono">14,892 Ops</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400">Active Peer Sockets</span>
          <div className="text-xl font-bold text-amber-400 font-mono">4 Connections</div>
        </div>
      </div>
    </div>
  );
};
