// filepath: /home/kaanyi/VS Projects/SliqPay/backend/src/common/session/sessionStore.ts
import type { CookieOptions, Response, Request, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { cacheGetJSON, cacheSetJSON, getRedis } from '../utils/redis.js';

const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME ?? 'sid';
const DEFAULT_TTL = Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 7); // 7 days

export type SessionData = {
  userId: string;
  roles?: string[];
  createdAt: number;
};

export type SessionRecord = {
  id: string;
  data: SessionData;
};

function keyFor(sid: string) {
  return `sess:${sid}`;
}

export async function createSession(
  data: Omit<SessionData, 'createdAt'>,
  ttlSeconds: number = DEFAULT_TTL
): Promise<SessionRecord> {
  const sid = randomUUID();
  const record: SessionRecord = { id: sid, data: { ...data, createdAt: Date.now() } };
  await cacheSetJSON(keyFor(sid), record, ttlSeconds);
  return record;
}

export async function getSession(
  sid: string,
  { refreshTTL = true, ttlSeconds = DEFAULT_TTL }: { refreshTTL?: boolean; ttlSeconds?: number } = {}
): Promise<SessionRecord | null> {
  const record = await cacheGetJSON<SessionRecord>(keyFor(sid));
  if (!record) return null;
  if (refreshTTL) {
    const c = getRedis();
    await c.expire(keyFor(sid), ttlSeconds);
  }
  return record;
}

export async function destroySession(sid: string): Promise<void> {
  const c = getRedis();
  await c.del(keyFor(sid));
}

function cookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN || undefined;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    path: '/',
    domain,
    maxAge: DEFAULT_TTL * 1000,
  };
}

export function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, cookieOptions());
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions(), maxAge: 0 });
}

// Augment Express Request
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: SessionRecord;
    }
  }
}

export function sessionMiddleware() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const sid = (req as any).cookies?.[SESSION_COOKIE] as string | undefined;
      if (!sid) return next();
      const record = await getSession(sid);
      if (record) {
        req.session = record;
      }
    } catch (err) {
      // swallow session errors; app should continue
    }
    next();
  };
}
