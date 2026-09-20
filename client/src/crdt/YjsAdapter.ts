import * as Y from 'yjs';
import { OperationLog } from '../types';

export class YjsAdapter {
  public ydoc: Y.Doc;
  public ytext: Y.Text;
  public ymap: Y.Map<any>;
  private siteId: string;

  constructor(siteId: string) {
    this.siteId = siteId;
    this.ydoc = new Y.Doc();
    this.ytext = this.ydoc.getText('collab_text');
    this.ymap = this.ydoc.getMap('collab_canvas');
  }

  public createYjsTextOp(targetId: string, content: string, userName: string): OperationLog {
    return {
      id: `op_yjs_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'full_sync',
      opData: { content },
      engine: 'yjs',
      timestamp: Date.now(),
      lamport: 0,
      userId: this.siteId,
      userName
    };
  }

  public createYjsCanvasOp(targetId: string, elements: any[], userName: string): OperationLog {
    return {
      id: `op_yjs_canvas_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      targetId,
      type: 'full_sync',
      opData: { elements },
      engine: 'yjs',
      timestamp: Date.now(),
      lamport: 0,
      userId: this.siteId,
      userName
    };
  }
}
