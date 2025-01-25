import { auth } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { name, bio, isPublic } = body

    const profile = await db.profile.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId: userId,
        name,
        bio,
        isPublic,
      },
      update: {
        name,
        bio,
        isPublic,
      },
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('[PROFILE_POST]', error)
    return new NextResponse("Internal Error", { status: 500 })
  }
} 