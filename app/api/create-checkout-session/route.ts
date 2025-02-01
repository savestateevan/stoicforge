import { getAuth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { absoluteUrl } from '@/lib/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})



export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  const { items } = await req.json();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: items,
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      metadata: {
        userId: userId,
        credits: '150',
      }
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}