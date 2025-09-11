import { Request, Response, NextFunction } from 'express';
export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next({ status: 404, message: 'Not Found' });
}
