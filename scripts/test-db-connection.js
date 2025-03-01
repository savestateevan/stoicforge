// Test database connection
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

console.log('Testing database connection...');
console.log('DATABASE_URL format:', process.env.DATABASE_URL.replace(/mysql:\/\/([^:]+):([^@]+)@(.+)/, 'mysql://USERNAME:PASSWORD@$3'));

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Attempting to connect to database...');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    console.log('Connection successful!', result);
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`Database contains ${userCount} users`);
    
    return true;
  } catch (error) {
    console.error('Database connection failed:');
    console.error(error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('✅ Database connection test passed');
      process.exit(0);
    } else {
      console.log('❌ Database connection test failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 