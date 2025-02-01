import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json()
    
    const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId)
    return NextResponse.json(canceledSubscription)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}