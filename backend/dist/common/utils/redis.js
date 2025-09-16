import { createClient } from 'redis';
import { env } from '../../config/env.js';
import { logger } from './logger.js';
let client = null;
export function getRedis() {
    if (!client) {
        client = createClient({
            username: env.REDIS_USERNAME ?? 'default',
            password: env.REDIS_PASSWORD,
            socket: {
                host: env.REDIS_HOST ?? '127.0.0.1',
                port: env.REDIS_PORT ?? 6379,
            },
        });
        client.on('error', (err) => logger.error({ err }, 'Redis Client Error'));
        client.on('connect', () => logger.info('Redis connected'));
        client.on('reconnecting', () => logger.warn('Redis reconnecting...'));
        client.on('end', () => logger.info('Redis connection closed'));
    }
    return client;
}
export async function initRedis() {
    const c = getRedis();
    // Only connect if not already open
    if (!c.isOpen) {
        await c.connect();
    }
}
export async function quitRedis() {
    if (client?.isOpen) {
        await client.quit();
    }
}
export async function cacheSetJSON(key, value, ttlSeconds) {
    const c = getRedis();
    const payload = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
        await c.set(key, payload, { EX: ttlSeconds });
    }
    else {
        await c.set(key, payload);
    }
}
export async function cacheGetJSON(key) {
    const c = getRedis();
    const raw = await c.get(key);
    return raw ? JSON.parse(raw) : null;
}
