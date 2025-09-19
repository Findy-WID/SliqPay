import { Request, Response } from 'express';
import { getRedis } from '../../../common/utils/redis.js';

export async function health(_req: Request, res: Response) {
  const ts = new Date().toISOString();
  let redis: 'up' | 'down' = 'down';
  try {
    const c = getRedis();
    const pong = await c.ping();
    if (typeof pong === 'string' && pong.toUpperCase() === 'PONG') {
      redis = 'up';
    }
  } catch {
    redis = 'down';
  }
  res.json({ status: 'ok', ts, services: { redis } });
}

export async function kvDemo(_req: Request, res: Response) {
  const c = getRedis();
  await c.set('foo', 'bar');
  const result = await c.get('foo');
  res.json({ key: 'foo', value: result });
}
