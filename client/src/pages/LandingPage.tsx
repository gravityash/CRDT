import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Zap, WifiOff, BarChart2, Layers } from 'lucide-react';

interface Props {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-gray-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Landing Navbar */}
      <nav className="h-20 px-8 flex items-center justify-between border-b border-white/10 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight">Collab<span className="electric-gradient-text">Sync</span></span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onGetStarted} className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all">
            Sign In
          </button>
          <button onClick={onGetStarted} className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500 transition-all flex items-center gap-1.5">
            Launch Workspace <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 py-20 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Distributed Systems Major Project Architecture
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Real-Time Collaboration <br />
          <span className="electric-gradient-text">Without Conflicts.</span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Build, draw, brainstorm and edit together using advanced CRDT synchronization. Compare Custom RGA/OR-Set, Yjs, and Last Write Wins algorithms live.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <button onClick={onGetStarted} className="px-8 py-4 rounded-2xl text-sm font-bold bg-blue-600 text-white shadow-xl shadow-blue-500/30 hover:bg-blue-500 transition-all flex items-center gap-2">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 text-left max-w-6xl mx-auto">
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/10 space-y-3">
            <Cpu className="w-8 h-8 text-blue-400" />
            <h3 className="text-lg font-bold text-white">3 Sync Engines</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dynamically switch between Custom Operational CRDT, Yjs Framework, and Last Write Wins during live editing.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/10 space-y-3">
            <WifiOff className="w-8 h-8 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Offline Buffering</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              IndexedDB operation queue preserves keystrokes and drawing strokes offline with automatic conflict-free replay.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl border border-white/10 space-y-3">
            <BarChart2 className="w-8 h-8 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Dev Simulation Panel</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Adjust artificial latency (0-2000ms), packet loss (0-50%), and network disconnects to stress-test state convergence.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-8 text-center text-xs text-gray-500">
        © 2026 CollabSync. Built for Major Project Research & Enterprise Real-Time Collaboration.
      </footer>
    </div>
  );
};
