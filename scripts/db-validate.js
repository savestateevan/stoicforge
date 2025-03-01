// A simple script to validate database connections in production
// Can be executed in the Build & Development settings on Vercel
// Add to Build Command: "node scripts/db-validate.js && next build"

require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function validateDatabase() {
  console.log('\n🔍 PRODUCTION DATABASE VALIDATION');
  console.log('================================');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL is not defined in environment variables!');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL is defined');
  console.log('Database URL format:', process.env.DATABASE_URL.replace(/mysql:\/\/([^:]+):([^@]+)@(.+)/, 'mysql://USERNAME:PASSWORD@$3'));
  
  // Create a new Prisma client for testing
  const prisma = new PrismaClient();
  
  try {
    // Test connection with a simple query
    console.log('\nTesting database connection...');
    
    const startTime = Date.now();
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    const duration = Date.now() - startTime;
    
    console.log(`✅ Database connection successful (took ${duration}ms)`);
    
    // Try to count users if initial connection worked
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible (contains ${userCount} users)`);
    } catch (userError) {
      console.error('❌ Could not access user table:', userError.message);
      // Continue and don't exit with error - app might still work
    }
    
    console.log('\n✅ DATABASE VALIDATION PASSED');
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('\n❌ DATABASE CONNECTION FAILED');
    console.error('Error message:', error.message);
    
    // Try to determine error type
    if (error.message.includes('Access denied')) {
      console.error('\nProbable cause: Authentication error');
      console.error('Solution: Check username/password in DATABASE_URL');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('connect failed')) {
      console.error('\nProbable cause: Network connectivity issue');
      console.error('Solution: Check if database host is reachable from your environment');
    } else if (error.message.includes('database') && error.message.includes('not')) {
      console.error('\nProbable cause: Database does not exist');
      console.error('Solution: Check database name in DATABASE_URL');
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Execute validation
validateDatabase()
  .then(() => {
    console.log('Proceeding with build process...\n');
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error during validation:', err);
    process.exit(1);
  }); 