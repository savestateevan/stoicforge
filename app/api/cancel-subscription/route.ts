import { stripe } from '../../../lib/stripe';
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json()
    
    const canceledSubscription = await stripe.subscriptions.del(subscriptionId)
    return NextResponse.json(canceledSubscription)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}