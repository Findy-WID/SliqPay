import { Request, Response } from 'express';
import { login, signup, publicUser } from '../services/auth.service.js';
import { env } from '../../../config/env.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.js';

export const handleSignup = (req: Request, res: Response) => {
  const { fname, lname, email, password } = (req as any).body;
  const { user, token } = signup(fname, lname, email, password);
  res.cookie('accessToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000
  }).status(201).json({ user });
};

export const handleLogin = (req: Request, res: Response) => {
  const { email, password } = (req as any).body;
  const { user, token } = login(email, password);
  res.cookie('accessToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000
  }).json({ user });
};

export const handleLogout = (_req: Request, res: Response) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production'
  }).status(204).send();
};

export const handleMe = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ user: publicUser(req.user) });
};
