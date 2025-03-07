'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast' 
import { useUser } from '@clerk/nextjs'

// Log if the key is available (without revealing the actual key)
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
console.log('Stripe key available:', !!publishableKey)
console.log('Stripe mode:', publishableKey?.startsWith('pk_test_') ? 'TEST MODE' : 'LIVE MODE')

// Make sure to replace with your actual Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutButtonProps {
  items: Array<{
    priceId: string;
    quantity?: number;
  }>;
  buttonText: string;
  className?: string;
}

export function StripeCheckoutButton({ items, buttonText, className }: StripeCheckoutButtonProps) {
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make a purchase",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    console.log('Starting checkout process for user:', user.id)
    console.log('Items:', items)

    try {
      // First check if Stripe is loaded
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load. Check your publishable key.')
      }

      console.log('Stripe loaded successfully')

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items,
        }),
      })

      console.log('API Response status:', response.status)
      
      // Add error logging to help debug the response
      const responseText = await response.text()
      console.log('API Response text:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
        console.log('Parsed response data:', data)
      } catch (e) {
        console.error('Failed to parse JSON response:', e)
        throw new Error(`Invalid JSON response: ${responseText}`)
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (!data.sessionId) {
        throw new Error('No sessionId returned from the API')
      }

      console.log('Redirecting to Stripe checkout with session ID:', data.sessionId)

      const { error } = await stripe.redirectToCheckout({ 
        sessionId: data.sessionId 
      })

      if (error) {
        console.error('Stripe redirect error:', error)
        throw error
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast({
        title: "Error",
        description: error.message || 'Failed to initiate checkout',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Show test mode indicator if we're in test mode
  const isTestMode = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')
  
  return (
    <div className="flex flex-col items-center gap-2">
      <Button 
        onClick={handleCheckout} 
        disabled={isLoading} 
        className={`w-full ${className || ''}`}
      >
        {isLoading ? 'Loading...' : buttonText}
      </Button>
      {isTestMode && (
        <div className="text-xs text-center text-muted-foreground">
          Test Mode - Use Stripe test card: 4242 4242 4242 4242
        </div>
      )}
    </div>
  )
}