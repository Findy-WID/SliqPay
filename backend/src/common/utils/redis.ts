import { createClient, type RedisClientType } from 'redis';
import { env } from '../../config/env.js';
import { logger } from './logger.js';

let client: RedisClientType | null = null;

export function getRedis(): RedisClientType {
  if (!client) {
    const socket: any = {
      host: env.REDIS_HOST ?? '127.0.0.1',
      port: env.REDIS_PORT ?? 6379,
    };
    if (env.REDIS_TLS === 'true') {
      socket.tls = true as const;
    }

    client = createClient({
      username: env.REDIS_USERNAME ?? 'default',
      password: env.REDIS_PASSWORD,
      socket,
    });

    client.on('error', (err) => logger.error({ err }, 'Redis Client Error'));
    client.on('connect', () => logger.info('Redis connected'));
    client.on('reconnecting', () => logger.warn('Redis reconnecting...'));
    client.on('end', () => logger.info('Redis connection closed'));
  }
  return client;
}

export async function initRedis(): Promise<void> {
  const c = getRedis();
  if (!c.isOpen) {
    await c.connect();
  }
}

export async function quitRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
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
