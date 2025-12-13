import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL environment variable is not set - database features will be disabled');
}

let prisma: PrismaClient;

if (connectionString) {
  const pool = new Pool({ 
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
  });

  const adapter = new PrismaPg(pool);

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
} else {
  // Fallback: Mock Prisma Client wenn keine DATABASE_URL gesetzt ist
  // Dies verhindert Fehler, aber Datenbankoperationen werden fehlschlagen
  prisma = globalForPrisma.prisma ?? ({
    contactRequest: {
      create: async () => {
        throw new Error('DATABASE_URL is not configured');
      },
    },
  } as unknown as PrismaClient);
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };

