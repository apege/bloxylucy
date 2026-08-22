// In-memory cache helper for serverless / Node.js Next.js route handlers

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export function getMemoryCache<T>(key: string, ttlMs: number = 60000): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > ttlMs) {
    memoryCache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setMemoryCache<T>(key: string, data: T): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export function invalidateMemoryCache(prefixOrKey?: string): void {
  if (!prefixOrKey) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefixOrKey)) {
      memoryCache.delete(key);
    }
  }
}