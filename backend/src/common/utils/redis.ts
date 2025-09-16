import { createClient } from 'redis';
import { env } from '../../config/env.js';
import { logger } from './logger.js';

// Minimal client interface we rely on across the codebase
export interface SimpleRedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
  del(key: string): Promise<void>;
  ping(): Promise<string>;
  isOpen: boolean;
  connect(): Promise<void>;
  quit(): Promise<void>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
}

const REDIS_ENABLED = !!env.REDIS_HOST; // if not set, fall back to in-memory

// In-memory fallback implementation (ephemeral, per-process)
class MemoryRedis implements SimpleRedisClient {
  private store = new Map<string, { value: string; expiresAt?: number }>();
  isOpen = true;
  async connect(): Promise<void> { /* no-op */ }
  async quit(): Promise<void> { /* no-op */ }
  async ping(): Promise<string> { return 'PONG'; }
  private isExpired(rec?: { value: string; expiresAt?: number }): boolean {
    return !!rec?.expiresAt && rec!.expiresAt! <= Date.now();
  }
  async get(key: string): Promise<string | null> {
    const rec = this.store.get(key);
    if (!rec) return null;
    if (this.isExpired(rec)) { this.store.delete(key); return null; }
    return rec.value;
  }
  async set(key: string, value: string, options?: { EX?: number }): Promise<void> {
    const expiresAt = options?.EX ? Date.now() + options.EX * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }
  async incr(key: string): Promise<number> {
    const rec = this.store.get(key);
    if (!rec || this.isExpired(rec)) {
      const v = 1;
      this.store.set(key, { value: String(v), expiresAt: rec?.expiresAt });
      return v;
    }
    const n = Number(rec.value) || 0;
    const v = n + 1;
    rec.value = String(v);
    // keep existing expiresAt
    this.store.set(key, rec);
    return v;
  }
  async expire(key: string, seconds: number): Promise<void> {
    const rec = this.store.get(key);
    if (rec) {
      rec.expiresAt = Date.now() + seconds * 1000;
      this.store.set(key, rec);
    }
  }
  async ttl(key: string): Promise<number> {
    const rec = this.store.get(key);
    if (!rec) return -2; // key does not exist
    if (!rec.expiresAt) return -1; // no expiration
    const ms = rec.expiresAt - Date.now();
    return ms <= 0 ? -2 : Math.ceil(ms / 1000);
  }
  async del(key: string): Promise<void> { this.store.delete(key); }
}

let client: SimpleRedisClient | null = null;

export function getRedis(): SimpleRedisClient {
  if (!client) {
    if (!REDIS_ENABLED) {
      client = new MemoryRedis();
      logger.warn('REDIS_HOST not set; using in-memory store for sessions and rate limiting');
      return client;
    }

    const socket: any = {
      host: env.REDIS_HOST,
      port: env.REDIS_PORT ?? 6379,
    };
    if (env.REDIS_TLS === 'true') {
      socket.tls = true as const;
    }

    const realClient = createClient({
      username: env.REDIS_USERNAME ?? 'default',
      password: env.REDIS_PASSWORD,
      socket,
    });

    realClient.on('error', (err) => logger.error({ err }, 'Redis Client Error'));
    realClient.on('connect', () => logger.info('Redis connected'));
    realClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));
    realClient.on('end', () => logger.info('Redis connection closed'));

    client = realClient as unknown as SimpleRedisClient;
  }
  return client;
}

export async function initRedis(): Promise<void> {
  const c = getRedis();
  if (!REDIS_ENABLED) {
    // memory mode is immediately available
    return;
  }
  if (!('isOpen' in c) || !(c as any).isOpen) {
    await (c as any).connect();
  }
}

export async function quitRedis(): Promise<void> {
  const c = client;
  if (!c) return;
  if (!REDIS_ENABLED) return; // memory mode no-op
  if ((c as any).isOpen) {
    await (c as any).quit();
  }
}

export async function cacheSetJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  const c = getRedis();
  const payload = JSON.stringify(value);
  if (ttlSeconds && ttlSeconds > 0) {
    await c.set(key, payload, { EX: ttlSeconds });
  } else {
    await c.set(key, payload);
  }
}

export async function cacheGetJSON<T>(key: string): Promise<T | null> {
  const c = getRedis();
  const raw = await c.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}
