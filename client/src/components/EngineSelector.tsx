import React from 'react';
import { useStore } from '../store/useStore';
import { SyncEngine } from '../types';
import { Cpu, Zap, ShieldAlert, Check } from 'lucide-react';

export const EngineSelector: React.FC = () => {
  const { currentEngine, setEngine, addToast } = useStore();

  const handleSelect = (engine: SyncEngine) => {
    setEngine(engine);
    addToast({
      type: 'info',
      title: `Engine Switched to ${engine.toUpperCase()}`,
      message: `Now evaluating live convergence & latency for ${engine.toUpperCase()} engine.`
    });
  };

  return (
    <div className="flex items-center gap-1 bg-dark-800 p-1 rounded-xl border border-white/10 shadow-lg">
      <button
        onClick={() => handleSelect('crdt')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          currentEngine === 'crdt'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-gray-400 hover:text-white hover:bg-dark-700'
        }`}
        title="Custom RGA Text & OR-Set Canvas CRDT with Lamport Clocks"
      >
        <Cpu className="w-3.5 h-3.5" />
        <span>Custom CRDT</span>
        {currentEngine === 'crdt' && <Check className="w-3 h-3 ml-0.5" />}
      </button>

      <button
        onClick={() => handleSelect('yjs')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          currentEngine === 'yjs'
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
            : 'text-gray-400 hover:text-white hover:bg-dark-700'
        }`}
        title="Optimized Yjs State Vector Integration"
      >
        <Zap className="w-3.5 h-3.5 text-amber-300" />
        <span>Yjs Engine</span>
        {currentEngine === 'yjs' && <Check className="w-3 h-3 ml-0.5" />}
      </button>

      <button
        onClick={() => handleSelect('lww')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          currentEngine === 'lww'
            ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
            : 'text-gray-400 hover:text-white hover:bg-dark-700'
        }`}
        title="Last Write Wins Timestamp Resolution (Demonstrates Overwrite Conflicts)"
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>LWW Engine</span>
        {currentEngine === 'lww' && <Check className="w-3 h-3 ml-0.5" />}
      </button>
    </div>
  );
};
