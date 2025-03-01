import { auth } from "@clerk/nextjs/server"
import { NextResponse, NextRequest } from "next/server"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      })

      if (!user) {
        console.error(`[CREDITS_GET] User not found: ${userId}`)
        return new NextResponse("User not found", { status: 404 })
      }

      return NextResponse.json({ credits: user.credits })
    } catch (dbError) {
      console.error('[CREDITS_GET] Database error:', dbError)
      return new NextResponse("Database error", { status: 500 })
    }
  } catch (error) {
    console.error('[CREDITS_GET] Unexpected error:', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}