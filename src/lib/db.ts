// =====================================================
// INDEXED-DB  —  Persistent Browser Database
// Replaces in-memory React state for all user content.
// Data survives page refresh, browser restart, etc.
// =====================================================

import type {
  WishCard,
  Story,
  NebulaWordEntry,
  VoiceNote,
  BlackHoleWish,
  UserAccount,
} from '../types/celestial';

// ── Store names ──────────────────────────────────────
export const STORES = {
  accounts:        'accounts',
  wishes:          'wishes',
  stories:         'stories',
  nebulaWords:     'nebulaWords',
  voiceNotes:      'voiceNotes',
  blackHoleWishes: 'blackHoleWishes',
  discoveredStars: 'discoveredStars',  // { id: string }
  flags:           'flags',            // { id: string; value: boolean | number }
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

// ── Record type per store ─────────────────────────────
type StoreRecordMap = {
  accounts:        UserAccount;
  wishes:          WishCard;
  stories:         Story;
  nebulaWords:     NebulaWordEntry;
  voiceNotes:      VoiceNote;
  blackHoleWishes: BlackHoleWish;
  discoveredStars: { id: string };
  flags:           { id: string; value: boolean | number };
};

// ── DB config ────────────────────────────────────────
const DB_NAME    = 'birthday-sky-db';
const DB_VERSION = 1;

// ── Singleton promise ─────────────────────────────────
let _dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create all object stores keyed on 'id'
      Object.values(STORES).forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess  = (e) => resolve((e.target as IDBOpenDBRequest).result);
    request.onerror    = (e) => reject((e.target as IDBOpenDBRequest).error);
    request.onblocked  = () => reject(new Error('IndexedDB blocked'));
  });

  return _dbPromise;
}

// ── Generic helpers ───────────────────────────────────

function tx(
  db: IDBDatabase,
  store: string,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(store, mode).objectStore(store);
}

function wrap<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── Public API ────────────────────────────────────────

/**
 * Retrieve all records from a store.
 */
async function getAll<K extends keyof StoreRecordMap>(
  store: K
): Promise<StoreRecordMap[K][]> {
  const db  = await openDb();
  return wrap(tx(db, store, 'readonly').getAll()) as Promise<StoreRecordMap[K][]>;
}

/**
 * Retrieve a single record by id.
 */
async function get<K extends keyof StoreRecordMap>(
  store: K,
  id: string
): Promise<StoreRecordMap[K] | undefined> {
  const db = await openDb();
  return wrap(tx(db, store, 'readonly').get(id)) as Promise<StoreRecordMap[K] | undefined>;
}

/**
 * Upsert (insert or update) a record.
 */
async function put<K extends keyof StoreRecordMap>(
  store: K,
  record: StoreRecordMap[K]
): Promise<void> {
  const db = await openDb();
  await wrap(tx(db, store, 'readwrite').put(record));
}

/**
 * Delete a record by id.
 */
async function remove<K extends keyof StoreRecordMap>(
  store: K,
  id: string
): Promise<void> {
  const db = await openDb();
  await wrap(tx(db, store, 'readwrite').delete(id));
}

/**
 * Delete all records in a store.
 */
async function clear<K extends keyof StoreRecordMap>(
  store: K
): Promise<void> {
  const db = await openDb();
  await wrap(tx(db, store, 'readwrite').clear());
}

// ── Flag helpers (boolean / number key-value pairs) ───

async function getFlag(key: string): Promise<boolean | number | null> {
  const db = await openDb();
  const record = await wrap(
    tx(db, STORES.flags, 'readonly').get(key)
  ) as { id: string; value: boolean | number } | undefined;
  return record ? record.value : null;
}

async function setFlag(key: string, value: boolean | number): Promise<void> {
  const db = await openDb();
  await wrap(tx(db, STORES.flags, 'readwrite').put({ id: key, value }));
}

// ── Exported db object ────────────────────────────────
export const db = {
  getAll,
  get,
  put,
  remove,
  clear,
  getFlag,
  setFlag,
};
