// In-memory + localStorage cache — pure TypeScript

const CACHE_PREFIX = 'nfl-game-';
const DEFAULT_TTL = 12 * 60 * 60 * 1000; // 12 hours

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const fullKey = CACHE_PREFIX + key;

  // Check memory first
  const mem = memoryCache.get(fullKey);
  if (mem && mem.expiresAt > Date.now()) {
    return mem.data as T;
  }

  // Check localStorage
  try {
    const raw = localStorage.getItem(fullKey);
    if (raw) {
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (entry.expiresAt > Date.now()) {
        memoryCache.set(fullKey, entry);
        return entry.data;
      }
      localStorage.removeItem(fullKey);
    }
  } catch {
    // localStorage unavailable or corrupt
  }

  return null;
}

export function setCache<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  const fullKey = CACHE_PREFIX + key;
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttl,
  };

  memoryCache.set(fullKey, entry);

  try {
    localStorage.setItem(fullKey, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — memory cache still works
  }
}
