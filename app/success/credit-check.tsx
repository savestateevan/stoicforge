'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, RefreshCw } from 'lucide-react'

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
    <Card className="mt-8 w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Credit Update Verification</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-sm">Initial Credits:</div>
              <div className="font-medium">{initialCredits}</div>
              
              <div className="text-sm">Current Credits:</div>
              <div className="font-medium">{currentCredits}</div>
              
              <div className="text-sm">Status:</div>
              <div className="font-medium">
                {creditsUpdated ? (
                  <span className="text-green-600">Credits Updated ✓</span>
                ) : (
                  <span className="text-amber-600">Pending Update...</span>
                )}
              </div>
              
              <div className="text-sm">Checks:</div>
              <div className="font-medium">{checkCount}</div>
            </div>
            
            {!creditsUpdated && checkCount >= 10 && (
              <div className="text-sm text-amber-600 pt-2">
                Credits may take a few minutes to update. Please check back later.
              </div>
            )}
            
            {!creditsUpdated && checkCount >= 5 && (
              <Button 
                onClick={handleForceCredit} 
                disabled={loading}
                className="w-full mt-4"
                variant="secondary"
              >
                Force Credit Update
              </Button>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          onClick={handleManualCheck} 
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Check Credits Now
        </Button>
        
        <div className="w-full text-xs text-gray-500 mt-2">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
              <p>Session ID: {typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('session_id') : 'N/A'}</p>
              <p>Checks: {checkCount}</p>
              <p>Last Check: {new Date().toISOString()}</p>
            </div>
          </details>
        </div>
      </CardFooter>
    </Card>
  )
} 