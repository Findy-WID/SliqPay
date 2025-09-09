import { randomUUID } from 'crypto';
import { User } from '../schemas/user.model.js';

const users: User[] = [];

export const UserRepository = {
  findByEmail(email: string) {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },
  findById(id: string) {
    return users.find(u => u.id === id) || null;
  },
  create(data: { email: string; firstName: string; lastName: string; passwordHash: string }): User {
    const user: User = { id: randomUUID(), createdAt: new Date(), ...data };
    users.push(user);
    return user;
  }
};
