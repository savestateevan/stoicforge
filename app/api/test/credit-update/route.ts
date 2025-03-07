import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

// For testing only - should be disabled in production
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Authentication check
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ TEST CREDITS: Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract credits from request
    const { creditsToAdd = 100 } = await req.json();
    
    if (typeof creditsToAdd !== 'number' || creditsToAdd <= 0) {
      return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 });
    }
    
    console.log(`✅ TEST CREDITS: Adding ${creditsToAdd} credits to user ${userId}`);
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      console.log(`❌ TEST CREDITS: User ${userId} not found`);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    console.log(`✅ TEST CREDITS: Found user ${userId}, current credits: ${existingUser.credits}`);
    
    // Update user credits directly
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        credits: { increment: creditsToAdd }
      }
    });
    
    console.log(`✅ TEST CREDITS: Updated user credits from ${existingUser.credits} to ${updatedUser.credits}`);
    
    return NextResponse.json({
      success: true,
      message: `Added ${creditsToAdd} credits`,
      previousCredits: existingUser.credits,
      newCredits: updatedUser.credits,
      userId
    });
  } catch (error) {
    console.error('❌ TEST CREDITS ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 