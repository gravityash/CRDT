import React, { useState } from 'react';
import { RichTextEditor } from '../editor/RichTextEditor';
import { WhiteboardCanvas } from '../whiteboard/WhiteboardCanvas';
import { NetworkSimulator } from '../network/NetworkSimulator';
import { FileText, Layout, Columns } from 'lucide-react';

interface Props {
  activeDocId: string;
  activeBoardId: string;
  netSim: NetworkSimulator;
}

export const WorkspacePage: React.FC<Props> = ({ activeDocId, activeBoardId, netSim }) => {
  const [viewMode, setViewMode] = useState<'editor' | 'whiteboard' | 'split'>('split');

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-dark-900">
      {/* Subheader Switcher */}
      <div className="h-10 bg-dark-900 border-b border-white/10 px-6 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('editor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === 'editor' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Document Editor</span>
          </button>

          <button
            onClick={() => setViewMode('whiteboard')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === 'whiteboard' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Whiteboard Canvas</span>
          </button>

          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === 'split' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2 border-r border-white/10' : 'w-full'} flex flex-col h-full`}>
            <RichTextEditor documentId={activeDocId} initialContent="" netSim={netSim} />
          </div>
        )}

        {(viewMode === 'whiteboard' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col h-full`}>
            <WhiteboardCanvas whiteboardId={activeBoardId} netSim={netSim} />
          </div>
        )}
      </div>
    </div>
  );
};
