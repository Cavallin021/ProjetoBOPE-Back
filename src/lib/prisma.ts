import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function testDatabaseConnection(): Promise<void> {
  await prisma.$connect();
  await prisma.$queryRaw`SELECT 1`;
}
