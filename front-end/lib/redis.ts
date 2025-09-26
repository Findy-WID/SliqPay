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
