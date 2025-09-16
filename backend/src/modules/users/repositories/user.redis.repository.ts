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

export const UserRepositoryRedis = {
  async findById(id: string): Promise<User | null> {
    const c = getRedis();
    const raw = await c.get(USER_KEY(id));
    return deserialize(raw);
  },

  async findByEmail(email: string): Promise<User | null> {
    const c = getRedis();
    const lower = email.toLowerCase();
    const id = await c.get(EMAIL_KEY(lower));
    if (!id) return null;
    return this.findById(id);
  },

  async create(data: { email: string; firstName: string; lastName: string; passwordHash: string }): Promise<User> {
    const c = getRedis();
    const id = randomUUID();
    const user: User = { id, createdAt: new Date(), ...data };
    const lower = data.email.toLowerCase();
    await c.multi()
      .set(USER_KEY(id), serialize(user))
      .set(EMAIL_KEY(lower), id)
      .exec();
    return user;
  }
};
