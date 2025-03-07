'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, RefreshCw, CheckCircle } from 'lucide-react'

export function CreditVerifier() {
  const [initialCredits, setInitialCredits] = useState<number | null>(null)
  const [currentCredits, setCurrentCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkCount, setCheckCount] = useState(0)
  const [creditsUpdated, setCreditsUpdated] = useState(false)

  const fetchCredits = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/credits/balance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
        },
        cache: 'no-store'
      })
      
      if (!response.ok) throw new Error('Failed to fetch credits')
      
      const data = await response.json()
      console.log(`[Credit Check] Fetched credits: ${data.credits}`)
      
      // First fetch - set both values
      if (initialCredits === null) {
        setInitialCredits(data.credits)
      }
      
      setCurrentCredits(data.credits)
      
      // Check if credits have increased
      if (initialCredits !== null && data.credits > initialCredits) {
        setCreditsUpdated(true)
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheck = () => {
    setCheckCount(prev => prev + 1)
    fetchCredits()
  }

  // Initial fetch
  useEffect(() => {
    fetchCredits()
    
    // Set up polling
    const interval = setInterval(() => {
      console.log('[Credit Check] Polling for credit updates...')
      setCheckCount(prev => prev + 1)
      fetchCredits()
      
      // Stop polling after 10 checks or if credits were updated
      if (checkCount >= 10 || creditsUpdated) {
        clearInterval(interval)
      }
    }, 5000) // Check every 5 seconds
    
    return () => clearInterval(interval)
  }, [])

  // Add a debugging section with more detailed information
  useEffect(() => {
    // Add webhook debug info polling if credits don't update
    if (checkCount >= 5 && !creditsUpdated) {
      console.log('[Credit Check] Starting webhook debug check...')
      
      // Fetch webhook debug info
      fetch('/api/webhooks/stripe/debug')
        .then(response => response.json())
        .then(data => {
          console.log('[Credit Check] Webhook debug info:', data)
        })
        .catch(error => {
          console.error('[Credit Check] Error fetching webhook debug info:', error)
        })
    }
  }, [checkCount, creditsUpdated])

  // Add a manual trigger for updating credits
  const handleForceCredit = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/test/credit-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ creditsToAdd: 100 }),
      })
      
      if (!response.ok) throw new Error('Failed to force credit update')
      
      const data = await response.json()
      console.log('[Credit Check] Forced credit update:', data)
      
      // Refresh credits after force update
      fetchCredits()
    } catch (error) {
      console.error('[Credit Check] Error forcing credit update:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-4 sm:mt-8 w-full max-w-md shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg flex items-center">
          <span>Credit Update Verification</span>
          {creditsUpdated && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-0.5 rounded-full">
              Complete
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-gray-500 dark:text-gray-400">Initial Credits:</div>
              <div className="font-medium text-right">{initialCredits}</div>
              
              <div className="text-gray-500 dark:text-gray-400">Current Credits:</div>
              <div className="font-medium text-right">{currentCredits}</div>
              
              <div className="text-gray-500 dark:text-gray-400">Status:</div>
              <div className="font-medium text-right">
                {creditsUpdated ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center justify-end">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Updated
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 animate-pulse">
                    Pending...
                  </span>
                )}
              </div>
              
              <div className="text-gray-500 dark:text-gray-400">Checks:</div>
              <div className="font-medium text-right">{checkCount}</div>
            </div>
            
            {!creditsUpdated && checkCount >= 10 && (
              <div className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 pt-1 border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                Credits may take a few minutes to update. Please check your credits on the main page.
              </div>
            )}
            
            {!creditsUpdated && checkCount >= 5 && (
              <Button 
                onClick={handleForceCredit} 
                disabled={loading}
                className="w-full mt-3 py-1 h-8 text-xs sm:text-sm sm:h-9"
                variant="secondary"
              >
                Force Credit Update
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-1 pb-4 px-4 sm:px-6">
        <Button 
          onClick={handleManualCheck} 
          disabled={loading}
          className="w-full h-8 text-xs sm:text-sm py-1 sm:h-9"
          variant="outline"
        >
          <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Check Credits Now
        </Button>
        
        <div className="w-full text-xs text-gray-500 mt-1">
          <details>
            <summary className="cursor-pointer text-2xs sm:text-xs hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              Debug Info
            </summary>
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-2xs sm:text-xs font-mono overflow-x-auto">
              <p className="truncate">Session ID: {typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('session_id') : 'N/A'}</p>
              <p>Checks: {checkCount}</p>
              <p>Last Check: {new Date().toISOString()}</p>
            </div>
          </details>
        </div>
      </CardFooter>
    </Card>
  )
} 