import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { UserRepository } from '../../modules/users/repositories/user.repository.js';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authGuard(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    // Prefer session if present
    const sess = (req as any).session;
    if (sess?.data?.userId) {
      const user = await UserRepository.findById(sess.data.userId);
      if (user) {
        req.user = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
        return next();
      }
    }

    // Fallback to JWT cookie
    const token = (req as any).cookies?.accessToken;
    if (!token) return next({ status: 401, message: 'Unauthorized' });
    const payload: any = jwt.verify(token, env.JWT_SECRET);
    const userId = payload.sub as string;
    const user = await UserRepository.findById(userId);
    if (!user) return next({ status: 401, message: 'Unauthorized' });
    req.user = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
    return next();
  } catch {
    return next({ status: 401, message: 'Unauthorized' });
  }
}

export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const sess = (req as any).session;
    if (sess?.data?.userId) {
      const user = await UserRepository.findById(sess.data.userId);
      if (user) {
        req.user = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
        return next();
      }
    }
    const token = (req as any).cookies?.accessToken;
    if (!token) return next();
    const payload: any = jwt.verify(token, env.JWT_SECRET);
    const user = await UserRepository.findById(payload.sub as string);
    if (user) {
      req.user = { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
    }
  } catch {}
  next();
}
