import { redis } from '@/lib/redis';

// L1 In-Memory Cache
const l1Cache = new Map<string, { data: any; expiry: number }>();

export async function cachedQuery<T>(
  key: string,
  ttl: number,
  queryFn: () => Promise<T>
): Promise<T> {
  // If TTL is 0, bypass cache completely
  if (ttl === 0) {
    return queryFn();
  }

  const now = Date.now();
  const l1Cached = l1Cache.get(key);
  if (l1Cached && l1Cached.expiry > now) {
    return l1Cached.data as T;
  }

  let data: T | null = null;
  try {
    const cached = await redis.get(key);
    if (cached !== null) {
      if (typeof cached === 'string') {
        try {
          data = JSON.parse(cached) as T;
        } catch {
          data = cached as unknown as T;
        }
      } else {
        data = cached as T;
      }
    }
  } catch (error) {
    console.error(`Cache read failed for key ${key}:`, error);
  }

  if (data !== null) {
    // Populate L1 cache (cap at 60 seconds to keep it fresh and prevent stale memory)
    l1Cache.set(key, { data, expiry: now + Math.min(60, ttl) * 1000 });
    return data;
  }

  // Cache miss or error: run query
  const queryData = await queryFn();

  try {
    await redis.set(key, JSON.stringify(queryData), { ex: ttl });
    l1Cache.set(key, { data: queryData, expiry: now + Math.min(60, ttl) * 1000 });
  } catch (error) {
    console.error(`Cache write failed for key ${key}:`, error);
  }

  return queryData;
}

export async function invalidateCache(key: string): Promise<void> {
  l1Cache.delete(key);
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Cache invalidation failed for key ${key}:`, error);
  }
}
