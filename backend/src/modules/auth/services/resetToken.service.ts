import { randomBytes } from 'crypto';
import { getRedis } from '../../../common/utils/redis.js';
import { env } from '../../../config/env.js';

const TTL = Number(env.RESET_TOKEN_TTL_SECONDS || 900); // 15 min default

export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const key = `pwreset:${token}`;
  const c = getRedis();
  await c.set(key, userId, { EX: TTL });
  return token;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const key = `pwreset:${token}`;
  const c = getRedis();
  const userId = await c.get(key);
  if (userId) await c.del(key);
  return userId;
}
