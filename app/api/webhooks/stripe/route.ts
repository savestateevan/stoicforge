import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia'
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log(`Webhook received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const creditsToAdd = parseInt(session.metadata?.credits || '100');

      if (!userId) {
        console.error('No userId in metadata');
        return new NextResponse('No userId in metadata', { status: 400 });
      }

      try {
        // Update user credits
        const updatedUser = await db.user.update({
          where: { id: userId },
          data: {
            credits: {
              increment: creditsToAdd
            }
          },
        });
        
        console.log(`Credits updated for user ${userId}. New balance: ${updatedUser.credits}`);
      } catch (dbError) {
        console.error('Database error:', dbError);
        return new NextResponse(
          'Database error: ' + (dbError as Error).message,
          { status: 500 }
        );
      }
    }

    // Handle subscription lifecycle events
    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      // You could update a subscription status in your database here
      console.log(`Subscription ${subscription.id} ${event.type.includes('created') ? 'created' : 'updated'}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      // Handle subscription cancellation
      console.log(`Subscription ${subscription.id} cancelled`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(
      'Webhook error: ' + (error as Error).message,
      { status: 400 }
    );
  }
}