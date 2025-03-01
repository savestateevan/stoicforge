import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Look up the user in the database
    const user = await db.user.findUnique({
      where: { id: userId }
    });
    
    // If user doesn't exist, create them with 0 credits
    if (!user) {
      const newUser = await db.user.create({
        data: {
          id: userId,
          email: userId, // Adding required email field
          credits: 0
        }
      });
      
      return NextResponse.json({ credits: newUser.credits });
    }
    
    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 