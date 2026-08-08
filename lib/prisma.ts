import { createClient } from '@libsql/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = (createClient as any)({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' });
  const adapter = new PrismaLibSql(client);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
