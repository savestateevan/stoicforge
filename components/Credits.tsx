'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function Credits() {
  const { user, isLoaded } = useUser()
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return
      
      try {
        const response = await fetch('/api/credits/balance')
        const data = await response.json()
        setCredits(data.credits)
      } catch (error) {
        console.error('Error fetching credits:', error)
      }
    }

    fetchCredits()
  }, [user])

  if (!isLoaded || credits === null) {
    return <span>Loading credits...</span>
  }

  if (!user) {
    return null
  }

  return (
    <span className="font-medium">
      {credits} credits remaining
    </span>
  )
} 