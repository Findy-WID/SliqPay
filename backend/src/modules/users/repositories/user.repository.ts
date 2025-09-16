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

export const UserRepository = {
  async findByEmail(email: string): Promise<User | null> {
    const c = getRedis();
    const emailLower = email.toLowerCase();
    const id = await c.get(emailKey(emailLower));
    if (!id) return null;
    const raw = await c.get(userKey(id));
    return raw ? deserialize(JSON.parse(raw)) : null;
  },
  async findById(id: string): Promise<User | null> {
    const c = getRedis();
    const raw = await c.get(userKey(id));
    return raw ? deserialize(JSON.parse(raw)) : null;
  },
  async create(data: { email: string; firstName: string; lastName: string; passwordHash: string }): Promise<User> {
    const c = getRedis();
    const emailLower = data.email.toLowerCase();
    const existing = await c.get(emailKey(emailLower));
    if (existing) {
      throw { status: 400, message: 'Email already registered' };
    }
    const user: User = { id: randomUUID(), createdAt: new Date(), ...data };
    const id = user.id;
    // persist user and index by email
    await c.set(userKey(id), JSON.stringify(serialize(user)));
    await c.set(emailKey(emailLower), id);
    return user;
  }
};
