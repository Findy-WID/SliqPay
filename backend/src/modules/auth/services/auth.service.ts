import { UserRepositoryPrisma } from '../../users/repositories/user.prisma.repository.js';

const Repo = UserRepositoryPrisma;

export function publicUser(u: any) {
  return { id: u.id, email: u.email, firstName: u.first_name, lastName: u.last_name, createdAt: u.created_at };
}

// Signup and login functions removed - authentication logic disabled

export { Repo };
