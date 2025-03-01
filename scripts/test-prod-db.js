// Test production database connection
// Usage: NODE_ENV=production DATABASE_URL=your_production_url node scripts/test-prod-db.js
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

console.log('PRODUCTION DATABASE CONNECTION TEST');
console.log('===================================');
console.log('Environment:', process.env.NODE_ENV);

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not defined!');
  process.exit(1);
}

console.log('Database URL format:', process.env.DATABASE_URL.replace(/mysql:\/\/([^:]+):([^@]+)@(.+)/, 'mysql://USERNAME:PASSWORD@$3'));

// Parse connection URL for diagnostics
try {
  const url = new URL(process.env.DATABASE_URL);
  console.log('Connection components:');
  console.log('- Protocol:', url.protocol);
  console.log('- Host:', url.hostname);
  console.log('- Port:', url.port || 'default');
  console.log('- Username:', url.username ? 'Specified' : 'Not specified');
  console.log('- Password:', url.password ? 'Specified' : 'Not specified');
  console.log('- Database:', url.pathname.substring(1));
  console.log('- SSL params:', url.search);
} catch (error) {
  console.error('ERROR: Invalid DATABASE_URL format!', error.message);
  process.exit(1);
}

async function testConnection() {
  console.log('\nAttempting database connection...');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn', 'info'],
  });
  
  try {
    // First try a simple query
    console.log('Running test query...');
    const startTime = Date.now();
    const result = await prisma.$queryRaw`SELECT 1+1 as result`;
    const duration = Date.now() - startTime;
    
    console.log(`✅ Database connection successful (took ${duration}ms)`);
    console.log('Query result:', result);
    
    // Try to count users if initial connection worked
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ User table accessible - contains ${userCount} users`);
    } catch (userError) {
      console.error('❌ Could not access user table:', userError.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ DATABASE CONNECTION FAILED');
    console.error('Error name:', error.name);
    if (error.code) console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.meta) {
      console.error('Error metadata:', JSON.stringify(error.meta));
    }
    
    // Provide specific troubleshooting guidance
    if (error.message.includes('Access denied')) {
      console.error('\nTROUBLESHOOTING: This appears to be an authentication error.');
      console.error('- Check if username/password is correct');
      console.error('- Verify that the database user has proper permissions');
      console.error('- For PlanetScale, ensure your access credentials are valid and not expired');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('connect failed')) {
      console.error('\nTROUBLESHOOTING: This appears to be a network connectivity issue.');
      console.error('- Check if the database host is reachable from your environment');
      console.error('- Verify firewall settings allow outbound connections to the database port');
      console.error('- For PlanetScale, check if your IP is allowed in the network settings');
    } else if (error.message.includes('does not exist')) {
      console.error('\nTROUBLESHOOTING: Database does not exist.');
      console.error('- Check database name in connection string');
      console.error('- Verify the database has been created in your PlanetScale dashboard');
    } else if (error.message.includes('SSL')) {
      console.error('\nTROUBLESHOOTING: SSL connection issue.');
      console.error('- Try modifying the SSL parameters in your connection string');
      console.error('- For PlanetScale, try using ?sslaccept=strict');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ PRODUCTION DATABASE CONNECTION TEST PASSED');
      process.exit(0);
    } else {
      console.log('\n❌ PRODUCTION DATABASE CONNECTION TEST FAILED');
      console.log('\nFor PlanetScale troubleshooting:');
      console.log('1. Log in to PlanetScale dashboard');
      console.log('2. Generate fresh production credentials');
      console.log('3. Update your environment variables with the new credentials');
      console.log('4. Run this test again with the new credentials');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 