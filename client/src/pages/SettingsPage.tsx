import React from 'react';
import { Settings, Moon, Globe, Bell, Key, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-900 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          System Settings & Preferences
        </h2>
        <p className="text-xs text-gray-400 mt-1">Configure workspace parameters, keybindings, and real-time alerts.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4 text-xs">
        <h3 className="font-bold text-sm text-gray-200">Workspace Preferences</h3>
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <div className="font-semibold text-gray-100">Default Sync Engine</div>
            <div className="text-gray-400">Default algorithm initialized when joining new rooms.</div>
          </div>
          <span className="font-mono text-blue-400 font-semibold">Custom CRDT (RGA/OR-Set)</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div>
            <div className="font-semibold text-gray-100">IndexedDB Local Persistence</div>
            <div className="text-gray-400">Buffer offline operations locally.</div>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-500 rounded cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
