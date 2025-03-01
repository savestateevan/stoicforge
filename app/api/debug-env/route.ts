import { NextResponse } from 'next/server';
import { db, testDbConnection } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// This endpoint will only be available to authenticated users
// and will only show limited information for security
export async function GET() {
  const { userId } = await auth();
  
  // Only allow authenticated users
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Test database connection
    const dbConnected = await testDbConnection();
    
    // Collect environment information without revealing secrets
    const envInfo: {
      NODE_ENV: string | undefined;
      DATABASE_CONNECTION: string;
      DATABASE_URL_FORMAT: string;
      NEXT_PUBLIC_URL: string | undefined;
      NEXT_PUBLIC_APP_URL: string | undefined;
      STRIPE_CONFIG_PRESENT: boolean;
      CLERK_CONFIG_PRESENT: boolean;
      ENVIRONMENT_VARIABLES: string[];
      DATABASE_VERSION?: string;
    } = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_CONNECTION: dbConnected ? 'working' : 'failed',
      DATABASE_URL_FORMAT: process.env.DATABASE_URL 
        ? process.env.DATABASE_URL.replace(/mysql:\/\/([^:]+):([^@]+)@(.+)/, 'mysql://USERNAME:PASSWORD@$3')
        : 'not set',
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      STRIPE_CONFIG_PRESENT: !!process.env.STRIPE_SECRET_KEY,
      CLERK_CONFIG_PRESENT: !!process.env.CLERK_SECRET_KEY,
      ENVIRONMENT_VARIABLES: Object.keys(process.env)
        .filter(key => !key.includes('KEY') && !key.includes('SECRET') && !key.includes('PASSWORD') && !key.includes('TOKEN'))
        .sort(),
    };
    
    // Include database version if connected
    if (dbConnected) {
      try {
        const versionResult: any = await db.$queryRaw`SELECT VERSION() as version`;
        envInfo.DATABASE_VERSION = versionResult[0].version;
      } catch (e) {
        envInfo.DATABASE_VERSION = 'Error fetching version';
      }
    }
    
    return NextResponse.json(envInfo);
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Error querying environment',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 