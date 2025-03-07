'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { CreditVerifier } from './credit-check'

// Check if we're in Stripe test mode
const isTestMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkSession = async () => {
      if (!sessionId) {
        setStatus('success')
        return
      }

      try {
        // You could create an API endpoint to verify the session if needed
        // For now, we'll just assume success but in a real app you might want to
        // check that the session exists and is valid
        setTimeout(() => {
          setStatus('success')
        }, 1500)
      } catch (error) {
        console.error('Error checking session:', error)
        setStatus('error')
        setMessage('There was a problem processing your payment. Please contact support.')
      }
    }

    checkSession()
  }, [sessionId])

  return (
    <>
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="pb-5">
          <div className="flex items-center justify-center mb-4">
            {status === 'loading' ? (
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 animate-spin" />
            ) : status === 'success' ? (
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 text-red-500">❌</div>
            )}
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            {status === 'loading' 
              ? 'Processing Payment...' 
              : status === 'success' 
                ? 'Payment Successful!' 
                : 'Payment Issue'}
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base mt-1">
            {status === 'loading' 
              ? 'Please wait while we confirm your payment' 
              : status === 'success' 
                ? 'Thank you for upgrading your plan' 
                : message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-center text-sm sm:text-base">
                Your account has been upgraded and credits will appear in your account shortly.
              </p>
              
              {isTestMode && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md text-amber-700 dark:text-amber-400 text-xs sm:text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Test Mode:</strong> This is a test payment. No actual charges were made. 
                    In a production environment, real payments would be processed.
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-3 sm:gap-4 pt-1 pb-5">
          {status !== 'loading' && (
            <>
              <Button asChild size="sm" className="text-sm sm:text-base px-3 py-1 h-9">
                <Link href="/">Home</Link>
              </Button>
              {status === 'success' && (
                <Button asChild variant="outline" size="sm" className="text-sm sm:text-base px-3 py-1 h-9">
                  <Link href="/chat">Start Chatting</Link>
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
      
      {status === 'success' && <CreditVerifier />}
    </>
  )
}

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
            <CardTitle className="text-xl font-bold text-center">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  )
}