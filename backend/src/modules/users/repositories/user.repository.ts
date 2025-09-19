import { randomUUID } from 'crypto';
import { User } from '../schemas/user.model.js';
import { getRedis } from '../../../common/utils/redis.js';

function serialize(u: User) {
  return { ...u, createdAt: u.createdAt.toISOString() } as const;
}
function deserialize(raw: any): User {
  return { ...raw, createdAt: new Date(raw.createdAt) } as User;
}

function userKey(id: string) {
  return `user:${id}`;
}
function emailKey(emailLower: string) {
  return `user:email:${emailLower}`;
}

// DEPRECATED: Use UserRepositoryPrisma for persistent user data.
export const UserRepository = {
  async findByEmail(_email: string) { throw new Error('UserRepository (in-memory/redis) is deprecated. Use Prisma.'); },
  async findById(_id: string) { throw new Error('UserRepository (in-memory/redis) is deprecated. Use Prisma.'); },
  async create(_data: any) { throw new Error('UserRepository (in-memory/redis) is deprecated. Use Prisma.'); },
  async updatePassword(_id: string, _passwordHash: string) { throw new Error('UserRepository (in-memory/redis) is deprecated. Use Prisma.'); },
};
