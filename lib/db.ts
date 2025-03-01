import { PrismaClient } from "@prisma/client"

// eslint-disable-next-line no-var
declare global {
  var cachedPrisma: PrismaClient
}

// Log when the Prisma client is being instantiated
console.log(`Initializing Prisma client (NODE_ENV: ${process.env.NODE_ENV})`);
console.log(`Database URL format: ${process.env.DATABASE_URL?.replace(/mysql:\/\/([^:]+):([^@]+)@(.+)/, 'mysql://USERNAME:PASSWORD@$3') || 'Not set'}`);

// Initialize global.cachedPrisma if needed
const globalForPrisma = global as { cachedPrisma?: PrismaClient };
export const db = globalForPrisma.cachedPrisma || new PrismaClient({
  log: ['error', 'warn'],
});

// In development, use the same Prisma instance across hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.cachedPrisma = db
}

// Add a connection test function
export async function testDbConnection() {
  try {
    const result = await db.$queryRaw`SELECT 1+1 as result`;
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prisma = db
}