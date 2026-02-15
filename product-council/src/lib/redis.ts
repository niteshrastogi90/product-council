import { Redis } from '@upstash/redis';

// Lazy initialization - only connect when actually needed
let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      // Return a mock Redis for local development without Redis
      return createMockRedis();
    }

    redis = new Redis({ url, token });
  }
  return redis;
}

// Simple in-memory mock for local development
function createMockRedis(): Redis {
  const store = new Map<string, unknown>();

  return {
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, value: unknown, opts?: { ex?: number }) => {
      store.set(key, value);
      if (opts?.ex) {
        setTimeout(() => store.delete(key), opts.ex * 1000);
      }
      return 'OK';
    },
    del: async (key: string) => { store.delete(key); return 1; },
    zadd: async (key: string, ...args: unknown[]) => {
      const sorted = (store.get(key) as Array<{score: number; member: string}>) || [];
      // Support { score, member } objects (Upstash format)
      for (const arg of args) {
        if (typeof arg === 'object' && arg !== null && 'score' in arg && 'member' in arg) {
          sorted.push(arg as {score: number; member: string});
        }
      }
      store.set(key, sorted);
      return sorted.length;
    },
    zrange: async (key: string, start: number, stop: number) => {
      const sorted = (store.get(key) as Array<{score: number; member: string}>) || [];
      return sorted.slice(start, stop + 1).map(s => s.member);
    },
    hset: async (key: string, field: string, value: unknown) => {
      const hash = (store.get(key) as Record<string, unknown>) || {};
      hash[field] = value;
      store.set(key, hash);
      return 1;
    },
    hgetall: async (key: string) => (store.get(key) as Record<string, unknown>) ?? null,
    exists: async (key: string) => store.has(key) ? 1 : 0,
    incr: async (key: string) => {
      const val = ((store.get(key) as number) || 0) + 1;
      store.set(key, val);
      return val;
    },
    expire: async (key: string, seconds: number) => {
      setTimeout(() => store.delete(key), seconds * 1000);
      return 1;
    },
  } as unknown as Redis;
}

// Session management helpers
export async function saveSession(sessionId: string, data: Record<string, unknown>) {
  const r = getRedis();
  await r.set(`session:${sessionId}`, JSON.stringify(data), { ex: 90 * 24 * 60 * 60 }); // 90 days
}

export async function getSession(sessionId: string) {
  const r = getRedis();
  const data = await r.get(`session:${sessionId}`);
  return data ? JSON.parse(data as string) : null;
}

export async function addUserSession(userEmail: string, sessionId: string) {
  const r = getRedis();
  await r.zadd(`user:${userEmail}:sessions`, { score: Date.now(), member: sessionId });
}

export async function getUserSessions(userEmail: string): Promise<string[]> {
  const r = getRedis();
  const sessions = await r.zrange(`user:${userEmail}:sessions`, 0, -1);
  return (sessions as string[]).reverse(); // newest first
}

// Rate limiting
export async function checkRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
  const r = getRedis();
  const current = await r.incr(`ratelimit:${key}`);
  if (current === 1) {
    await r.expire(`ratelimit:${key}`, windowSeconds);
  }
  return current <= maxRequests;
}
