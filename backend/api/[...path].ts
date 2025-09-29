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

  const originalUrl = req.url ?? '/';
  const [pathname, search = ''] = originalUrl.split('?');
  let nextPath = pathname;

  if (pathname.startsWith('/backend/api')) {
    nextPath = pathname.replace('/backend/api', '/api') || '/api';
  } else if (!pathname.startsWith('/api')) {
    nextPath = pathname === '' ? '/api' : `/api${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  }

  req.url = search ? `${nextPath}?${search}` : nextPath;

  return new Promise<void>((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);
    app(req as any, res as any);
  });
}
