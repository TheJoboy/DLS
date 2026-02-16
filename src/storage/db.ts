import { normalizeWeeklyEntry, type WeeklyEntry } from '../domain/models';

const DB_NAME = 'dls-health';
const STORE = 'weeklyEntries';
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore(STORE, { keyPath: 'isoWeekKey' });
      store.createIndex('isoWeekKey', 'isoWeekKey', { unique: true });
      store.createIndex('updatedAt', 'updatedAt');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const req = action(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export const weeklyEntryStore = {
  async getByWeek(isoWeekKey: string) {
    const entry = await withStore<WeeklyEntry | undefined>('readonly', (s) => s.get(isoWeekKey));
    return entry ? normalizeWeeklyEntry(entry) : undefined;
  },
  async getAll() {
    const entries = await withStore<WeeklyEntry[]>('readonly', (s) => s.getAll());
    return entries.map((entry) => normalizeWeeklyEntry(entry)).sort((a, b) => b.isoWeekKey.localeCompare(a.isoWeekKey));
  },
  async upsert(entry: WeeklyEntry) {
    return withStore<IDBValidKey>('readwrite', (s) => s.put(normalizeWeeklyEntry(entry)));
  },
  async delete(isoWeekKey: string) {
    return withStore<undefined>('readwrite', (s) => s.delete(isoWeekKey));
  },
  async clear() {
    return withStore<undefined>('readwrite', (s) => s.clear());
  },
  async bulkUpsert(entries: WeeklyEntry[]) {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      for (const entry of entries) store.put(normalizeWeeklyEntry(entry));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }
};
