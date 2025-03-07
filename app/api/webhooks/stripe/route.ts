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
  const signature = headers().get('stripe-signature')!;

  console.log('Received webhook with signature:', signature ? 'present' : 'missing');

  let event: Stripe.Event;

  try {
    console.log("WEBHOOK ENV CHECK:", {
      webhookSecretDefined: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length,
      dbConnected: !!db
    });

    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    console.log(`Webhook received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId || session.client_reference_id;

      if (!userId) {
        console.error('Could not identify user from webhook data!');
        return new Response('User identification failed', { status: 400 });
      }

      const creditsToAdd = parseInt(session.metadata?.credits || '0', 10);
      console.log(`Adding ${creditsToAdd} credits to user ${userId}`);

      // First update user credits
      await db.user.update({
        where: { id: userId },
        data: {
          credits: { increment: creditsToAdd },
        },
      });

      // Then update or create UserSubscription record
      await db.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: session.metadata?.priceId,
          stripeCurrentPeriodEnd: session.metadata?.currentPeriodEnd 
            ? new Date(parseInt(session.metadata.currentPeriodEnd) * 1000) 
            : undefined,
        },
        update: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          stripePriceId: session.metadata?.priceId,
          stripeCurrentPeriodEnd: session.metadata?.currentPeriodEnd 
            ? new Date(parseInt(session.metadata.currentPeriodEnd) * 1000) 
            : undefined,
        }
      });

      console.log(`Credits updated successfully for user ${userId}`);
    }

    // Handle subscription lifecycle events
    if (event.type === 'customer.subscription.created' || 
        event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find the userId from subscription metadata
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        // Update subscription information
        await db.userSubscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
          update: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          }
        });
        
        // Update user subscription status
        await db.user.update({
          where: { id: userId },
          data: {
            isActiveSubscriber: subscription.status === 'active',
            subscriptionType: subscription.status === 'active' ? 'PRO' : 'FREE',
            userSubscriptionId: subscription.id,
          }
        });
      }
      
      console.log(`Subscription ${subscription.id} ${event.type.includes('created') ? 'created' : 'updated'}`);
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find the userId from subscription metadata
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        // Update user subscription status
        await db.user.update({
          where: { id: userId },
          data: {
            isActiveSubscriber: false,
            subscriptionType: 'FREE',
          }
        });
      }
      
      console.log(`Subscription ${subscription.id} cancelled`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error instanceof Error ? error.message : String(error));
    console.error('Webhook processing error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return new Response('Webhook processing error', { status: 500 });
  }
}