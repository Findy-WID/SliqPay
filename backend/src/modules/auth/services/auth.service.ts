import { UserRepositoryPrisma } from '../../users/repositories/user.prisma.repository.js';
import { AccountRepositoryPrisma } from '../../users/repositories/account.prisma.repository.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { env } from '../../../config/env.js';

const Repo = UserRepositoryPrisma;

function sign(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '15m' });
}

export function publicUser(u: any) {
  return { id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, createdAt: u.created_at };
}

export async function signup(fname: string, lname: string, email: string, password: string, phone?: string, referralCode?: string) {
  const existing = await Repo.findByEmail(email);
  if (existing) {
    throw { status: 400, message: 'Email already registered' };
  }
  // Phone is optional - generate a unique placeholder if not provided
  // TODO: Add phone collection to signup flow and make it required
  const phoneToUse = phone || `+000${randomUUID().replace(/-/g, '').slice(0, 11)}`;
  
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await Repo.create({ email, firstName: fname, lastName: lname, passwordHash, phone: phoneToUse, referralCode });
  // Create a default NGN account with 25,000 starting balance
  try {
    await AccountRepositoryPrisma.create({ userId: user.id, balance: 25000, currency: 'NGN' });
  } catch (e) {
    // Non-fatal: account can be created later, but log in real system
  }
  const token = sign(user.id);
  return { user: publicUser(user), token };
}

export async function login(email: string, password: string) {
  const user = await Repo.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    throw { status: 401, message: 'Invalid credentials' };
  }
  const token = sign(user.id);
  return { user: publicUser(user), token };
}

export { Repo };
