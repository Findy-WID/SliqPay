// filepath: /home/kaanyi/VS Projects/SliqPay/backend/src/modules/users/repositories/user.redis.repository.ts
import { randomUUID } from 'crypto';
import { getRedis } from '../../../common/utils/redis.js';
import type { User } from '../schemas/user.model.js';

const USER_KEY = (id: string) => `user:${id}`;
const EMAIL_KEY = (emailLower: string) => `user:byEmail:${emailLower}`;

function serialize(user: User): string {
  return JSON.stringify({ ...user, createdAt: user.createdAt.toISOString() });
}

function deserialize(raw: string | null): User | null {
  if (!raw) return null;
  const obj = JSON.parse(raw);
  return { ...obj, createdAt: new Date(obj.createdAt) } as User;
}

// DEPRECATED: Use UserRepositoryPrisma for persistent user data.
export const UserRepositoryRedis = {
  async findByEmail(_email: string) { throw new Error('UserRepositoryRedis is deprecated. Use Prisma.'); },
  async findById(_id: string) { throw new Error('UserRepositoryRedis is deprecated. Use Prisma.'); },
  async create(_data: any) { throw new Error('UserRepositoryRedis is deprecated. Use Prisma.'); },
  async updatePassword(_id: string, _passwordHash: string) { throw new Error('UserRepositoryRedis is deprecated. Use Prisma.'); },
};
