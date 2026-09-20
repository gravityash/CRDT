import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: { userId: string; role: 'Owner' | 'Admin' | 'Editor' | 'Viewer' }[];
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  workspaceId: string;
  content: string;
  engine: 'crdt' | 'yjs' | 'lww';
  version: number;
  updatedAt: string;
}

export interface WhiteboardItem {
  id: string;
  title: string;
  workspaceId: string;
  elements: any[];
  engine: 'crdt' | 'yjs' | 'lww';
  version: number;
  updatedAt: string;
}

export interface OperationLog {
  id: string;
  targetId: string;
  type: string;
  opData: any;
  engine: string;
  timestamp: number;
  lamport: number;
  userId: string;
  userName: string;
}

export interface CommentItem {
  id: string;
  targetId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  resolved: boolean;
}

// In-Memory Failover Database Store
class MemoryDatabase {
  users: Map<string, User> = new Map();
  workspaces: Map<string, Workspace> = new Map();
  documents: Map<string, DocumentItem> = new Map();
  whiteboards: Map<string, WhiteboardItem> = new Map();
  operations: OperationLog[] = [];
  comments: CommentItem[] = [];

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    // Demo Users
    const demoUser: User = {
      id: 'usr_demo_1',
      name: 'Alex Rivera',
      email: 'alex@collabsync.dev',
      passwordHash: '$2a$10$w8T0iZJ1234567890abcdefuO.1234567890abcdef', // hashed 'password'
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
      role: 'Architect',
      createdAt: new Date().toISOString()
    };
    const demoUser2: User = {
      id: 'usr_demo_2',
      name: 'Sarah Chen',
      email: 'sarah@collabsync.dev',
      passwordHash: '$2a$10$w8T0iZJ1234567890abcdefuO.1234567890abcdef',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      role: 'Lead Designer',
      createdAt: new Date().toISOString()
    };
    this.users.set(demoUser.id, demoUser);
    this.users.set(demoUser.email, demoUser);
    this.users.set(demoUser2.id, demoUser2);

    // Demo Workspace
    const defaultWs: Workspace = {
      id: 'ws_default_1',
      name: 'Distributed Systems Major Project',
      ownerId: demoUser.id,
      members: [
        { userId: demoUser.id, role: 'Owner' },
        { userId: demoUser2.id, role: 'Editor' }
      ],
      createdAt: new Date().toISOString()
    };
    this.workspaces.set(defaultWs.id, defaultWs);

    // Initial Document
    const defaultDoc: DocumentItem = {
      id: 'doc_crdt_paper',
      title: 'CRDT vs LWW Research Specification',
      workspaceId: defaultWs.id,
      content: `# CollabSync: Distributed Collaboration Analysis

Welcome to CollabSync enterprise edition.

## Architectural Objectives
- Real-Time Conflict-Free Synchronization
- Zero Data Loss under 50% Packet Loss
- Dynamic Sync Engine Switching (RGA/OR-Set, Yjs, LWW)
- Offline Buffering & Deterministic Topological Merge

### Live Testing Instructions
1. Open multiple browser tabs.
2. Toggle the **Network Simulation Panel** to simulate 500ms latency.
3. Switch synchronization engines live and observe the latency timeline!`,
      engine: 'crdt',
      version: 1,
      updatedAt: new Date().toISOString()
    };
    this.documents.set(defaultDoc.id, defaultDoc);

    // Initial Whiteboard
    const defaultBoard: WhiteboardItem = {
      id: 'board_system_arch',
      title: 'System Architecture & Canvas Whiteboard',
      workspaceId: defaultWs.id,
      elements: [
        {
          id: 'rect_1',
          type: 'rectangle',
          x: 100,
          y: 120,
          width: 220,
          height: 140,
          fill: 'rgba(59, 130, 246, 0.15)',
          stroke: '#3b82f6',
          strokeWidth: 2,
          text: 'Client A\n(IndexedDB Buffering)'
        },
        {
          id: 'rect_2',
          type: 'rectangle',
          x: 480,
          y: 120,
          width: 220,
          height: 140,
          fill: 'rgba(16, 185, 129, 0.15)',
          stroke: '#10b981',
          strokeWidth: 2,
          text: 'Socket.io Server\n(Lamport Clock Engine)'
        },
        {
          id: 'rect_3',
          type: 'rectangle',
          x: 860,
          y: 120,
          width: 220,
          height: 140,
          fill: 'rgba(168, 85, 247, 0.15)',
          stroke: '#a855f7',
          strokeWidth: 2,
          text: 'Client B\n(Yjs / CRDT Listener)'
        },
        {
          id: 'arrow_1',
          type: 'arrow',
          points: [320, 190, 480, 190],
          stroke: '#60a5fa',
          strokeWidth: 3,
          label: 'Op Stream'
        },
        {
          id: 'arrow_2',
          type: 'arrow',
          points: [700, 190, 860, 190],
          stroke: '#34d399',
          strokeWidth: 3,
          label: 'Sync Broadcast'
        },
        {
          id: 'sticky_1',
          type: 'sticky',
          x: 200,
          y: 320,
          width: 180,
          height: 120,
          fill: '#fef08a',
          text: '💡 Try turning on 1000ms Latency in Dev Panel!'
        }
      ],
      engine: 'crdt',
      version: 1,
      updatedAt: new Date().toISOString()
    };
    this.whiteboards.set(defaultBoard.id, defaultBoard);

    // Initial Comments
    this.comments.push({
      id: uuidv4(),
      targetId: defaultDoc.id,
      userId: demoUser2.id,
      userName: demoUser2.name,
      userAvatar: demoUser2.avatar,
      text: 'Great documentation! The RGA text synchronization works fast.',
      createdAt: new Date().toISOString(),
      resolved: false
    });
  }
}

export const memoryDb = new MemoryDatabase();
