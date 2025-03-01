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
    console.log("WEBHOOK ENV CHECK:", {
      webhookSecretDefined: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length,
      dbConnected: !!db
    });

    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log(`Webhook received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Log all possible user identifiers
      console.log('Webhook user identifiers:', {
        client_reference_id: session.client_reference_id,
        metadata_userId: session.metadata?.userId,
        customer_id: session.customer,
        payment_intent: session.payment_intent
      });
      
      // Try multiple methods to find the user
      let userId = null;
      
      // Method 1: client_reference_id (best practice)
      if (session.client_reference_id) {
        userId = session.client_reference_id;
        console.log('Using client_reference_id for user lookup:', userId);
      } 
      // Method 2: metadata
      else if (session.metadata?.userId) {
        userId = session.metadata.userId;
        console.log('Using metadata.userId for user lookup:', userId);
      }
      // Method 3: Look up by Stripe customer ID if you store it
      else if (session.customer) {
        console.log('Looking up user by customer ID:', session.customer);
        const userSubscription = await db.userSubscription.findUnique({
          where: { stripeCustomerId: session.customer as string }
        });
        
        if (userSubscription) {
          userId = userSubscription.userId;
          console.log('Found user by customer ID:', userId);
        }
      }
      
      if (!userId) {
        console.error('Could not identify user from webhook data!');
        // Return 200 so Stripe won't retry - log this issue for manual resolution
        return new Response(JSON.stringify({ 
          error: 'Could not identify user', 
          received: true 
        }), { status: 200 });
      }
      
      // Now try to find and update the user
      console.log(`Attempting to update credits for user ${userId}`);
      
      // Get current credits first
      const currentUser = await db.user.findUnique({
        where: { id: userId }
      });
      
      if (!currentUser) {
        console.error(`User ${userId} not found in database!`);
        return new Response(JSON.stringify({ 
          error: 'User not found in database', 
          received: true 
        }), { status: 200 });
      }
      
      console.log(`Found user ${userId}, current credits: ${currentUser.credits}`);
      
      // Determine number of credits to add based on the price ID
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      console.log('Line items:', lineItems.data);
      
      let creditsToAdd = 100; // Default fallback
      // Your logic to determine credits based on the product/price
      
      // Update the user's credits
      const updatedUser = await db.user.update({
        where: { id: userId },
        data: {
          credits: { increment: creditsToAdd }
        }
      });
      
      console.log(`Successfully updated user ${userId}, new credits: ${updatedUser.credits}`);
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

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
}