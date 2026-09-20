import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStore } from './store/useStore';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ResearchModule } from './analytics/ResearchModule';
import { VersionHistoryViewer } from './history/VersionHistoryViewer';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { ResearchPaperPage } from './pages/ResearchPaperPage';
import { NetworkSimulator } from './network/NetworkSimulator';
import { offlineQueue } from './offline/OfflineQueue';

let socket: Socket | null = null;

export const App: React.FC = () => {
  const {
    user,
    setDocuments,
    setWhiteboards,
    activeDocument,
    activeWhiteboard,
    setActiveDocument,
    setActiveWhiteboard,
    currentEngine,
    setPresences,
    networkSim,
    isOffline,
    setIsOffline,
    setPendingOpCount,
    addToast,
    addOpTrace
  } = useStore();

  const [activeTab, setActiveTab] = useState<string>('landing');
  const [activeDocId, setActiveDocId] = useState<string>('doc_crdt_paper');
  const [activeBoardId, setActiveBoardId] = useState<string>('board_system_arch');

  const [netSimInstance] = useState(() => new NetworkSimulator(networkSim));

  // Initialize Data from Backend & Connect Socket.io
  useEffect(() => {
    // Fetch Initial Documents & Whiteboards
    fetch('/api/workspace/documents')
      .then(res => res.json())
      .then(docs => {
        setDocuments(docs);
        if (docs.length > 0) setActiveDocument(docs[0]);
      })
      .catch(() => console.log('Using initial client state defaults'));

    fetch('/api/workspace/whiteboards')
      .then(res => res.json())
      .then(boards => {
        setWhiteboards(boards);
        if (boards.length > 0) setActiveWhiteboard(boards[0]);
      })
      .catch(() => console.log('Using initial client state defaults'));

    // Connect Socket.io Client
    socket = io(window.location.origin, {
      reconnection: true,
      reconnectionAttempts: 10
    });

    netSimInstance.setSocket(socket);
    netSimInstance.setTraceCallback((op) => addOpTrace(op));

    socket.on('connect', () => {
      console.log('[Socket] Connected to backend gateway');
      setIsOffline(false);
      socket?.emit('join_room', {
        roomId: activeDocId,
        user: { id: user?.id, name: user?.name, avatar: user?.avatar }
      });
      socket?.emit('join_room', {
        roomId: activeBoardId,
        user: { id: user?.id, name: user?.name, avatar: user?.avatar }
      });
      netSimInstance.flushOfflineQueue(activeDocId);
    });

    socket.on('user_joined', (data) => {
      if (data.activeUsers) setPresences(data.activeUsers);
    });

    socket.on('user_left', (data) => {
      addToast({ type: 'info', title: 'Peer Left', message: `${data.userName} disconnected.` });
    });

    socket.on('operation_applied', (data) => {
      if (data.mergedState && data.mergedState.content !== undefined) {
        setActiveDocument(data.mergedState);
      } else if (data.mergedState && data.mergedState.elements !== undefined) {
        setActiveWhiteboard(data.mergedState);
      }
      if (data.op) addOpTrace(data.op);
    });

    // Offline / Online Window Listeners
    const handleOnline = () => {
      setIsOffline(false);
      addToast({ type: 'success', title: 'Network Reconnected', message: 'Reconnected to server.' });
      if (socket) netSimInstance.flushOfflineQueue(activeDocId);
    };

    const handleOffline = () => {
      setIsOffline(true);
      addToast({ type: 'warning', title: 'Network Disconnected', message: 'Offline mode active. Buffering ops locally.' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      socket?.disconnect();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update Network Sim Config changes
  useEffect(() => {
    netSimInstance.updateConfig(networkSim);
  }, [networkSim]);

  // Join rooms dynamically when active doc or board changes
  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit('join_room', {
        roomId: activeDocId,
        user: { id: user?.id, name: user?.name, avatar: user?.avatar }
      });
      socket.emit('join_room', {
        roomId: activeBoardId,
        user: { id: user?.id, name: user?.name, avatar: user?.avatar }
      });
    }
  }, [activeDocId, activeBoardId, user]);

  // Open Document or Whiteboard handler
  const handleOpenItem = (type: 'doc' | 'board', id: string) => {
    if (type === 'doc') setActiveDocId(id);
    else setActiveBoardId(id);
    setActiveTab('workspace');
  };

  if (activeTab === 'landing') {
    return <LandingPage onGetStarted={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 flex flex-col overflow-hidden bg-[#0b0f17]">
          {activeTab === 'dashboard' && <DashboardPage onOpenItem={handleOpenItem} />}
          {activeTab === 'workspace' && (
            <WorkspacePage activeDocId={activeDocId} activeBoardId={activeBoardId} netSim={netSimInstance} />
          )}
          {activeTab === 'analytics' && <ResearchModule />}
          {activeTab === 'history' && <VersionHistoryViewer />}
          {activeTab === 'research' && <ResearchPaperPage />}
          {activeTab === 'admin' && <AdminPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
