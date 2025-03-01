import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia'
})

// Define credits for each plan
const PLAN_CREDITS = {
  'price_1QaoC5ISdNa3NclOt5MQPbR3': 100, // Beginner plan
  'price_1QaojPISdNa3NclOEL5MFFsA': 250  // Pro plan
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid items format' },
        { status: 400 }
      );
    }

    // Determine credits based on the plan
    const priceId = items[0]?.priceId;
    const creditsToAdd = PLAN_CREDITS[priceId as keyof typeof PLAN_CREDITS] || 100;

    console.log(`Creating checkout session for user ${userId} with ${creditsToAdd} credits`);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price: item.priceId,
        quantity: item.quantity || 1,
      })),
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      metadata: {
        userId: userId,
        credits: creditsToAdd.toString(),
      },
      // Also store the customer in Stripe
      customer_creation: 'always',
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}