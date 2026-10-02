import 'server-only';
import { Redis } from '@upstash/redis';
import { RATE_LIMITS } from '@/lib/constants';

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory token bucket store for local dev
const memoryStore = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  key: string,
  limitType: 'upload_per_hour' | 'analyses_per_hour' | 'mentor_per_hour'
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const maxAllowed = RATE_LIMITS[limitType];
  const windowSec = 3600; // 1 hour

  if (redis) {
    try {
      const redisKey = `ratelimit:${limitType}:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) {
        await redis.expire(redisKey, windowSec);
      }
      return {
        success: count <= maxAllowed,
        remaining: Math.max(0, maxAllowed - count),
        reset: windowSec,
      };
    } catch (e) {
      console.warn('Redis rate limit check failed, falling back to memory store.');
    }
  }

  // Memory fallback
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { success: true, remaining: maxAllowed - 1, reset: windowSec };
  }

  if (entry.count >= maxAllowed) {
    return { success: false, remaining: 0, reset: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { success: true, remaining: maxAllowed - entry.count, reset: Math.ceil((entry.resetAt - now) / 1000) };
}
