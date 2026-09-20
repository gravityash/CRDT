import { Server, Socket } from 'socket.io';
import { crdtServer } from '../crdt/CRDTManager';
import { memoryDb } from '../store/memoryDb';

interface UserPresence {
  userId: string;
  userName: string;
  userAvatar: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  activeDocumentId?: string;
  isTyping?: boolean;
}

const activePresenceMap = new Map<string, UserPresence>();
const userSockets = new Map<string, string>(); // socketId -> userId

const COLORS = [
  '#3b82f6', '#10b981', '#a855f7', '#f59e0b',
  '#ec4899', '#06b6d4', '#84cc16', '#e11d48'
];

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room / Register user
    socket.on('join_room', (data: { roomId: string; user: { id: string; name: string; avatar?: string } }) => {
      socket.join(data.roomId);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      const presence: UserPresence = {
        userId: data.user.id || `usr_${socket.id.substring(0, 5)}`,
        userName: data.user.name || 'Anonymous Peer',
        userAvatar: data.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${socket.id}`,
        color,
        activeDocumentId: data.roomId
      };

      activePresenceMap.set(socket.id, presence);
      userSockets.set(socket.id, presence.userId);

      // Broadcast join notification & updated presence
      io.to(data.roomId).emit('user_joined', {
        user: presence,
        activeUsers: Array.from(activePresenceMap.values()).filter(p => p.activeDocumentId === data.roomId)
      });

      console.log(`[Socket] User ${presence.userName} joined room ${data.roomId}`);
    });

    // Real-time Cursor & Selection Movement
    socket.on('cursor_move', (data: { roomId: string; cursor: { x: number; y: number }; selection?: { start: number; end: number } }) => {
      const presence = activePresenceMap.get(socket.id);
      if (presence) {
        presence.cursor = data.cursor;
        presence.selection = data.selection;
        socket.to(data.roomId).emit('cursor_updated', {
          socketId: socket.id,
          presence
        });
      }
    });

    // Typing indicator
    socket.on('typing_status', (data: { roomId: string; isTyping: boolean }) => {
      const presence = activePresenceMap.get(socket.id);
      if (presence) {
        presence.isTyping = data.isTyping;
        socket.to(data.roomId).emit('user_typing', {
          userId: presence.userId,
          userName: presence.userName,
          isTyping: data.isTyping
        });
      }
    });

    // Operation Broadcast (CRDT / Yjs / LWW op)
    socket.on('submit_operation', (opData: {
      roomId: string;
      type: any;
      opData: any;
      engine: 'crdt' | 'yjs' | 'lww';
      lamport: number;
      userId: string;
      userName: string;
      simulatedLatency?: number;
    }) => {
      const applyAndBroadcast = () => {
        const { mergedState, appliedOp } = crdtServer.applyOperation({
          targetId: opData.roomId,
          type: opData.type,
          opData: opData.opData,
          engine: opData.engine,
          lamport: opData.lamport || 0,
          userId: opData.userId,
          userName: opData.userName
        });

        // Broadcast to other peers in room
        socket.to(opData.roomId).emit('operation_applied', {
          op: appliedOp,
          mergedState,
          serverLamport: crdtServer.getClock()
        });

        // Confirm to sender
        socket.emit('operation_ack', {
          opId: appliedOp.id,
          serverLamport: crdtServer.getClock()
        });
      };

      if (opData.simulatedLatency && opData.simulatedLatency > 0) {
        setTimeout(applyAndBroadcast, opData.simulatedLatency);
      } else {
        applyAndBroadcast();
      }
    });

    // Engine switch broadcast
    socket.on('switch_engine', (data: { roomId: string; engine: 'crdt' | 'yjs' | 'lww' }) => {
      io.to(data.roomId).emit('engine_switched', {
        engine: data.engine,
        switchedBy: activePresenceMap.get(socket.id)?.userName || 'System'
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      const presence = activePresenceMap.get(socket.id);
      if (presence && presence.activeDocumentId) {
        socket.to(presence.activeDocumentId).emit('user_left', {
          userId: presence.userId,
          userName: presence.userName
        });
      }
      activePresenceMap.delete(socket.id);
      userSockets.delete(socket.id);
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
}
