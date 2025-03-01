import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('[credits/route] Authenticating user...');
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      console.warn('[credits/route] Unauthorized request - no userId found');
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    console.log(`[credits/route] Fetching credits for user ${userId.substring(0, 8)}...`);
    
    // Log database connection status
    try {
      console.log('[credits/route] Testing database connection...');
      const testResult = await db.$queryRaw`SELECT 1+1 as result`;
      console.log(`[credits/route] Database connection test successful: ${JSON.stringify(testResult)}`);
    } catch (dbTestError: any) {
      console.error('[credits/route] Database connection test failed:', dbTestError.message);
      // Continue with the attempt to find the user despite the test failing
    }
    
    // Look up the user in the database
    try {
      console.log('[credits/route] Looking up user in database...');
      const user = await db.user.findUnique({
        where: { id: userId }
      });
      
      // If user doesn't exist, create them with 0 credits
      if (!user) {
        console.log('[credits/route] User not found, creating new user record...');
        try {
          const newUser = await db.user.create({
            data: {
              id: userId,
              email: userId, // Adding required email field
              credits: 0
            }
          });
          
          console.log('[credits/route] New user created successfully');
          return NextResponse.json({ credits: newUser.credits });
        } catch (createError: any) {
          console.error('[credits/route] Error creating user:', createError.message);
          if (createError.meta) {
            console.error('[credits/route] Error metadata:', JSON.stringify(createError.meta));
          }
          return new NextResponse(`Database Error: ${createError.message}`, { status: 500 });
        }
      }
      
      console.log(`[credits/route] User found, returning ${user.credits} credits`);
      return NextResponse.json({ credits: user.credits });
    } catch (dbError: any) {
      console.error('[credits/route] Database error:', dbError.message);
      if (dbError.meta) {
        console.error('[credits/route] Error metadata:', JSON.stringify(dbError.meta));
      }
      return new NextResponse(`Database Error: ${dbError.message}`, { status: 500 });
    }
  } catch (error: any) {
    console.error('[credits/route] Unhandled error:', error);
    console.error('[credits/route] Error stack:', error.stack);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
} 