import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository as InMemoryRepo } from '../../users/repositories/user.repository.js';
import { UserRepositoryRedis } from '../../users/repositories/user.redis.repository.js';
import { env } from '../../../config/env.js';

const Repo = (env.REDIS_HOST ? UserRepositoryRedis : InMemoryRepo) as {
  findByEmail: (email: string) => any | Promise<any>;
  findById: (id: string) => any | Promise<any>;
  create: (data: { email: string; firstName: string; lastName: string; passwordHash: string; phone?: string; referralCode?: string }) => any | Promise<any>;
  updatePassword: (id: string, passwordHash: string) => Promise<void>;
};

function sign(userId: string) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: '15m' });
}

export function publicUser(u: any) {
  return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, createdAt: u.createdAt };
}

export async function signup(fname: string, lname: string, email: string, password: string, phone?: string, referralCode?: string) {
  const existing = await Repo.findByEmail(email);
  if (existing) {
    throw { status: 400, message: 'Email already registered' };
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = await Repo.create({ email, firstName: fname, lastName: lname, passwordHash, phone, referralCode });
  const token = sign(user.id);
  return { user: publicUser(user), token };
}

export async function login(email: string, password: string) {
  const user = await Repo.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw { status: 401, message: 'Invalid credentials' };
  }
  const token = sign(user.id);
  return { user: publicUser(user), token };
}

export { Repo };
