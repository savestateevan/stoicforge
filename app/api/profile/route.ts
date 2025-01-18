import { auth } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { addTokens, useTokens } from "@/lib/tokens";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const profile = await db.profile.upsert({
      where: {
        userId: userId,
      },
      create: {
        userId: userId,
        name: body.name,
        bio: body.bio,
      },
      update: {
        name: body.name,
        bio: body.bio,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.log("[PROFILE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 