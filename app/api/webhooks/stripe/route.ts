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
  console.log('💰 STRIPE WEBHOOK: Processing started');
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  console.log('💰 STRIPE WEBHOOK: Received webhook with signature:', signature ? signature.substring(0, 10) + '...' : 'missing');

  let event: Stripe.Event;

  try {
    console.log("💰 STRIPE WEBHOOK ENV CHECK:", {
      webhookSecretDefined: !!process.env.STRIPE_WEBHOOK_SECRET,
      webhookSecretLength: process.env.STRIPE_WEBHOOK_SECRET?.length,
      stripeKeyDefined: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyType: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST' : 'LIVE',
      dbConnected: !!db
    });

    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);

    console.log(`💰 STRIPE WEBHOOK: Event constructed successfully: ${event.type} (${event.id})`);

    // Handle various checkout and subscription events that should add credits
    if (event.type === 'checkout.session.completed' || 
        event.type === 'customer.subscription.created') {
      
      // Get the appropriate object based on event type
      const session = event.data.object as any;
      console.log(`💰 STRIPE WEBHOOK: Processing ${event.type}`, {
        id: session.id,
        customer: session.customer,
        subscription: session.subscription || session.id,
        metadata: session.metadata
      });

      // Extract user ID from metadata or client reference
      const userId = session.metadata?.userId || 
                    session.client_reference_id || 
                    (session.customer ? await findUserIdFromCustomer(session.customer as string) : null);

      if (!userId) {
        console.error('💰 STRIPE WEBHOOK ERROR: Could not identify user from webhook data!');
        console.error('💰 STRIPE WEBHOOK ERROR: Session data:', JSON.stringify(session, null, 2));
        return new Response('User identification failed', { status: 400 });
      }

      // Try to get user first to check if they exist
      try {
        const existingUser = await db.user.findUnique({
          where: { id: userId }
        });
        
        if (!existingUser) {
          console.error(`💰 STRIPE WEBHOOK ERROR: User ${userId} not found in database!`);
          return new Response('User not found', { status: 404 });
        }
        
        console.log(`💰 STRIPE WEBHOOK: Found user ${userId}, current credits: ${existingUser.credits}`);
      } catch (dbError) {
        console.error('💰 STRIPE WEBHOOK ERROR: Failed to check if user exists:', dbError);
        return new Response('Database error while checking user', { status: 500 });
      }

      // Parse credits carefully to avoid NaN issues
      let creditsToAdd = 0;
      let planType = '';
      
      try {
        // First try to get directly from metadata
        if (session.metadata?.credits) {
          const parsed = parseInt(session.metadata.credits, 10);
          if (!isNaN(parsed) && parsed > 0) {
            creditsToAdd = parsed;
            console.log(`💰 STRIPE WEBHOOK: Using credits from metadata: ${creditsToAdd}`);
          }
        }
        
        // If we couldn't get credits from metadata, try to determine from the plan/price
        if (creditsToAdd <= 0) {
          // Try to get plan info
          if (session.metadata?.plan) {
            planType = session.metadata.plan.toUpperCase();
          } else if (session.metadata?.priceId) {
            // Check price ID patterns
            planType = session.metadata.priceId.includes('QaojP') ? 'PRO' : 'BEGINNER';
          } else if (session.line_items?.data?.[0]?.price?.id) {
            // Try to extract from line items if available
            const priceId = session.line_items.data[0].price.id;
            planType = priceId.includes('QaojP') ? 'PRO' : 'BEGINNER';
          } else if (event.type === 'customer.subscription.created' && session.items?.data?.[0]?.price?.id) {
            // For subscription events
            const priceId = session.items.data[0].price.id;
            planType = priceId.includes('QaojP') ? 'PRO' : 'BEGINNER';
          }
          
          // Set credits based on plan type
          creditsToAdd = planType === 'PRO' ? 250 : 100;
          console.log(`💰 STRIPE WEBHOOK: Using credits based on plan type (${planType}): ${creditsToAdd}`);
        }
      } catch (parseError) {
        console.error('💰 STRIPE WEBHOOK ERROR: Failed to parse credits:', parseError);
        // Default to 100 credits if parsing fails
        creditsToAdd = 100;
        console.log(`💰 STRIPE WEBHOOK: Using default credits: ${creditsToAdd}`);
      }
      
      // Force minimum credits to avoid 0 credit updates
      if (creditsToAdd <= 0) {
        creditsToAdd = 100;
        console.log(`💰 STRIPE WEBHOOK: Forcing minimum credits: ${creditsToAdd}`);
      }
      
      console.log(`💰 STRIPE WEBHOOK: Adding ${creditsToAdd} credits to user ${userId}`);

      try {
        // First update user credits
        const userUpdate = await db.user.update({
          where: { id: userId },
          data: {
            credits: { increment: creditsToAdd },
          },
        });
        
        console.log(`💰 STRIPE WEBHOOK: Updated user credits`, {
          userId,
          previousCredits: userUpdate.credits - creditsToAdd,
          newCreditBalance: userUpdate.credits,
          added: creditsToAdd
        });
      } catch (updateError) {
        console.error('💰 STRIPE WEBHOOK ERROR: Failed to update user credits:', updateError);
        return new Response('Failed to update credits', { status: 500 });
      }

      try {
        // Then update or create UserSubscription record
        const subscription = await db.userSubscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string || undefined,
            stripePriceId: session.metadata?.priceId,
            stripeCurrentPeriodEnd: session.metadata?.currentPeriodEnd 
              ? new Date(parseInt(session.metadata.currentPeriodEnd) * 1000) 
              : undefined,
          },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string || undefined,
            stripePriceId: session.metadata?.priceId,
            stripeCurrentPeriodEnd: session.metadata?.currentPeriodEnd 
              ? new Date(parseInt(session.metadata.currentPeriodEnd) * 1000) 
              : undefined,
          }
        });
        
        console.log(`💰 STRIPE WEBHOOK: Updated user subscription record`, {
          userId,
          subscriptionId: subscription.id,
          stripeCustomerId: subscription.stripeCustomerId
        });
      } catch (subscriptionError) {
        console.error('💰 STRIPE WEBHOOK ERROR: Failed to update subscription record, but credits were updated:', subscriptionError);
        // Continue processing since credits were already updated
      }

      console.log(`💰 STRIPE WEBHOOK: Credits updated successfully for user ${userId}`);
    }

    // Handle subscription-specific events
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`💰 STRIPE WEBHOOK: Subscription ${event.type}`, {
        subscriptionId: subscription.id,
        status: subscription.status,
        metadata: subscription.metadata
      });
      
      // Find the userId from subscription metadata
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        try {
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
          
          console.log(`💰 STRIPE WEBHOOK: Updated subscription info for user ${userId}`);
        } catch (subError) {
          console.error(`💰 STRIPE WEBHOOK ERROR: Failed to process subscription ${subscription.id}:`, subError);
        }
      } else {
        console.error(`💰 STRIPE WEBHOOK WARNING: No userId found in subscription metadata`, {
          subscriptionId: subscription.id
        });
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`💰 STRIPE WEBHOOK: Subscription cancelled`, {
        subscriptionId: subscription.id,
        metadata: subscription.metadata
      });
      
      // Find the userId from subscription metadata
      const userId = subscription.metadata?.userId;
      
      if (userId) {
        try {
          // Update user subscription status
          await db.user.update({
            where: { id: userId },
            data: {
              isActiveSubscriber: false,
              subscriptionType: 'FREE',
            }
          });
          console.log(`💰 STRIPE WEBHOOK: Updated subscription status for user ${userId} to FREE`);
        } catch (cancelError) {
          console.error(`💰 STRIPE WEBHOOK ERROR: Failed to process subscription cancellation:`, cancelError);
        }
      } else {
        console.error(`💰 STRIPE WEBHOOK WARNING: No userId found in cancelled subscription metadata`);
      }
    }

    console.log('💰 STRIPE WEBHOOK: Processing completed successfully');
    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('💰 STRIPE WEBHOOK ERROR:', error instanceof Error ? error.message : String(error));
    console.error('💰 STRIPE WEBHOOK ERROR STACK:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Try to log the raw body for debugging
    try {
      console.error('💰 STRIPE WEBHOOK ERROR: Raw signature header:', signature);
      console.error('💰 STRIPE WEBHOOK ERROR: Raw body length:', body.length);
      console.error('💰 STRIPE WEBHOOK ERROR: Raw body preview:', body.substring(0, 200) + '...');
    } catch (logError) {
      console.error('💰 STRIPE WEBHOOK ERROR: Could not log raw data:', logError);
    }
    
    return new Response(`Webhook processing error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

// Helper function to find userId from customer ID
async function findUserIdFromCustomer(customerId: string): Promise<string | null> {
  try {
    const userSubscription = await db.userSubscription.findUnique({
      where: { stripeCustomerId: customerId },
      select: { userId: true }
    });
    
    return userSubscription?.userId || null;
  } catch (error) {
    console.error('Error finding user from customer ID:', error);
    return null;
  }
}