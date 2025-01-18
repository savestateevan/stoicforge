import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { absoluteUrl } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const { items } = await req.json()

    if (!items?.length) {
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      )
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: items.map((item: { priceId: string; quantity: number }) => ({
        price: item.priceId,
        quantity: item.quantity,
      })),
      success_url: absoluteUrl('/success?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: absoluteUrl('/pricing'),
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: error?.statusCode || 500 }
    )
  }
}