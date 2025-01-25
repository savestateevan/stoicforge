import { getAuth } from "@clerk/nextjs/server"
import { NextResponse, NextRequest } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    return NextResponse.json({ credits: user.credits })
  } catch (error) {
    console.error('[CREDITS_GET]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 