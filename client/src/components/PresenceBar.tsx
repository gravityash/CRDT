import React from 'react';
import { useStore } from '../store/useStore';
import { Users, Wifi, WifiOff } from 'lucide-react';

export const PresenceBar: React.FC = () => {
  const { presences, isOffline, pendingOpCount, user } = useStore();

  return (
    <div className="flex items-center gap-3 bg-dark-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
      {/* Offline / Online Status Badge */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium">
        {isOffline ? (
          <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            Offline ({pendingOpCount} Ops Queued)
          </span>
        ) : (
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Wifi className="w-3.5 h-3.5" />
            Connected
          </span>
        )}
      </div>

      <div className="h-4 w-px bg-gray-700" />

      {/* Online Users Avatars */}
      <div className="flex items-center -space-x-2 overflow-hidden">
        {/* Self */}
        {user && (
          <div
            className="inline-block h-7 w-7 rounded-full ring-2 ring-blue-500 bg-blue-600 text-xs font-bold flex items-center justify-center text-white"
            title={`${user.name} (You)`}
          >
            <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full" />
          </div>
        )}

        {presences.map((p) => (
          <div
            key={p.userId}
            className="inline-block h-7 w-7 rounded-full ring-2 flex items-center justify-center text-xs font-bold text-white relative transition-transform hover:scale-110"
            style={{ borderColor: p.color }}
            title={`${p.userName} (${p.isTyping ? 'Typing...' : 'Active'})`}
          >
            <img src={p.userAvatar} alt={p.userName} className="h-7 w-7 rounded-full" />
            {p.isTyping && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400 font-mono ml-1">
        <Users className="w-3.5 h-3.5" />
        <span>{presences.length + 1}</span>
      </div>
    </div>
  );
};
