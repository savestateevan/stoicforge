import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const chatHistory = await db.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50 // Limit to last 50 messages
    })

    return NextResponse.json({ messages: chatHistory })
  } catch (error) {
    console.error('[CHAT_HISTORY]', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 