import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UserRepository } from '../../modules/users/repositories/user.repository.js';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export function authGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;
  if (!token) return next({ status: 401, message: 'Unauthorized' });
  try {
    const payload: any = jwt.verify(token, env.JWT_SECRET);
    const userId = payload.sub as string;
    const user = UserRepository.findById(userId);
    if (!user) return next({ status: 401, message: 'Unauthorized' });
    req.user = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
    return next();
  } catch (err) {
    return next({ status: 401, message: 'Unauthorized' });
  }
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;
  if (!token) return next();
  try {
    const payload: any = jwt.verify(token, env.JWT_SECRET);
    const user = UserRepository.findById(payload.sub as string);
    if (user) {
      req.user = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
    }
  } catch {}
  next();
}
