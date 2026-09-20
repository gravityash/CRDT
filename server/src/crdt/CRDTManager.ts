import { memoryDb, OperationLog } from '../store/memoryDb';

export class CRDTManager {
  private lamportClock: number = 0;

  public getClock(): number {
    return this.lamportClock;
  }

  public incrementClock(clientLamport: number = 0): number {
    this.lamportClock = Math.max(this.lamportClock, clientLamport) + 1;
    return this.lamportClock;
  }

  public applyOperation(op: {
    targetId: string;
    type: 'text_insert' | 'text_delete' | 'canvas_add' | 'canvas_update' | 'canvas_delete' | 'canvas_sync' | 'full_sync';
    opData: any;
    engine: 'crdt' | 'yjs' | 'lww';
    lamport: number;
    userId: string;
    userName: string;
  }): { mergedState: any; appliedOp: OperationLog } {
    const nextLamport = this.incrementClock(op.lamport);

    const logEntry: OperationLog = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      targetId: op.targetId,
      type: op.type,
      opData: op.opData,
      engine: op.engine,
      timestamp: Date.now(),
      lamport: nextLamport,
      userId: op.userId,
      userName: op.userName
    };

    memoryDb.operations.push(logEntry);

    // Apply to memory db state based on engine & type
    let mergedState: any = null;

    if (memoryDb.documents.has(op.targetId)) {
      const doc = memoryDb.documents.get(op.targetId)!;
      doc.version += 1;
      doc.updatedAt = new Date().toISOString();

      if (op.engine === 'lww') {
        // Last Write Wins: simple payload replacement
        if (op.type === 'full_sync' || op.opData.content !== undefined) {
          doc.content = op.opData.content;
        }
      } else if (op.engine === 'crdt') {
        // Custom RGA CRDT character/block merge simulation
        if (op.type === 'text_insert') {
          const { index, text } = op.opData;
          if (typeof index === 'number' && text) {
            doc.content = doc.content.slice(0, index) + text + doc.content.slice(index);
          } else if (op.opData.content !== undefined) {
            doc.content = op.opData.content;
          }
        } else if (op.type === 'text_delete') {
          const { index, length } = op.opData;
          if (typeof index === 'number') {
            doc.content = doc.content.slice(0, index) + doc.content.slice(index + (length || 1));
          } else if (op.opData.content !== undefined) {
            doc.content = op.opData.content;
          }
        } else if (op.opData && op.opData.content !== undefined) {
          doc.content = op.opData.content;
        }
      } else {
        // Yjs engine sync
        if (op.opData.content !== undefined) {
          doc.content = op.opData.content;
        }
      }
      mergedState = doc;
    } else if (memoryDb.whiteboards.has(op.targetId)) {
      const board = memoryDb.whiteboards.get(op.targetId)!;
      board.version += 1;
      board.updatedAt = new Date().toISOString();

      if (op.type === 'canvas_add' && op.opData.element) {
        const existingIdx = board.elements.findIndex(el => el.id === op.opData.element.id);
        if (existingIdx >= 0) {
          board.elements[existingIdx] = op.opData.element;
        } else {
          board.elements.push(op.opData.element);
        }
      } else if (op.type === 'canvas_update' && op.opData.element) {
        const existingIdx = board.elements.findIndex(el => el.id === op.opData.element.id);
        if (existingIdx >= 0) {
          board.elements[existingIdx] = { ...board.elements[existingIdx], ...op.opData.element };
        } else {
          board.elements.push(op.opData.element);
        }
      } else if (op.type === 'canvas_delete') {
        board.elements = board.elements.filter(el => el.id !== op.opData.elementId);
      } else if ((op.type === 'full_sync' || op.type === 'canvas_sync' || op.opData.elements) && Array.isArray(op.opData.elements)) {
        board.elements = op.opData.elements;
      }
      mergedState = board;
    }

    return { mergedState, appliedOp: logEntry };
  }
}

export const crdtServer = new CRDTManager();
