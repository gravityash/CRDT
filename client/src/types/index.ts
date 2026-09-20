export type SyncEngine = 'crdt' | 'yjs' | 'lww';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  workspaceId: string;
  content: string;
  engine: SyncEngine;
  version: number;
  updatedAt: string;
}

export interface WhiteboardElement {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'arrow' | 'line' | 'text' | 'sticky' | 'draw';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  points?: number[];
}

export interface WhiteboardItem {
  id: string;
  title: string;
  workspaceId: string;
  elements: WhiteboardElement[];
  engine: SyncEngine;
  version: number;
  updatedAt: string;
}

export interface PresenceUser {
  userId: string;
  userName: string;
  userAvatar: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  isTyping?: boolean;
}

export interface NetworkSimConfig {
  enabled: boolean;
  latencyMs: number; // 0 to 2000 ms
  packetLossPct: number; // 0 to 50 %
  disconnected: boolean;
  outOfOrder: boolean;
  slow3G: boolean;
}

export interface OperationLog {
  id: string;
  targetId: string;
  type: string;
  opData: any;
  engine: SyncEngine;
  timestamp: number;
  lamport: number;
  userId: string;
  userName: string;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
}
