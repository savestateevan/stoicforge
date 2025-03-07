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
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleManualCheck} 
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Check Credits Now
        </Button>
      </CardFooter>
    </Card>
  )
} 