// components/CreditsDisplay.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'

export function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchCredits = useCallback(async () => {
    setError(null)
    try {
      console.log('Fetching credits...', new Date().toISOString())
      const response = await fetch('/api/credits/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add cache busting parameter
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
        // Ensure we're not using cached data 
        cache: 'no-store'
      })
      
      console.log('Credits API response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to fetch credits:', errorText)
        throw new Error(`Status ${response.status}: ${errorText || 'Failed to fetch credits'}`)
      }
      
      const data = await response.json()
      console.log('Credits fetched successfully:', data)
      
      // Check if credits changed from previous value
      if (data.credits !== credits) {
        console.log(`Credits changed from ${credits} to ${data.credits}`)
      }
      
      setCredits(data.credits)
      setLastUpdated(new Date())
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
  }, [retryCount, credits])

  const handleRefresh = () => {
    setRefreshing(true)
    setRetryCount(0) // Reset retry count on manual refresh
    fetchCredits()
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchCredits()
  }, []) // Intentionally removing fetchCredits from dependency array to prevent loops

  // Poll for credits periodically in production
  useEffect(() => {
    // Only set up polling if successfully loaded initially
    if (credits !== null) {
      const pollInterval = setInterval(() => {
        console.log('Polling for credits update...')
        fetchCredits()
      }, 30000) // Check every 30 seconds
      
      return () => clearInterval(pollInterval)
    }
  }, [credits]) // Poll when credits are initially loaded

  // Check for URL success parameter
  useEffect(() => {
    // Check if we're on the successful checkout page
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('success') === 'true' || urlParams.get('session_id')) {
        console.log('Detected successful checkout, refreshing credits...')
        // Force an immediate refresh after successful payment
        handleRefresh()
        
        // Set up more frequent polling temporarily
        const successPollInterval = setInterval(() => {
          console.log('Post-success polling for credits update...')
          fetchCredits()
        }, 5000) // Check every 5 seconds after success
        
        // Clear the more frequent polling after 60 seconds
        setTimeout(() => {
          clearInterval(successPollInterval)
        }, 60000)
      }
    }
  }, []) // Run once on mount

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
        title={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        <span className="sr-only">Refresh credits</span>
      </Button>
    </div>
  )
}