import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    // Get the price ID from the subscription
    const priceId = subscription.items.data[0].price.id;
    
    // Define credit amounts for different price tiers
    const creditsByPriceId: Record<string, number> = {
      'price_1QaoC5ISdNa3NclOt5MQPbR3': 150,  // Replace with your actual price IDs
      'price_1QaojPISdNa3NclOEL5MFFsA': 300,
      // Add more price tiers as needed
    };

    // Update user credits based on the price ID
    await db.user.update({
      where: {
        id: session.metadata?.userId,
      },
      data: {
        credits: {
          increment: creditsByPriceId[priceId] || 0,
        },
      },
    });
  }

  return new NextResponse(null, { status: 200 });
} 