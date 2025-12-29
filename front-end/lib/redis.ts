import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  // In development we might not have Upstash configured; keep this explicit so deploy fails loudly.
  throw new Error('Missing Upstash Redis env vars: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
import { kv } from '@vercel/kv'

export const redis = kv

export async function setSession(key: string, value: any, expiresIn: number) {
  await redis.set(key, JSON.stringify(value), { ex: expiresIn })
}

export async function getSession(key: string) {
  const data = await redis.get(key)
  return data ? JSON.parse(data as string) : null
}

export async function deleteSession(key: string) {
  await redis.del(key)
}
