import type { IncomingMessage, ServerResponse } from 'http';
import { app } from '../src/app.js';
import { initRedis } from '../src/common/utils/redis.js';

let redisInitialized = false;

async function ensureRedis() {
  if (!redisInitialized) {
    await initRedis();
    redisInitialized = true;
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureRedis();

  if (req.url && !req.url.startsWith('/api/')) {
    const normalized = req.url.startsWith('/') ? req.url : `/${req.url}`;
    req.url = `/api${normalized}`;
  }

  return new Promise<void>((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);
    app(req as any, res as any);
  });
}
