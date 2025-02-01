import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import ProfileClient from './profile-client'
import { redirect } from 'next/navigation'


export default async function ProfilePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: userId
    },
    select: {
      id: true,
      status: true,
      imageUrl: true,
      email: true,
      name: true,
      bio: true,
      isPublic: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      twitch: true,
      youtube: true,
      instagram: true,
      twitter: true,
    }
  })

  return (
    <ProfileClient 
      initialProfile={profile} 
      userId={userId}
    />
  )
}
