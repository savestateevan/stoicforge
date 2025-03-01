import { PrismaClient, Prisma } from "@prisma/client"

// eslint-disable-next-line no-var
declare global {
  var cachedPrisma: PrismaClient
}

// Log when the Prisma client is being instantiated
console.log(`Initializing Prisma client (NODE_ENV: ${process.env.NODE_ENV})`);
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not defined in environment variables!");
} else {
  console.log(`Database URL format: ${process.env.DATABASE_URL.replace(/mysql:\/\/([^:]+):([^@]+)@(.+)/, 'mysql://USERNAME:PASSWORD@$3')}`);
}

// Initialize global.cachedPrisma if needed
const globalForPrisma = global as { cachedPrisma?: PrismaClient };

// Configure Prisma client with proper log levels and connection options
// For PlanetScale, configure connection pooling for better performance
const prismaClientOptions: Prisma.PrismaClientOptions = {
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ] as Prisma.LogDefinition[],
  // Configure connection options with explicit types
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

// For production, add connection pooling settings
// This is done by modifying the connection string parameters
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
  try {
    console.log('Configuring production database connection with connection pooling');
    // Parse the existing connection URL
    const url = new URL(process.env.DATABASE_URL);
    
    // Add connection pooling parameters if not present
    // These parameters are specific to PlanetScale + MySQL
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '20');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '30');
    }
    
    // Update the datasource URL with the modified connection string
    prismaClientOptions.datasources = {
      db: {
        url: url.toString(),
      },
    };
    
    console.log('Connection pooling configured with:');
    console.log(`- connection_limit: ${url.searchParams.get('connection_limit')}`);
    console.log(`- pool_timeout: ${url.searchParams.get('pool_timeout')}`);
  } catch (error) {
    console.error('Error configuring connection pooling:', error);
    // Continue with the default connection string
  }
}

export const db = globalForPrisma.cachedPrisma || new PrismaClient(prismaClientOptions);

// Set up query logging for debugging
if (process.env.NODE_ENV === "production") {
  // Using type assertion to fix TypeScript errors with event handlers
  (db as any).$on('query', (e: any) => {
    console.log('Query: ' + e.query);
    console.log('Duration: ' + e.duration + 'ms');
  });
  
  (db as any).$on('error', (e: any) => {
    console.error('Prisma Error:', e.message);
  });
}

// In development, use the same Prisma instance across hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.cachedPrisma = db
}

// Add a connection test function with more detailed diagnostics
export async function testDbConnection() {
  console.log('Testing database connection...');
  
  try {
    // Try parsing connection URL components
    if (process.env.DATABASE_URL) {
      const url = new URL(process.env.DATABASE_URL);
      console.log('Connection details:');
      console.log('- Host:', url.hostname);
      console.log('- Port:', url.port || 'default');
      console.log('- Database:', url.pathname.substring(1));
      console.log('- SSL enabled:', url.searchParams.has('sslaccept') || url.searchParams.has('ssl'));
    }
    
    // Test actual connection
    const startTime = Date.now();
    const result = await db.$queryRaw`SELECT 1+1 as result`;
    const duration = Date.now() - startTime;
    
    console.log(`Database connection successful (took ${duration}ms)`);
    console.log('Query result:', result);
    return true;
  } catch (error: any) {
    console.error('Database connection test failed:');
    if (error.name) console.error('Error name:', error.name);
    if (error.code) console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.meta) {
      console.error('Error metadata:', JSON.stringify(error.meta));
    }
    
    // Try to determine error type
    if (error.message?.includes('Access denied')) {
      console.error('This appears to be an authentication error. Check username/password.');
    } else if (error.message?.includes('connect ETIMEDOUT')) {
      console.error('Connection timed out. Check network connectivity and firewall settings.');
    } else if (error.message?.includes('does not exist')) {
      console.error('Database does not exist. Check database name.');
    }
    
    return false;
  }
}

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prisma = db
}