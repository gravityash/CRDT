import React from 'react';
import { useStore } from '../store/useStore';
import { FileText, Layout, Plus, Users, Clock, ArrowRight, Folder, Sparkles } from 'lucide-react';

interface Props {
  onOpenItem: (type: 'doc' | 'board', id: string) => void;
}

export const DashboardPage: React.FC<Props> = ({ onOpenItem }) => {
  const { documents, whiteboards, activeWorkspaceId, user } = useStore();

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-dark-900 space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border border-blue-500/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <span className="text-xs font-mono text-blue-400 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
            Workspace: Distributed Systems Major Project
          </span>
          <h2 className="text-3xl font-extrabold text-white">
            Welcome back, <span className="electric-gradient-text">{user?.name}</span> 👋
          </h2>
          <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
            Manage your collaborative document specifications and infinite whiteboard diagrams. Real-time CRDT sync is active across all sessions.
          </p>
        </div>

        <div className="flex gap-3 z-10">
          <button
            onClick={() => onOpenItem('doc', 'doc_crdt_paper')}
            className="px-5 py-3 rounded-2xl font-semibold text-xs bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Document
          </button>
          <button
            onClick={() => onOpenItem('board', 'board_system_arch')}
            className="px-5 py-3 rounded-2xl font-semibold text-xs bg-dark-700 text-gray-200 border border-white/10 hover:bg-dark-600 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-400" /> New Whiteboard
          </button>
        </div>
      </div>

      {/* Workspace Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Documents */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-gray-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Collaborative Text Documents
            </h3>
          </div>

          <div className="space-y-3">
            {documents.length === 0 ? (
              <div className="glass-panel p-6 rounded-2xl text-center text-xs text-gray-500">No documents found. Click New Document to start.</div>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => onOpenItem('doc', doc.id)}
                  className="glass-panel glass-panel-hover p-4 rounded-2xl border border-white/10 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-100">{doc.title}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">Engine: {doc.engine.toUpperCase()} • v{doc.version}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Whiteboards */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base text-gray-100 flex items-center gap-2">
              <Layout className="w-4 h-4 text-emerald-400" />
              Infinite Canvas Whiteboards
            </h3>
          </div>

          <div className="space-y-3">
            {whiteboards.length === 0 ? (
              <div className="glass-panel p-6 rounded-2xl text-center text-xs text-gray-500">No whiteboards created yet.</div>
            ) : (
              whiteboards.map(board => (
                <div
                  key={board.id}
                  onClick={() => onOpenItem('board', board.id)}
                  className="glass-panel glass-panel-hover p-4 rounded-2xl border border-white/10 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Layout className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-gray-100">{board.title}</h4>
                      <p className="text-[11px] text-gray-400 font-mono">Engine: {board.engine.toUpperCase()} • {board.elements.length} Vectors</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
