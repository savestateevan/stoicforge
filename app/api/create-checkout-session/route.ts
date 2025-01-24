import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { absoluteUrl } from '@/lib/utils'
import { getAuth } from "@clerk/nextjs/server"

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    const { items } = await req.json()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

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
      metadata: {
        userId: userId, // Get this from your auth
      },
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