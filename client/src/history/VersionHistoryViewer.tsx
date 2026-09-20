import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Clock, Play, Pause, RotateCcw, GitCommit, ShieldCheck } from 'lucide-react';

export const VersionHistoryViewer: React.FC = () => {
  const { operationTrace, activeDocument } = useStore();
  const [sliderIndex, setSliderIndex] = useState(operationTrace.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);

  const mockDiffVersions = [
    {
      version: 1,
      author: 'Alex Rivera',
      timestamp: '10 mins ago',
      content: '# CollabSync Project\nInitial document draft created.'
    },
    {
      version: 2,
      author: 'Sarah Chen',
      timestamp: '5 mins ago',
      content: '# CollabSync Project\nInitial document draft created.\nAdded RGA CRDT text synchronization.'
    },
    {
      version: 3,
      author: 'Alex Rivera',
      timestamp: 'Just now',
      content: '# CollabSync Project\nInitial document draft created.\nAdded RGA CRDT text synchronization.\nSimulating 500ms network latency.'
    }
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-900 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            Version History & Time-Travel Replay
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Step through historical operations log with Lamport vector clocks and side-by-side snapshot diffing.
          </p>
        </div>
      </div>

      {/* Time-Travel Control Slider Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span className="font-semibold">Operation Timeline Replay</span>
          <span className="font-mono text-blue-400">Step {sliderIndex + 1} of {Math.max(1, operationTrace.length)}</span>
        </div>

        <input
          type="range"
          min="0"
          max={Math.max(0, operationTrace.length - 1)}
          value={sliderIndex}
          onChange={(e) => setSliderIndex(parseInt(e.target.value))}
          className="w-full accent-blue-500 bg-dark-900 h-2 rounded-lg cursor-pointer"
        />

        <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
          <span>v1 (Initial)</span>
          <span>Current Head (v{operationTrace.length + 1})</span>
        </div>
      </div>

      {/* Side-by-Side Diff Viewer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-gray-300">Previous Snapshot (v2)</span>
            <span className="text-[10px] text-gray-500">Sarah Chen • 5 mins ago</span>
          </div>
          <div className="font-mono text-xs text-gray-300 bg-dark-900 p-4 rounded-xl h-48 overflow-y-auto leading-relaxed border border-white/5">
            {mockDiffVersions[1].content}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
              <GitCommit className="w-3.5 h-3.5" />
              Reconstructed State (v3)
            </span>
            <span className="text-[10px] text-gray-500">Alex Rivera • Just now</span>
          </div>
          <div className="font-mono text-xs text-gray-100 bg-dark-900 p-4 rounded-xl h-48 overflow-y-auto leading-relaxed border border-white/5">
            {mockDiffVersions[2].content}
          </div>
        </div>
      </div>
    </div>
  );
};
