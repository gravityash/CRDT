import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Sliders, Activity, WifiOff, RefreshCw, AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkSimPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const { networkSim, setNetworkSim, operationTrace, setIsOffline, isOffline, addToast } = useStore();
  const [activeTab, setActiveTab] = useState<'controls' | 'trace'>('controls');

  if (!isOpen) return null;

  const toggleDisconnect = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    setNetworkSim({ disconnected: nextState });
    addToast({
      type: nextState ? 'warning' : 'success',
      title: nextState ? 'Client Disconnected' : 'Client Reconnected',
      message: nextState
        ? 'Operations will buffer locally in IndexedDB queue.'
        : 'Reconnected! Replaying buffered operations to server.'
    });
  };

  return (
    <div className="fixed top-16 right-6 w-96 glass-panel rounded-2xl p-5 z-40 border border-blue-500/30 shadow-2xl animate-fade-in text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <h3 className="font-bold text-sm text-gray-100">Network Simulation Panel</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-900/60 p-1 rounded-xl mb-4 border border-white/5">
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex-1 py-1.5 font-semibold rounded-lg transition-all ${
            activeTab === 'controls' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Simulation Controls
        </button>
        <button
          onClick={() => setActiveTab('trace')}
          className={`flex-1 py-1.5 font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === 'trace' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Op Trace ({operationTrace.length})
        </button>
      </div>

      {activeTab === 'controls' ? (
        <div className="space-y-4">
          {/* Master Enable */}
          <div className="flex items-center justify-between bg-dark-700/50 p-2.5 rounded-xl border border-white/5">
            <span className="font-medium text-gray-200">Enable Network Degradation</span>
            <input
              type="checkbox"
              checked={networkSim.enabled}
              onChange={(e) => setNetworkSim({ enabled: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Latency Slider */}
          <div>
            <div className="flex justify-between text-gray-300 mb-1">
              <span>Artificial Latency</span>
              <span className="font-mono text-blue-400 font-bold">{networkSim.latencyMs} ms</span>
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={networkSim.latencyMs}
              disabled={!networkSim.enabled}
              onChange={(e) => setNetworkSim({ latencyMs: parseInt(e.target.value) })}
              className="w-full accent-blue-500 bg-dark-900 h-2 rounded-lg cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
              <span>0ms (LAN)</span>
              <span>500ms (Global)</span>
              <span>2000ms (High Delay)</span>
            </div>
          </div>

          {/* Packet Loss Slider */}
          <div>
            <div className="flex justify-between text-gray-300 mb-1">
              <span>Simulated Packet Loss</span>
              <span className="font-mono text-rose-400 font-bold">{networkSim.packetLossPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={networkSim.packetLossPct}
              disabled={!networkSim.enabled}
              onChange={(e) => setNetworkSim({ packetLossPct: parseInt(e.target.value) })}
              className="w-full accent-rose-500 bg-dark-900 h-2 rounded-lg cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Disconnect Toggle */}
          <button
            onClick={toggleDisconnect}
            className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
              isOffline
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-rose-600/20 text-rose-300 border-rose-500/40 hover:bg-rose-600/30'
            }`}
          >
            {isOffline ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Reconnect Client (Replay Queue)
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                Simulate Client Disconnect
              </>
            )}
          </button>
        </div>
      ) : (
        /* Operation Trace Log Stream */
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {operationTrace.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No operations captured yet. Make changes on document or canvas!</div>
          ) : (
            operationTrace.map((op) => (
              <div key={op.id} className="bg-dark-900/80 p-2.5 rounded-xl border border-white/5 font-mono text-[11px] space-y-1">
                <div className="flex justify-between items-center text-blue-400">
                  <span className="font-bold">{op.type}</span>
                  <span className="text-[10px] text-gray-500">Lamport #{op.lamport}</span>
                </div>
                <div className="text-gray-300 truncate">Op: {JSON.stringify(op.opData)}</div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Engine: {op.engine.toUpperCase()}</span>
                  <span>User: {op.userName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
