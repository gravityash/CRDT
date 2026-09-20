import { openDB, IDBPDatabase } from 'idb';
import { OperationLog } from '../types';

const DB_NAME = 'collabsync_offline_db';
const STORE_NAME = 'pending_ops';

export class OfflineQueue {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      }
    });
  }

  async addOperation(op: OperationLog): Promise<void> {
    const db = await this.dbPromise;
    await db.put(STORE_NAME, op);
  }

  async getPendingOperations(): Promise<OperationLog[]> {
    const db = await this.dbPromise;
    return await db.getAll(STORE_NAME);
  }

  async clearPendingOperations(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
  }

  async count(): Promise<number> {
    const db = await this.dbPromise;
    return await db.count(STORE_NAME);
  }
}

export const offlineQueue = new OfflineQueue();
