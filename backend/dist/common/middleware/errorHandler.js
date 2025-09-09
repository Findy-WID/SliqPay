import { logger } from '../utils/logger.js';
export function errorHandler(err, _req, res, _next) {
    const status = err.status || 500;
    if (status >= 500)
        logger.error(err);
    res.status(status).json({
        error: err.message || 'Internal Server Error',
        ...(err.details && { details: err.details })
    });
}
