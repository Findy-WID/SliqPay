import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

prisma.$connect()
  .then(() => {
   
  })
  .catch((error: unknown) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });

export { prisma };
