import { db } from "@/lib/db";

export async function addCredits(userId: string, amount: number) {
  const profile = await db.profile.upsert({
    where: {
      userId: userId,
    },
    create: {
      userId: userId,
      credits: amount,
      name: `user_${userId.slice(0, 8)}`,
    },
    update: {
      credits: {
        increment: amount,
      },
    },
  });

  return profile;
}

export async function useCredits(userId: string, amount: number) {
  const profile = await db.profile.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!profile || profile.credits < amount) {
    throw new Error("Insufficient credits");
  }

  return await db.profile.update({
    where: {
      userId: userId,
    },
    data: {
      credits: {
        decrement: amount,
      },
    },
  });
} 