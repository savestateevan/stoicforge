import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force dynamic for webhook debugging
export const dynamic = 'force-dynamic';

// This endpoint is for diagnosing Stripe webhook issues in production
export async function GET(req: Request) {
  try {
    // 1. Check environment variables
    const envCheck = {
      webhookSecretDefined: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length,
      stripeSecretDefined: !!process.env.STRIPE_SECRET_KEY,
      stripeMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST' : 'LIVE',
      stripePublishableDefined: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripePublishableMode: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') ? 'TEST' : 'LIVE',
      nodeEnv: process.env.NODE_ENV,
      nextEnv: process.env.NEXT_PUBLIC_ENVIRONMENT
    };

    // 2. Test database connection
    let dbStatus = 'unknown';
    let userCount = 0;
    let subCount = 0;
    
    try {
      // Check if we can query users
      const users = await db.user.count();
      userCount = users;
      
      // Check if we can query subscriptions
      const subs = await db.userSubscription.count();
      subCount = subs;
      
      dbStatus = 'connected';
    } catch (dbError) {
      dbStatus = `error: ${dbError instanceof Error ? dbError.message : 'Unknown DB error'}`;
    }

    // 3. Return diagnostic information
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'ok',
      environment: envCheck,
      database: {
        status: dbStatus,
        userCount,
        subscriptionCount: subCount
      },
      message: 'This endpoint is for diagnosing Stripe webhook issues'
    });
  } catch (error) {
    console.error('Error in webhook debug endpoint:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 