// components/CreditsDisplay.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { StripeCheckoutButton } from '@/components/StripeCheckoutButton'

export function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchCredits = useCallback(async () => {
    setError(null)
    try {
      console.log('Fetching credits...')
      const response = await fetch('/api/credits/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Include credentials to ensure cookies are sent
          credentials: 'include'
        }
      })
      
      console.log('Credits API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch credits:', errorText)
        throw new Error(`Status ${response.status}: ${errorText || 'Failed to fetch credits'}`)
      }
      
      const data = await response.json()
      console.log('Credits fetched successfully:', data)
      setCredits(data.credits)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Error fetching credits:', errorMessage)
      setError(errorMessage)
      
      // Auto-retry up to 3 times if there's an error
      if (retryCount < 3) {
        console.log(`Retrying credits fetch... (attempt ${retryCount + 1}/3)`)
        setRetryCount(prev => prev + 1)
        setTimeout(() => fetchCredits(), 1000) // Retry after 1 second
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [retryCount])

  const handleRefresh = () => {
    setRefreshing(true)
    setRetryCount(0) // Reset retry count on manual refresh
    fetchCredits()
  }

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  return (
    <div className="flex items-center gap-2">
      <div className={`rounded-md px-2.5 py-1.5 text-sm font-medium ${
        error 
          ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200' 
          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200'
      }`}>
        {loading ? (
          <span className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
            Loading...
          </span>
        ) : error ? (
          <span className="flex items-center gap-1 cursor-help" title={error}>
            <AlertCircle className="h-4 w-4" />
            Error
          </span>
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