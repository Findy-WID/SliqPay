import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || 500;
  if (status >= 500) logger.error(err);
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    ...(err.details && { details: err.details })
  });
}
