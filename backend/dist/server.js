import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './common/utils/logger.js';
app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, 'Backend server listening');
});
