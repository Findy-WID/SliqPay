// filepath: /home/kaanyi/VS Projects/SliqPay/backend/src/common/middleware/rateLimit.ts
import type { NextFunction, Request, Response } from 'express';
import { getRedis } from '../utils/redis.js';

export type RateLimitOptions = {
  windowSeconds: number;
  limit: number;
  prefix?: string;
  bucket?: string;
  identifier?: (req: Request) => string;
  failClosed?: boolean; // if true, on Redis error block request
};

export function rateLimit(opts: RateLimitOptions) {
  const windowSeconds = Math.max(1, opts.windowSeconds);
  const limit = Math.max(1, opts.limit);
  const prefix = opts.prefix ?? 'rl';
  const bucket = opts.bucket ?? 'global';
  const identifier = opts.identifier ?? ((req) => (req.ip || 'unknown'));
  const failClosed = opts.failClosed ?? false;

  return async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const id = identifier(req);
    const key = `${prefix}:${bucket}:${id}`;
    const c = getRedis();
    try {
      const count = await c.incr(key);
      if (count === 1) {
        await c.expire(key, windowSeconds);
      }

      const ttl = await c.ttl(key);
      const remaining = Math.max(0, limit - count);

      res.setHeader('X-RateLimit-Limit', String(limit));
      res.setHeader('X-RateLimit-Remaining', String(remaining > 0 ? remaining : 0));
      if (ttl >= 0) res.setHeader('X-RateLimit-Reset', String(ttl));

      if (count > limit) {
        if (ttl >= 0) res.setHeader('Retry-After', String(ttl));
        return res.status(429).json({
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
            details: { bucket, id }
          }
        });
      }

      return next();
    } catch (err) {
      // On Redis failure, either fail-closed or pass-through
      if (failClosed) {
        return res.status(503).json({ error: { code: 'SERVICE_UNAVAILABLE', message: 'Rate limit unavailable' } });
      }
      return next();
    }
  };
}
