import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './common/utils/logger.js';
import { initRedis, quitRedis } from './common/utils/redis.js';

async function start() {
  try {
    await initRedis();
    app.listen(env.PORT, () => {
      logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Backend server listening');
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();

process.on('SIGINT', async () => {
  await quitRedis();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await quitRedis();
  process.exit(0);
});
