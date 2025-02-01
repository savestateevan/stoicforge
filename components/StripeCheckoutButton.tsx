'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast' 
import { useUser } from '@clerk/nextjs'

// Make sure to replace with your actual Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutButtonProps {
  items: Array<{
    priceId: string;
    quantity?: number;
  }>;
  buttonText: string;
}

export function StripeCheckoutButton({ items, buttonText }: StripeCheckoutButtonProps) {
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

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items,
          metadata: {
            userId: user.id
          }
        }),
      })

      // Add error logging to help debug the response
      const responseText = await response.text()
      console.log('API Response:', responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`)
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({ 
        sessionId: data.sessionId 
      })

      if (error) {
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
  
  return (
    <Button onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? 'Loading...' : buttonText}
    </Button>
  )
}