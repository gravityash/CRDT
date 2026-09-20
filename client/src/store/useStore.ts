import { create } from 'zustand';
import { User, DocumentItem, WhiteboardItem, SyncEngine, PresenceUser, NetworkSimConfig, ToastMessage, OperationLog } from '../types';

interface AppState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;

  // Active Workspace & Items
  activeWorkspaceId: string;
  documents: DocumentItem[];
  whiteboards: WhiteboardItem[];
  activeDocument: DocumentItem | null;
  activeWhiteboard: WhiteboardItem | null;
  setDocuments: (docs: DocumentItem[]) => void;
  setWhiteboards: (boards: WhiteboardItem[]) => void;
  setActiveDocument: (doc: DocumentItem | null) => void;
  setActiveWhiteboard: (board: WhiteboardItem | null) => void;

  // Active Sync Engine
  currentEngine: SyncEngine;
  setEngine: (engine: SyncEngine) => void;

  // Active Peer Presences
  presences: PresenceUser[];
  setPresences: (presences: PresenceUser[]) => void;
  updatePresence: (presence: PresenceUser) => void;
  removePresence: (userId: string) => void;

  // Network Simulation
  networkSim: NetworkSimConfig;
  setNetworkSim: (config: Partial<NetworkSimConfig>) => void;

  // Offline Sync State
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingOpCount: number;
  setPendingOpCount: (count: number) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Operations Log Trace
  operationTrace: OperationLog[];
  addOpTrace: (op: OperationLog) => void;
}

export const useStore = create<AppState>((set) => ({
  user: {
    id: 'usr_demo_1',
    name: 'Alex Rivera',
    email: 'alex@collabsync.dev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    role: 'Dist. Systems Lead'
  },
  setUser: (user) => set({ user }),

  activeWorkspaceId: 'ws_default_1',
  documents: [],
  whiteboards: [],
  activeDocument: null,
  activeWhiteboard: null,
  setDocuments: (documents) => set({ documents }),
  setWhiteboards: (whiteboards) => set({ whiteboards }),
  setActiveDocument: (activeDocument) => set({ activeDocument }),
  setActiveWhiteboard: (activeWhiteboard) => set({ activeWhiteboard }),

  currentEngine: 'crdt',
  setEngine: (currentEngine) => set({ currentEngine }),

  presences: [],
  setPresences: (presences) => set({ presences }),
  updatePresence: (presence) => set((state) => {
    const idx = state.presences.findIndex(p => p.userId === presence.userId);
    if (idx >= 0) {
      const updated = [...state.presences];
      updated[idx] = { ...updated[idx], ...presence };
      return { presences: updated };
    }
    return { presences: [...state.presences, presence] };
  }),
  removePresence: (userId) => set((state) => ({
    presences: state.presences.filter(p => p.userId !== userId)
  })),

  networkSim: {
    enabled: false,
    latencyMs: 0,
    packetLossPct: 0,
    disconnected: false,
    outOfOrder: false,
    slow3G: false
  },
  setNetworkSim: (config) => set((state) => ({
    networkSim: { ...state.networkSim, ...config }
  })),

  isOffline: false,
  setIsOffline: (isOffline) => set({ isOffline }),
  pendingOpCount: 0,
  setPendingOpCount: (pendingOpCount) => set({ pendingOpCount }),

  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),

  operationTrace: [],
  addOpTrace: (op) => set((state) => ({
    operationTrace: [op, ...state.operationTrace.slice(0, 49)]
  }))
}));
