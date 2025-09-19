import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

prisma.$connect()
  .then(() => {
    console.log('Successfully connected to database');
  })
  .catch((e) => {
    console.error('Failed to connect to database:', e);
    process.exit(1);
  });

export { prisma };
