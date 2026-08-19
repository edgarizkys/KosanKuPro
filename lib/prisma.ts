import { PrismaClient } from '@prisma/client';

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('connect_timeout')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connect_timeout=2&pool_timeout=2&socket_timeout=3';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Resilient Circuit Breaker for remote database connectivity
let isDbDown = false;
let lastDbCheck = 0;

export async function safeDbQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  timeoutMs = 1200
): Promise<T> {
  const now = Date.now();
  if (isDbDown && now - lastDbCheck < 20000) {
    return fallback;
  }

  try {
    const timeoutPromise = new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('DB_QUERY_TIMEOUT')), timeoutMs)
    );
    const result = await Promise.race([queryFn(), timeoutPromise]);
    isDbDown = false;
    return result;
  } catch (err: any) {
    isDbDown = true;
    lastDbCheck = now;
    return fallback;
  }
}
