'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

export function Credits() {
  const { user, isLoaded } = useUser()
  const [credits, setCredits] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return
      
      try {
        const response = await fetch('/api/credits/balance')
        if (!response.ok) {
          throw new Error('Failed to fetch credits')
        }
        const data = await response.json()
        setCredits(data.credits)
      } catch (error) {
        console.error('Error fetching credits:', error)
        setError('Failed to load credits')
      }
    }

    if (user) {
      fetchCredits()
    }
  }, [user])

  if (!isLoaded) {
    return <span className="animate-pulse">Loading...</span>
  }

  if (error) {
    return <span className="text-red-500">{error}</span>
  }

  if (!user) {
    return null
  }

  return (
    <span className="font-medium">
      {credits !== null ? `${credits} credits remaining` : 'Loading credits...'}
    </span>
  )
} 