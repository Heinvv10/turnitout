/**
 * In-memory sliding window rate limiter.
 * Works in serverless (Vercel) — state resets on cold starts,
 * but still protects against burst abuse within a single instance.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimiterOptions {
  windowMs: number;
  max: number;
}

interface RateLimiter {
  check: (key: string) => RateLimitResult;
}

function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const { windowMs, max } = options;
  const store = new Map<string, RateLimitEntry>();

  // Periodic cleanup of expired entries every 60s
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60_000);

  // Allow garbage collection in serverless environments
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  function check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = store.get(key);

    // No existing entry or window expired — start fresh
    if (!entry || now >= entry.resetAt) {
      const resetAt = now + windowMs;
      store.set(key, { count: 1, resetAt });
      return { allowed: true, remaining: max - 1, resetAt };
    }

    // Within the window — increment
    entry.count += 1;

    if (entry.count > max) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    return { allowed: true, remaining: max - entry.count, resetAt: entry.resetAt };
  }

  return { check };
}

/** AI API routes: 20 requests per minute per IP (6 checks x 3 retries) */
export const aiRateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/** Auth routes: 5 requests per minute per IP */
export const authRateLimiter = createRateLimiter({ windowMs: 60_000, max: 5 });

/** Strict auth routes (setup): 3 requests per minute per IP */
export const strictAuthRateLimiter = createRateLimiter({ windowMs: 60_000, max: 3 });

export { createRateLimiter };
export type { RateLimiter, RateLimitResult, RateLimiterOptions };
