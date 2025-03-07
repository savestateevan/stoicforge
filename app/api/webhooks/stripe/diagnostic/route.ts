import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Check environment variables
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    // Basic environment checks
    const diagnostics = {
      webhookSecretPresent: !!webhookSecret,
      webhookSecretFormat: webhookSecret?.startsWith('whsec_') ? 'valid' : 'invalid',
      stripeKeyPresent: !!stripeKey,
      stripeApiMode: stripeKey?.startsWith('sk_test_') ? 'TEST' : 'LIVE',
      timestamp: new Date().toISOString(),
    };
    
    // Only try to fetch webhook config if we have a valid API key
    if (stripeKey) {
      try {
        const stripe = new Stripe(stripeKey, {
          apiVersion: '2025-02-24.acacia'
        });
        
        // Try to list webhooks to check API key validity and see registered endpoints
        const webhooks = await stripe.webhookEndpoints.list({limit: 5});
        
        // Add webhook information to diagnostics
        // Update the diagnostics type to include the new property
        (diagnostics as any)['registeredWebhooks'] = webhooks.data.map(webhook => ({
          id: webhook.id,
          url: webhook.url,
          status: webhook.status,
          enabledEvents: webhook.enabled_events,
          livemode: webhook.livemode,
        }));
        
        (diagnostics as any)['stripeApiWorking'] = true;
      } catch (stripeError) {
        (diagnostics as any)['stripeApiWorking'] = false;
        (diagnostics as any)['stripeApiError'] = stripeError instanceof Error ? stripeError.message : 'Unknown error';
      }
    }
    
    return NextResponse.json(diagnostics);
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 