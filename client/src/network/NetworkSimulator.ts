import { Socket } from 'socket.io-client';
import { NetworkSimConfig, OperationLog } from '../types';
import { offlineQueue } from '../offline/OfflineQueue';

export class NetworkSimulator {
  private socket: Socket | null = null;
  private config: NetworkSimConfig;
  private onTraceLog?: (op: OperationLog) => void;

  constructor(config: NetworkSimConfig) {
    this.config = config;
  }

  public setSocket(socket: Socket) {
    this.socket = socket;
  }

  public updateConfig(newConfig: Partial<NetworkSimConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public setTraceCallback(cb: (op: OperationLog) => void) {
    this.onTraceLog = cb;
  }

  public dispatchOperation(roomId: string, op: OperationLog, isOnline: boolean): void {
    if (this.onTraceLog) this.onTraceLog(op);

    // If completely offline or simulated disconnect
    if (!isOnline || this.config.disconnected) {
      console.log('[NetworkSim] Client offline/disconnected. Buffering operation in IndexedDB local queue.');
      offlineQueue.addOperation(op);
      return;
    }

    // Packet Loss Simulation
    if (this.config.enabled && this.config.packetLossPct > 0) {
      const dropRoll = Math.random() * 100;
      if (dropRoll < this.config.packetLossPct) {
        console.warn(`[NetworkSim] Packet Loss Simulated (${this.config.packetLossPct}%). Operation ${op.id} dropped!`);
        return;
      }
    }

    // Latency Simulation
    const totalLatency = (this.config.enabled ? this.config.latencyMs : 0) + (this.config.slow3G ? 400 : 0);

    const sendPayload = () => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('submit_operation', {
          roomId,
          type: op.type,
          opData: op.opData,
          engine: op.engine,
          lamport: op.lamport,
          userId: op.userId,
          userName: op.userName,
          simulatedLatency: 0
        });
      }
    };

    if (totalLatency > 0) {
      setTimeout(sendPayload, totalLatency);
    } else {
      sendPayload();
    }
  }

  async flushOfflineQueue(roomId: string) {
    if (!this.socket || !this.socket.connected) return;
    const pendingOps = await offlineQueue.getPendingOperations();
    if (pendingOps.length === 0) return;

    console.log(`[NetworkSim] Reconnection established! Flushing ${pendingOps.length} buffered operations from IndexedDB.`);
    for (const op of pendingOps) {
      this.socket.emit('submit_operation', {
        roomId,
        type: op.type,
        opData: op.opData,
        engine: op.engine,
        lamport: op.lamport,
        userId: op.userId,
        userName: op.userName
      });
    }

    await offlineQueue.clearPendingOperations();
  }
}
