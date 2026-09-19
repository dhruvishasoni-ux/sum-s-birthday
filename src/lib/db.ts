import type {
  WishCard,
  Story,
  NebulaWordEntry,
  VoiceNote,
  BlackHoleWish,
  UserAccount,
} from '../types/celestial';

export const STORES = {
  accounts: 'accounts', wishes: 'wishes', stories: 'stories', nebulaWords: 'nebulaWords',
  voiceNotes: 'voiceNotes', blackHoleWishes: 'blackHoleWishes', discoveredStars: 'discoveredStars', flags: 'flags',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];
type StoreRecordMap = {
  accounts: UserAccount; wishes: WishCard; stories: Story; nebulaWords: NebulaWordEntry;
  voiceNotes: VoiceNote; blackHoleWishes: BlackHoleWish; discoveredStars: { id: string };
  flags: { id: string; value: boolean | number };
};

const apiUrl = (store: string, id?: string) => `/api/records/${encodeURIComponent(store)}${id ? `/${encodeURIComponent(id)}` : ''}`;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `Database request failed (${response.status})`);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}

async function getAll<K extends keyof StoreRecordMap>(store: K) {
  return request<StoreRecordMap[K][]>(apiUrl(store));
}

async function get<K extends keyof StoreRecordMap>(store: K, id: string) {
  try { return await request<StoreRecordMap[K]>(apiUrl(store, id)); }
  catch (error) { if (error instanceof Error && error.message.includes('(404)')) return undefined; throw error; }
}

async function put<K extends keyof StoreRecordMap>(store: K, data: StoreRecordMap[K]) {
  await request(apiUrl(store, data.id), { method: 'PUT', body: JSON.stringify(data) });
}

async function remove<K extends keyof StoreRecordMap>(store: K, id: string) {
  await request(apiUrl(store, id), { method: 'DELETE' });
}

async function clear<K extends keyof StoreRecordMap>(store: K) {
  const records = await getAll(store);
  await Promise.all(records.map((item) => remove(store, item.id)));
}

async function getFlag(key: string) {
  const record = await get(STORES.flags, key);
  return record?.value ?? null;
}

async function setFlag(key: string, value: boolean | number) {
  await put(STORES.flags, { id: key, value });
}

export const db = { getAll, get, put, remove, clear, getFlag, setFlag };
