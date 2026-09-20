import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { CustomCRDT } from '../crdt/CustomCRDT';
import { YjsAdapter } from '../crdt/YjsAdapter';
import { LWWEngine } from '../crdt/LWWEngine';
import { NetworkSimulator } from '../network/NetworkSimulator';
import { Bold, Italic, Heading1, Heading2, List, Code, Undo, Redo, MessageSquare, History, Sparkles } from 'lucide-react';

interface Props {
  documentId: string;
  initialContent: string;
  netSim: NetworkSimulator;
}

export const RichTextEditor: React.FC<Props> = ({ documentId, initialContent, netSim }) => {
  const { currentEngine, user, activeDocument, setActiveDocument, presences, isOffline, addOpTrace } = useStore();
  const [content, setContent] = useState(initialContent || '');
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (activeDocument && activeDocument.content !== undefined) {
      setContent(activeDocument.content);
    }
  }, [activeDocument]);

  // Handle typing & dispatch via active engine
  const handleContentChange = (newVal: string) => {
    const prevVal = content;
    setContent(newVal);
    if (activeDocument) {
      setActiveDocument({ ...activeDocument, content: newVal });
    }

    const userName = user?.name || 'Anonymous Peer';
    const crdt = new CustomCRDT(user?.id || 'usr_demo_1');
    const yjs = new YjsAdapter(user?.id || 'usr_demo_1');
    const lww = new LWWEngine(user?.id || 'usr_demo_1');

    let op: any;
    if (currentEngine === 'crdt') {
      // Compute character-level diff between prevVal and newVal for RGA operational CRDT
      let start = 0;
      while (start < prevVal.length && start < newVal.length && prevVal[start] === newVal[start]) {
        start++;
      }
      let prevEnd = prevVal.length;
      let newEnd = newVal.length;
      while (prevEnd > start && newEnd > start && prevVal[prevEnd - 1] === newVal[newEnd - 1]) {
        prevEnd--;
        newEnd--;
      }

      if (prevEnd > start && newEnd === start) {
        // Pure deletion
        const delLength = prevEnd - start;
        op = crdt.createTextDeleteOp(documentId, start, delLength, newVal, userName);
      } else {
        // Insertion or replacement
        const insertedText = newVal.slice(start, newEnd);
        op = crdt.createTextInsertOp(documentId, start, insertedText, newVal, userName);
      }
    } else if (currentEngine === 'yjs') {
      op = yjs.createYjsTextOp(documentId, newVal, userName);
    } else {
      op = lww.createLWWTextOp(documentId, newVal, userName);
    }

    addOpTrace(op);
    netSim.dispatchOperation(documentId, op, !isOffline);
  };

  // Helper formatting shortcuts
  const insertFormatting = (prefix: string, suffix: string = '') => {
    handleContentChange(content + `${prefix}Text${suffix}`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        userName: user?.name || 'Alex Rivera',
        avatar: user?.avatar,
        text: newCommentText,
        time: 'Just now'
      }
    ]);
    setNewCommentText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-900 overflow-hidden relative">
      {/* Editor Formatting Toolbar */}
      <div className="h-12 bg-dark-800/80 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={() => insertFormatting('**', '**')} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700" title="Bold">
            <Bold className="w-4 h-4" />
          </button>
          <button onClick={() => insertFormatting('*', '*')} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700" title="Italic">
            <Italic className="w-4 h-4" />
          </button>
          <button onClick={() => insertFormatting('# ')} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700" title="Heading 1">
            <Heading1 className="w-4 h-4" />
          </button>
          <button onClick={() => insertFormatting('## ')} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700" title="Heading 2">
            <Heading2 className="w-4 h-4" />
          </button>
          <button onClick={() => insertFormatting('- ')} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700" title="Bullet List">
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => insertFormatting('```\n', '\n```')} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700" title="Code Block">
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Badge & Comment Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Engine: {currentEngine.toUpperCase()}
          </span>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-dark-700/50 px-3 py-1.5 rounded-lg border border-white/5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({comments.length})</span>
          </button>
        </div>
      </div>

      {/* Main Textarea Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-8 overflow-y-auto font-mono text-sm leading-relaxed">
          {/* Peer Cursor Markers Overlay */}
          {presences.map(p => (
            <div
              key={p.userId}
              className="absolute pointer-events-none px-2 py-0.5 rounded text-[10px] text-white font-bold shadow-lg animate-pulse"
              style={{
                backgroundColor: p.color,
                top: `${(p.cursor?.y || 100)}px`,
                left: `${(p.cursor?.x || 200)}px`
              }}
            >
              {p.userName}
            </div>
          ))}

          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Type your collaborative document content here..."
            className="w-full h-full bg-transparent text-gray-100 outline-none resize-none placeholder-gray-600 font-sans text-base leading-relaxed"
          />
        </div>

        {/* Threaded Comments Drawer */}
        {showComments && (
          <div className="w-80 bg-dark-800/90 backdrop-blur-xl border-l border-white/10 p-4 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-sm text-gray-100 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span>Threaded Comments</span>
              </h4>

              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-gray-500">No comments yet. Start a discussion!</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="bg-dark-700/50 p-3 rounded-xl border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-blue-400">{c.userName}</span>
                        <span className="text-[10px] text-gray-500">{c.time}</span>
                      </div>
                      <p className="text-xs text-gray-200">{c.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-dark-900 px-3 py-2 rounded-xl text-xs text-gray-200 border border-white/10 outline-none focus:border-blue-500"
              />
              <button type="submit" className="bg-blue-600 px-3 py-2 rounded-xl text-xs font-semibold text-white hover:bg-blue-500">
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
