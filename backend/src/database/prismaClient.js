import { PrismaClient } from '@prisma/client';
import { config } from '../config/app.config.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__traDaoPrisma ||
  new PrismaClient({
    log: config.env === 'development' ? ['error', 'warn'] : ['error'],
  });

if (config.env !== 'production') {
  globalForPrisma.__traDaoPrisma = prisma;
}

export const disconnectPrisma = () => prisma.$disconnect();

export default prisma;
