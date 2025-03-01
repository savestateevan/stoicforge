import { NextResponse, NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
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