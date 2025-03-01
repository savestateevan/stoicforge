import { auth } from "@clerk/nextjs/server"
import { NextResponse, NextRequest } from "next/server"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    console.log('[CREDITS_GET] Request received')
    
    const authResult = await auth()
    console.log('[CREDITS_GET] Auth result:', JSON.stringify({
      userId: authResult.userId ? 'present' : 'missing',
      sessionId: authResult.sessionId ? 'present' : 'missing'
    }))
    
    const { userId } = authResult
    
    if (!userId) {
      console.error('[CREDITS_GET] Unauthorized: No userId from auth')
      return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
      console.log(`[CREDITS_GET] Looking up user: ${userId}`)
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      })

      if (!user) {
        console.error(`[CREDITS_GET] User not found in database: ${userId}`)
        
        // Auto-create the user if they don't exist
        console.log(`[CREDITS_GET] Creating new user: ${userId}`)
        const newUser = await db.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`, // Add required email field
            credits: 1
          }
        })
        console.log(`[CREDITS_GET] New user created with 0 credits`)
        
        return NextResponse.json({ credits: 0 })
      }

      console.log(`[CREDITS_GET] User found, returning credits: ${user.credits}`)
      return NextResponse.json({ credits: user.credits })
    } catch (dbError) {
      console.error('[CREDITS_GET] Database error:', dbError)
      return new NextResponse(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`, { status: 500 })
    }
  } catch (error) {
    console.error('[CREDITS_GET] Unexpected error:', error)
    return new NextResponse(`Internal error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 })
  }
}