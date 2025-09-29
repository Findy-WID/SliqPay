import { Request, Response } from 'express';
import { login, signup, publicUser, Repo } from '../services/auth.service.js';
import { env } from '../../../config/env.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.js';
import { createSession, setSessionCookie, clearSessionCookie, destroySession } from '../../../common/session/sessionStore.js';
import { sendMail } from '../../../common/utils/email.js';
import { createResetToken, consumeResetToken } from '../services/resetToken.service.js';
import { UserRepositoryPrisma } from '../../users/repositories/user.prisma.repository.js';
import bcrypt from 'bcryptjs';

export const handleSignup = async (req: Request, res: Response) => {
  const { fname, lname, email, password, phone, refCode } = (req as any).body;
  const { user, token } = await signup(fname, lname, email, password, phone, refCode);
  const sess = await createSession({ userId: user.id });
  setSessionCookie(res, sess.id);
  res.cookie('accessToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000
  }).status(201).json({ user });
};

export const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = (req as any).body;
    const { user, token } = await login(email, password);
    const sess = await createSession({ userId: user.id });
    setSessionCookie(res, sess.id);
    res.cookie('accessToken', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000
    }).json({ user });
  } catch (error: any) {
    const statusCode = error.status || 400;
    res.status(statusCode).json({ error: { message: error.message } });
  }
};

export const handleLogout = async (req: Request, res: Response) => {
  try {
    const current = (req as any).session;
    if (current?.id) {
      await destroySession(current.id);
    }
  } catch {}
  clearSessionCookie(res);
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

export const handleForgot = async (_req: Request, res: Response) => {
  // In a real implementation, enqueue email with reset token. Here we silently accept.
  return res.json({ ok: true });
};

export const handleReset = async (_req: Request, res: Response) => {
  // Placeholder for password reset confirmation
  return res.json({ ok: true });
};

export const handleResetRequest = async (req: Request, res: Response) => {
  const { email } = (req as any).body;
  const user = await UserRepositoryPrisma.findByEmail(email);
  if (!user) return res.json({ ok: true }); // Do not reveal user existence
  const token = await createResetToken(user.id);
  const base = env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${base}/auth/resetpassword?token=${token}`;
  await sendMail({
    to: user.email,
    subject: 'Reset your SliqPay password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p>`
  });
  return res.json({ ok: true });
};

export const handleResetPassword = async (req: Request, res: Response) => {
  const { token, password } = (req as any).body;
  const userId = await consumeResetToken(token);
  if (!userId) {
    return res.status(400).json({ error: { code: 'INVALID_OR_EXPIRED', message: 'Invalid or expired reset token.' } });
  }
  const hash = bcrypt.hashSync(password, 10);
  await Repo.updatePassword(userId, hash);
  return res.json({ ok: true });
};
