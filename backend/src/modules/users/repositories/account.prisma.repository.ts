import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const AccountRepositoryPrisma = {
  async findById(id: string) {
    return prisma.account.findUnique({ where: { id } });
  },
  async findByUserId(userId: string) {
    return prisma.account.findMany({ where: { user_id: userId } });
  },
  async create(data: { userId: string; balance?: number; currency?: string }) {
    return prisma.account.create({
      data: {
        user_id: data.userId,
        balance: data.balance ?? 0,
        currency: data.currency ?? 'NGN',
      },
    });
  },
  async updateBalance(id: string, balance: number) {
    return prisma.account.update({ where: { id }, data: { balance } });
  },
};
