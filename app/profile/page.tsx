import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import ProfileClient from './profile-client'
import { redirect } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

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
      name: true,
      bio: true,
      isPublic: true,
      userId: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return (
    <ProfileClient 
      initialProfile={profile} 
      userId={userId}
    />
  )
}
