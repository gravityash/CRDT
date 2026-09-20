import { OperationLog } from '../types';

export class LWWEngine {
  private siteId: string;

  constructor(siteId: string) {
    this.siteId = siteId;
  }

  public createLWWTextOp(targetId: string, content: string, userName: string): OperationLog {
    return {
      id: `op_lww_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'full_sync',
      opData: { content },
      engine: 'lww',
      timestamp: Date.now(),
      lamport: 0,
      userId: this.siteId,
      userName
    };
  }

  public createLWWCanvasOp(targetId: string, elements: any[], userName: string): OperationLog {
    return {
      id: `op_lww_canvas_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'full_sync',
      opData: { elements },
      engine: 'lww',
      timestamp: Date.now(),
      lamport: 0,
      userId: this.siteId,
      userName
    };
  }
}
