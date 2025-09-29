import { prisma } from '../../../lib/prisma.js';

export const UserRepositoryPrisma = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  async create(data: { email: string; firstName?: string; lastName?: string; passwordHash: string; phone?: string | null; referralCode?: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone || "",
        password_hash: data.passwordHash,
        first_name: data.firstName,
        last_name: data.lastName,
        referral_code: data.referralCode,
      },
    });
  },
  async updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { password_hash: passwordHash },
    });
  },
};
