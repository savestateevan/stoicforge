// components/CreditsDisplay.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'

export function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits/balance')
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits')
      }
      
      const data = await response.json()
      setCredits(data.credits)
    } catch (error) {
      console.error('Error fetching credits:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchCredits()
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  return (
    <div className="flex items-center gap-2">
      <div className="rounded-md bg-amber-100 dark:bg-amber-950 px-2.5 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>Credits: {credits ?? 0}</>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleRefresh} 
        disabled={refreshing}
        className="h-8 w-8"
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        <span className="sr-only">Refresh credits</span>
      </Button>
    </div>
  )
}