import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Log the Stripe API key configuration (without revealing the actual key)
console.log('Stripe API key configured for webhooks:', !!process.env.STRIPE_SECRET_KEY);
console.log('Stripe mode for webhooks:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST MODE' : 'LIVE MODE');
console.log('Stripe webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia'
});

// This tells Next.js to always process this route dynamically
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature')!;

  console.log('Received webhook with signature:', signature ? 'present' : 'missing');

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

      console.log(`Processing checkout.session.completed for user ${userId} with ${creditsToAdd} credits`);
      console.log('Session details:', {
        id: session.id,
        customerId: session.customer,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
      });

      if (!userId) {
        console.error('No userId in metadata');
        return new NextResponse('No userId in metadata', { status: 400 });
      }

      try {
        // First, check if the user exists
        const existingUser = await db.user.findUnique({
          where: { id: userId },
          select: { id: true, credits: true }
        });
        
        console.log('Existing user found?', !!existingUser, existingUser ? `Current credits: ${existingUser.credits}` : 'User not found in database');
        
        if (!existingUser) {
          console.error(`User with ID ${userId} not found in database. This ID might be from an auth provider but not synced to your database.`);
          
          // Option 1: Return an error
          // return new NextResponse(`User with ID ${userId} not found in database`, { status: 404 });
          
          // Option 2: Create the user first if they don't exist
          console.log(`Creating new user with ID ${userId}`);
          await db.user.create({
            data: {
              id: userId,
              email: session.customer_details?.email || `${userId}@example.com`,
              credits: creditsToAdd
            }
          });
          console.log(`Created new user with ID ${userId} and ${creditsToAdd} credits`);
          return new NextResponse(null, { status: 200 });
        }
        
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
      console.log('Subscription details:', {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      // Handle subscription cancellation
      console.log(`Subscription ${subscription.id} cancelled`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    console.error('Error details:', (error as Error).message);
    // If it's a webhook signature verification error, log more details
    if ((error as Error).message.includes('signature')) {
      console.error('Signature verification failed. Check your STRIPE_WEBHOOK_SECRET.');
      console.error('Make sure you are using the correct webhook secret for the environment (test/live)');
    }
    return new NextResponse(
      'Webhook error: ' + (error as Error).message,
      { status: 400 }
    );
  }
}