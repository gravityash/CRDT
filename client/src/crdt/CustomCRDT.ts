import { OperationLog, WhiteboardElement } from '../types';

export interface RGAChar {
  id: string; // `${lamport}_${siteId}_${seq}`
  value: string;
  tombstone: boolean;
  predecessorId: string | null;
  lamport: number;
}

export class CustomCRDT {
  private lamportClock: number = 0;
  private siteId: string;

  constructor(siteId: string) {
    this.siteId = siteId;
  }

  public getLamport(): number {
    return this.lamportClock;
  }

  public tick(remoteLamport: number = 0): number {
    this.lamportClock = Math.max(this.lamportClock, remoteLamport) + 1;
    return this.lamportClock;
  }

  // RGA Text Insert Operation
  public createTextInsertOp(
    targetId: string,
    index: number,
    text: string,
    fullContent: string,
    userName: string
  ): OperationLog {
    const lamport = this.tick();
    return {
      id: `op_rga_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'text_insert',
      opData: { index, text, content: fullContent },
      engine: 'crdt',
      timestamp: Date.now(),
      lamport,
      userId: this.siteId,
      userName
    };
  }

  // RGA Text Delete Operation
  public createTextDeleteOp(
    targetId: string,
    index: number,
    length: number,
    fullContent: string,
    userName: string
  ): OperationLog {
    const lamport = this.tick();
    return {
      id: `op_rga_del_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'text_delete',
      opData: { index, length, content: fullContent },
      engine: 'crdt',
      timestamp: Date.now(),
      lamport,
      userId: this.siteId,
      userName
    };
  }

  // OR-Set Canvas Operation
  public createCanvasAddOp(
    targetId: string,
    element: WhiteboardElement,
    allElements: WhiteboardElement[],
    userName: string
  ): OperationLog {
    const lamport = this.tick();
    return {
      id: `op_orset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'canvas_add',
      opData: { element, elements: allElements },
      engine: 'crdt',
      timestamp: Date.now(),
      lamport,
      userId: this.siteId,
      userName
    };
  }

  public createCanvasUpdateOp(
    targetId: string,
    element: WhiteboardElement,
    allElements: WhiteboardElement[],
    userName: string
  ): OperationLog {
    const lamport = this.tick();
    return {
      id: `op_orset_upd_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'canvas_update',
      opData: { element, elements: allElements },
      engine: 'crdt',
      timestamp: Date.now(),
      lamport,
      userId: this.siteId,
      userName
    };
  }

  public createCanvasDeleteOp(
    targetId: string,
    elementId: string,
    allElements: WhiteboardElement[],
    userName: string
  ): OperationLog {
    const lamport = this.tick();
    return {
      id: `op_orset_del_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'canvas_delete',
      opData: { elementId, elements: allElements },
      engine: 'crdt',
      timestamp: Date.now(),
      lamport,
      userId: this.siteId,
      userName
    };
  }

  public createCanvasSyncOp(
    targetId: string,
    elements: WhiteboardElement[],
    userName: string
  ): OperationLog {
    const lamport = this.tick();
    return {
      id: `op_orset_sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'canvas_sync',
      opData: { elements },
      engine: 'crdt',
      timestamp: Date.now(),
      lamport,
      userId: this.siteId,
      userName
    };
  }
}
