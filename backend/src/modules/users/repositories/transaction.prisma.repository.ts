import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const TransactionRepositoryPrisma = {
  async findById(id: string) {
    return prisma.transaction.findUnique({ where: { id } });
  },
  async findByAccountId(accountId: string) {
    return prisma.transaction.findMany({ where: { account_id: accountId }, orderBy: { created_at: 'desc' } });
  },
  async create(data: { accountId: string; amount: number; type: string; description?: string }) {
    return prisma.transaction.create({
      data: {
        account_id: data.accountId,
        amount: data.amount,
        type: data.type,
        description: data.description,
      },
    });
  },
};
