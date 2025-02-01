'use client'

import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function PurchaseButton() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    setIsLoading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              price: 'price_xxx', // Replace with your Stripe price ID
              quantity: 1,
            },
          ],
          metadata: {
            userId: user.id,
          },
        }),
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePurchase}
      disabled={isLoading}
      className="bg-black text-white px-4 py-2 rounded"
    >
      {isLoading ? 'Loading...' : 'Subscribe'}
    </button>
  );
} 