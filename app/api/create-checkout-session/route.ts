import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic';

// Log the Stripe key configuration (without revealing the actual key)
console.log('Stripe API key configured:', !!process.env.STRIPE_SECRET_KEY);
console.log('Stripe mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST MODE' : 'LIVE MODE');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia' // Using the correct API version as required by the project
})

// Define test prices for local development
// Make sure these match the price IDs in app/pricing/page.tsx
const TEST_PRICES = {
  BEGINNER: 'price_1QxhZBISdNa3NclOyo8PTgKN', // Beginner Plan
  PRO: 'price_1QxhaQISdNa3NclOFTVFaH7p'       // Pro Plan
}

// Define credits for each plan
const PLAN_CREDITS = {
  [TEST_PRICES.BEGINNER]: 100, // Beginner plan (test)
  [TEST_PRICES.PRO]: 250,      // Pro plan (test)
  'price_1QaoC5ISdNa3NclOt5MQPbR3': 100, // Beginner plan
  'price_1QaojPISdNa3NclOEL5MFFsA': 250  // Pro plan
}

export async function POST(req: NextRequest) {
  console.log('Received checkout request');
  
  const { userId } = await auth();
  console.log('User ID from auth:', userId);
  
  if (!userId) {
    console.log('User not authenticated');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { items } = await req.json();
    console.log('Received items:', items);

    if (!Array.isArray(items) || items.length === 0) {
      console.log('Invalid items format');
      return NextResponse.json(
        { error: 'Invalid items format' },
        { status: 400 }
      );
    }

    // Determine credits based on the plan
    const priceId = items[0]?.priceId;
    console.log('Price ID:', priceId);
    
    const creditsToAdd = PLAN_CREDITS[priceId as keyof typeof PLAN_CREDITS] || 100;
    console.log(`Creating checkout session for user ${userId} with ${creditsToAdd} credits`);

    // For testing purposes, add more debug output
    console.log('Current environment:', process.env.NODE_ENV);
    console.log('Success URL:', `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price: item.priceId,
        quantity: item.quantity || 1,
      })),
      mode: 'subscription',
      
      client_reference_id: userId,
      metadata: {
        userId: userId,
        credits: creditsToAdd.toString(),
        priceId: items[0]?.priceId,
        plan: items[0]?.priceId === TEST_PRICES.BEGINNER ? 'BEGINNER' : 'PRO',
        source: 'stoicforge-checkout'
      },
      
      billing_address_collection: 'auto',
      
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      
      subscription_data: {
        metadata: {
          userId: userId,
          source: 'stoicforge-subscription'
        }
      },
      
      allow_promotion_codes: true,
    });

    console.log('Created session:', session.id, 'with metadata:', session.metadata);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}